#!/usr/bin/env python3
"""Checks the evidence-check script against pages the owner has looked at himself (tests/evidence_controls.json).
Needs web access, so it is run on demand and after any change to tools/check_evidence.py, not as part of every build."""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import check_evidence as ce
bad = 0
for c in json.load(open(os.path.join(ROOT, 'tests', 'evidence_controls.json'), encoding='utf-8'))['controls']:
    r = ce.check(c); ok = r['result'] in c['expect']; bad += not ok
    print('ok  ' if ok else 'FAIL', '%-9s' % r['result'], c['url'][:70])
sys.exit(1 if bad else 0)
