import json
from fetchpages import get
R='/home/claude/time-machine/work/2026-11-24-wikicharts/'
from rows import load_rows; rows=load_rows(); A=json.load(open(R+'artists.D.json'))
names={a['artist'] for a in A}
pages=sorted({r['page'] for r in rows if r['artist'] in names})
get('en',pages,'chartpages.json')
