#!/usr/bin/env python3
"""Run the site on this computer: build it, serve it, and rebuild whenever a source file changes.

    python3 serve.py            then open http://localhost:8000
    python3 serve.py 8080       to use another port

Standard-library Python only. Nothing is uploaded and no Cloudflare build is used.
A local copy talks to the dev database (see src/mods/04_config.js). Signing in with Google
works here once http://localhost:8000/** is on the dev project's list of allowed redirect
addresses in Supabase (Authentication > URL Configuration).
Stop with Ctrl+C.
"""
import functools, http.server, os, sys, threading, time
import build

ROOT = os.path.dirname(os.path.abspath(__file__))
WATCH = [os.path.join(ROOT, d) for d in ('src', 'data')]


def stamp():
    """Newest change time of any source or data file."""
    latest = 0
    for top in WATCH:
        for folder, _, files in os.walk(top):
            for name in files:
                try:
                    latest = max(latest, os.path.getmtime(os.path.join(folder, name)))
                except OSError:
                    pass
    return latest


def rebuild_on_change():
    seen = stamp()
    while True:
        time.sleep(1)
        now = stamp()
        if now != seen:
            seen = now
            try:
                build.main()
                print('rebuilt', time.strftime('%H:%M:%S'), '- reload the page')
            except Exception as e:          # a half-saved file must not stop the server
                print('build failed:', e)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def end_headers(self):                  # always serve the newest build
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    build.main()
    threading.Thread(target=rebuild_on_change, daemon=True).start()
    handler = functools.partial(Quiet, directory=os.path.join(ROOT, 'dist'))
    # 127.0.0.1 only: the copy is reachable from this computer and nowhere else.
    with http.server.ThreadingHTTPServer(('127.0.0.1', port), handler) as server:
        print('Serving http://localhost:%d  (Ctrl+C to stop)' % port)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print()


if __name__ == '__main__':
    main()
