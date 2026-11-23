/* Which database this copy of the site talks to. The prod address uses the prod project; every other
   address (dev, branch previews, a copy running on your own computer) uses the dev project.
   These are publishable keys, made to be public: what they can reach is decided by the access rules in db/*.sql. */
const PROD_HOST='time-machine.jon-f-malmberg.workers.dev';
const PROJECTS={
  prod:{url:'https://gbexturopkketdzeopdf.supabase.co',key:'sb_publishable_rHZ5oxuln5GwfI1GktnHsw_ttp0e1-r'},
  dev:{url:'https://wpuowfaqrkgjqavhavcj.supabase.co',key:'sb_publishable_SnXygi9HXus_5GjIel4eWw_SxMS6aiI'}
};
const env=location.hostname===PROD_HOST?'prod':'dev';
window.WMCFG={env,...PROJECTS[env],ref:new URL(PROJECTS[env].url).hostname.split('.')[0],on:STATIC};
