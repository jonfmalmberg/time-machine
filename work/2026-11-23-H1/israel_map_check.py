#!/usr/bin/env python3
"""H1: which genre dots the map draws in Israel, by projection, zoom and year.
Run from the repository root after python3 build.py:
   python3 work/2026-11-23-H1/israel_map_check.py dist/index.html <folder for a screenshot>
Prints, for each setting, the map's own hit list (MAPHITS) inside Israel. Needs Python Playwright with Chromium."""
import os,sys,json
from playwright.sync_api import sync_playwright
PAGE=os.path.abspath(sys.argv[1]); OUT=sys.argv[2]
with sync_playwright() as pw:
    b=pw.chromium.launch(); p=b.new_page(viewport={'width':1280,'height':800})
    errs=[]; p.on('pageerror',lambda e:errs.append(str(e)))
    p.route('**/*', lambda r: r.continue_() if r.request.url.startswith('file:') else r.abort())
    p.goto('file://'+PAGE); p.wait_for_timeout(1000)
    p.click('#tab-map'); p.wait_for_timeout(800)
    res={}
    for proj in ['flat','globe']:
      for ppd in [4,8,20,60,150]:
        for y in [1940,1965,1980,2026]:
            r=p.evaluate("""([proj,ppd,y])=>{ MV.proj=proj; setYear(y); stCompute(); setMapCenter([35.0,31.9],ppd); fanKey=null; mapDraw(performance.now());
              const [x0,y0]=project(34.2,33.4),[x1,y1]=project(35.9,29.4);
              return MAPHITS.filter(h=>h.kind!=='city'&&h.x>=Math.min(x0,x1)-30&&h.x<=Math.max(x0,x1)+30&&h.y>=Math.min(y0,y1)-30&&h.y<=Math.max(y0,y1)+30)
                .map(h=>({kind:h.kind,ids:h.kind==='genre'?[h.ref]:h.ids,x:Math.round(h.x),y:Math.round(h.y),ll:h.kind==='genre'?MAPPOS[h.ref].map(v=>+v.toFixed(2)):null})); }""",[proj,ppd,y])
            res[f'{proj} ppd={ppd} year={y}']=r
      p.evaluate("()=>{MV.proj='flat'; setYear(1965); stCompute(); setMapCenter([35.0,31.9],60); fanKey=null; mapDraw(performance.now());}")
      p.screenshot(path=OUT+'/israel-1965.png',clip={'x':0,'y':0,'width':1280,'height':800})
    print(json.dumps(res,indent=0)); print('errors',errs)
    b.close()
