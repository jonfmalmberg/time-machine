#!/usr/bin/env python3
"""Build the site: src/template.html + src/mods/* + data/ -> dist/index.html

No dependencies beyond the Python standard library. Run: python3 build.py
The page still reads the data shape of 23 November 2026; tools/legacy_data.py makes it from the
data model's files (docs/proposals/2026-11-23-schema.md).
"""
import glob, json, os, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
DATA = os.path.join(ROOT, 'data')
OUT = os.path.join(ROOT, 'dist')

sys.path.insert(0, os.path.join(ROOT, 'tools'))
from legacy_data import legacy_data

HEAD = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        '<meta name="description" content="Travel to a place and a year and hear what people there were listening to.">\n'
        '<style>:root{color-scheme:light;padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}'
        'body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>\n')


def read(path):
    with open(path, encoding='utf-8') as f:
        return f.read()


def main():
    data = legacy_data(DATA)

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
