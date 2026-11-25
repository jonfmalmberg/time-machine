"""Fetch the English article for every name in credits.json. Run as: python3 step3.py <shard> <of> (shards run side by side, each with its own cache)."""
import json,sys
from fetchpages import get
o=json.load(open('credits.json'))
t=[]
for c in o: t+=c['linked']
SKIP={'no release','various artists','compilation'}
for c in o:
    for u in c['unlinked']:
        if u.lower() not in SKIP and u[:1].isupper(): t.append(u)
    if not c['linked'] and len(c['unlinked'])>1: t.append(c['credit'])
k,n=int(sys.argv[1]),int(sys.argv[2])
import glob
have=set()
for f in glob.glob('artists_en_*.json'):
    if f!='artists_en_%d.json'%k: have|=set(json.load(open(f)))
t=[x for x in dict.fromkeys(t) if x not in have]; print(len(t),file=sys.stderr)
get('en',t[k::n],'artists_en_%d.json'%k)
