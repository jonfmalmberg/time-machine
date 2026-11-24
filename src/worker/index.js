/* The only Worker code on the site. It runs for the page address alone (see wrangler.jsonc) and does one thing:
   when the address carries a shared view, it writes that view into the page's title and link-preview tags, so a chat
   app shows "Canada · 1980–2020 · Country" and not just the site's name. Chat apps do not run the page's script,
   which is why this cannot be done in the page. Anything that goes wrong here serves the page untouched. */
import { linkTitle } from './title.js';

const SITE = 'World Music Time Machine';
const OURS = ['v', 'p', 'y', 's', 'g', 'tm', 'pm', 'm', 'pl', 'sel'];
let NAMES = null;

function readQuery(search){ const out = {}; String(search || '').replace(/^\?/, '').split('&').forEach(part => { if(!part) return;
  const i = part.indexOf('='), k = i < 0 ? part : part.slice(0, i), v = i < 0 ? '' : part.slice(i + 1);
  try{ const kk = decodeURIComponent(k), vv = decodeURIComponent(v); if(OURS.includes(kk) && !(kk in out)) out[kk] = vv; }catch(e){} }); return out; }

async function names(env, url){ if(NAMES) return NAMES;
  const r = await env.ASSETS.fetch(new Request(new URL('/names.json', url)));
  if(!r.ok) throw new Error('names ' + r.status);
  const j = await r.json(), get = t => id => (Object.prototype.hasOwnProperty.call(j[t] || {}, id) ? j[t][id] : undefined);
  NAMES = { cty: get('cty'), reg: get('reg'), mov: get('mov'), band: get('band'), trad: get('trad'), t1: j.t1 };
  return NAMES; }

export default {
  async fetch(request, env){
    const page = await env.ASSETS.fetch(request);
    try{
      const url = new URL(request.url), type = page.headers.get('content-type') || '';
      if(request.method !== 'GET' || !page.ok || !type.includes('text/html')) return page;
      const q = readQuery(url.search), what = Object.keys(q).length ? linkTitle(q, await names(env, url)) : '';
      const title = what ? what + ' · ' + SITE : SITE;
      const desc = what ? 'Hear it on the ' + SITE + ': ' + what + '.' : null;
      const shown = url.origin + url.pathname + (Object.keys(q).length ? '?' + OURS.filter(k => k in q).map(k => k + '=' + encodeURIComponent(q[k]).replace(/%3A/gi, ':').replace(/%2B/gi, '+')).join('&') : '');
      const set = v => ({ element(e){ if(v != null) e.setAttribute('content', v); } });
      return new HTMLRewriter()
        .on('title', { element(e){ e.setInnerContent(title); } })
        .on('meta[property="og:title"]', set(what || SITE))
        .on('meta[name="twitter:title"]', set(what || SITE))
        .on('meta[property="og:description"]', set(desc))
        .on('meta[name="twitter:description"]', set(desc))
        .on('meta[property="og:url"]', set(shown))
        .on('meta[property="og:image"]', set(url.origin + '/share.png'))
        .on('meta[name="twitter:image"]', set(url.origin + '/share.png'))
        .transform(page);
    }catch(e){ return page; }
  }
};
