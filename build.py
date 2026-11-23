#!/usr/bin/env python3
"""Build the site: src/template.html + src/mods/* + data/*.json -> dist/index.html

No dependencies beyond the Python standard library. Run: python3 build.py
"""
import glob, json, os

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
DATA = os.path.join(ROOT, 'data')
OUT = os.path.join(ROOT, 'dist')

# Order of the keys in the page's DATA object. One file per key in data/.
KEYS = ['tests', 'era', 'yearl', 'ysrc', 'langs', 'isoLang', 'cityLang', 'st', 'cnt', 'iso',
        'neAlias', 'cities', 'regions', 'bands', 'nodes', 'layout', 'scores',
        'playlists', 'known', 'done', 'indoc', 'edges', 'tier', 'trad', 'tradOf',
        'ends', 'defs', 'notes', 'method']

HEAD = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        '<meta name="description" content="Travel to a place and a year and hear what people there were listening to.">\n'
        '<style>:root{color-scheme:light;padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}'
        'body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>\n')


def read(path):
    with open(path, encoding='utf-8') as f:
        return f.read()


def main():
    data = {k: json.loads(read(os.path.join(DATA, k + '.json'))) for k in KEYS}

    # Modules are added in file-name order. Each script module runs in its own
    # function so a fault in one module cannot stop the others.
    mods = sorted(glob.glob(os.path.join(SRC, 'mods', '*.js')) + glob.glob(os.path.join(SRC, 'mods', '*.css')))
    js = '\n'.join(
        '/* ---- module ' + os.path.basename(m) + ' ---- */\n;(function(){\ntry{\n' + read(m)
        + '\n}catch(e){ console.error("module ' + os.path.basename(m) + '",e); }\n})();'
        for m in mods if m.endswith('.js'))
    css = '\n'.join(read(m) for m in mods if m.endswith('.css'))

    page = (read(os.path.join(SRC, 'template.html'))
            .replace('/*@MODS@*/', js)
            .replace('/*@MODCSS@*/', css)
            .replace('__DATA__', json.dumps(data, ensure_ascii=False, separators=(',', ':'))))

    # The template starts with <title> and <style>; they belong in <head>.
    i = page.index('</style>') + len('</style>')
    html = HEAD + page[:i] + '\n</head>\n<body>\n' + page[i:] + '\n</body>\n</html>\n'

    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(html)
    print('dist/index.html', len(html.encode('utf-8')), 'bytes')


if __name__ == '__main__':
    main()
