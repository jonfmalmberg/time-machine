#!/usr/bin/env python3
"""Build the site: src/template.html + src/mods/* + data/ -> dist/index.html

No dependencies beyond the Python standard library. Run: python3 build.py
The page still reads the data shape of 23 November 2026; tools/legacy_data.py makes it from the
data model's files (docs/proposals/2026-11-23-schema.md).
"""
import glob
import shutil, json, os, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
DATA = os.path.join(ROOT, 'data')
OUT = os.path.join(ROOT, 'dist')

sys.path.insert(0, os.path.join(ROOT, 'tools'))
from legacy_data import legacy_data

HEAD = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        '<meta name="description" content="Explore the world&#39;s music by place and time, and find sounds you would never have heard.">\n'
        # Link previews and icons. The Worker (src/worker/index.js) rewrites the title, description, address and
        # image address for a shared view; these are what a plain visit shows.
        '<meta property="og:site_name" content="World Music Time Machine">\n'
        '<meta property="og:type" content="website">\n'
        '<meta property="og:title" content="World Music Time Machine">\n'
        '<meta property="og:description" content="Explore the world&#39;s music by place and time, and find sounds you would never have heard.">\n'
        '<meta property="og:url" content="">\n'
        '<meta property="og:image" content="/share.png">\n'
        '<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
        '<meta name="twitter:card" content="summary_large_image">\n'
        '<meta name="twitter:title" content="World Music Time Machine">\n'
        '<meta name="twitter:description" content="Explore the world&#39;s music by place and time, and find sounds you would never have heard.">\n'
        '<meta name="twitter:image" content="/share.png">\n'
        '<link rel="icon" href="/icon.svg" type="image/svg+xml">\n'
        '<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n'
        '<meta name="apple-mobile-web-app-title" content="Time Machine">\n'
        '<meta name="theme-color" content="#f2f2f7" media="(prefers-color-scheme: light)">\n'
        '<meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)">\n'
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

    # The words for a link ("Canada · 1980–2020 · Country") come from one function shared with the Worker.
    title_fn = read(os.path.join(SRC, 'worker', 'title.js')).replace('export function', 'function')
    js = 'var LINKTITLE=(function(){\n' + title_fn + '\nreturn linkTitle;\n})();\n' + js

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

    # Names the Worker needs to describe a shared link, and the icon and preview image.
    def rows(name):
        return [json.loads(l.rstrip(',')) for l in read(os.path.join(DATA, name)).splitlines() if l.strip().startswith('{')]
    names = {'t1': 2026,
             'cty': {r['id']: r['name'] for r in rows('countries.json')},
             'reg': {r['id']: r['name'] for r in rows('regions.json')},
             'band': {r['id']: r['name'] for r in rows('families.json')},
             'trad': {r['id']: r['name'] for r in rows('traditions.json')},
             'mov': {r['id']: r['name'] for r in rows('genres.json')}}
    with open(os.path.join(OUT, 'names.json'), 'w', encoding='utf-8') as f:
        json.dump(names, f, ensure_ascii=False, separators=(',', ':'))
    for p in sorted(glob.glob(os.path.join(SRC, 'static', '*'))):
        shutil.copy(p, os.path.join(OUT, os.path.basename(p)))


if __name__ == '__main__':
    main()
