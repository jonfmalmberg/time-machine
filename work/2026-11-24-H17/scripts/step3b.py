import json
from fetchpages import get
o=json.load(open('credits.json'))
t=[]
for c in o: t+=c['linked']
SKIP={'no release','various artists','compilation'}
for c in o:
    for u in c['unlinked']:
        if u.lower() not in SKIP and u[:1].isupper(): t.append(u)
    if not c['linked'] and len(c['unlinked'])>1: t.append(c['credit'])
DONE=json.load(open("artists_en.json"))
get("en",[x for x in list(dict.fromkeys(t)) if x not in DONE][1::2],"artists_en_b.json")
