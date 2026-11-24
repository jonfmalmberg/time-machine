import json,sys
from fetchpages import get
l=sys.argv[1]; need=json.load(open('need_other.json'))[l]
get(l,need,'artists_%s.json'%l)
