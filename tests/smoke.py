#!/usr/bin/env python3
"""Smoke test: the built page loads, every tab opens, and nothing throws.

Needs Python Playwright with Chromium. Run after build.py: python3 tests/smoke.py
"""
import os, sys
from playwright.sync_api import sync_playwright

PAGE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dist', 'index.html')

def run(pw, name, viewport):
    errors = []
    browser = pw.chromium.launch()
    page = browser.new_page(viewport=viewport)
    page.on('pageerror', lambda e: errors.append(str(e)))
    # Other sites (fonts, map outlines, cover art) are not part of this test.
    page.route('**/*', lambda r: r.continue_() if r.request.url.startswith('file:') else r.abort())
    page.goto('file://' + os.path.abspath(PAGE), wait_until='domcontentloaded')
    page.wait_for_timeout(800)
    tabs = page.evaluate("[...document.querySelectorAll('nav.tabbar .tab-link')].map(b=>b.id)")
    assert len(tabs) >= 5, 'tab bar missing: %r' % tabs
    for t in tabs:
        page.click('#' + t)
        page.wait_for_timeout(250)
        assert page.get_attribute('#' + t, 'aria-selected') == 'true', t + ' did not open'
    wide = page.evaluate('document.documentElement.scrollWidth > innerWidth')
    assert not wide, 'page scrolls sideways'
    browser.close()
    assert not errors, 'page errors: %r' % errors
    print('ok', name, len(tabs), 'tabs')

with sync_playwright() as pw:
    run(pw, 'phone', {'width': 400, 'height': 800})
    run(pw, 'desktop', {'width': 1280, 'height': 800})
