"""Serve Athlete OS over HTTPS for phone access (self-signed cert)."""
import socket
import ssl
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CERT_DIR = ROOT / '.certs'
CERT_FILE = CERT_DIR / 'server.pem'
KEY_FILE = CERT_DIR / 'server.key'


def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except OSError:
        return '127.0.0.1'


def ensure_cert(local_ip):
    CERT_DIR.mkdir(exist_ok=True)
    if CERT_FILE.exists() and KEY_FILE.exists():
        return

    import trustme

    ca = trustme.CA()
    server_cert = ca.issue_cert('localhost', local_ip, '127.0.0.1')
    server_cert.private_key_pem.write_to_path(KEY_FILE)
    server_cert.cert_chain_pems[0].write_to_path(CERT_FILE)
    print(f'Created self-signed certificate for localhost and {local_ip}', flush=True)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3443
    local_ip = get_local_ip()
    ensure_cert(local_ip)

    handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(('0.0.0.0', port), handler)

    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(certfile=str(CERT_FILE), keyfile=str(KEY_FILE))
    server.socket = context.wrap_socket(server.socket, server_side=True)

    print()
    print('=' * 44)
    print('  ATHLETE OS — HTTPS (for phone)')
    print('=' * 44)
    print()
    print('  On your phone (same Wi-Fi), open:')
    print(f'    https://{local_ip}:{port}')
    print()
    print('  Your browser will warn the certificate is not trusted.')
    print('  That is expected — tap Advanced / Show Details, then proceed.')
    print()
    print('  If Chrome says "secure connection" error on http://, use https:// above.')
    print('  Press Ctrl+C to stop.')
    print('=' * 44)
    print()
    sys.stdout.flush()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nStopped.')
        server.server_close()


if __name__ == '__main__':
    main()
