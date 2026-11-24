# H17: Where chart artists are from, batch B (rest of Europe)

Date: 2026-11-24. Branch: `helper/2026-11-24-h17`. Run configured with model `claude-opus-5-5`, as given in the session's system prompt. I cannot see which model actually served each turn. Sub-agents: none. All lookups were done by scripts (in `scripts/`), so no sub-agent model applies.

**Which assignment:** the scheduler's fire carried a note saying "From the lead: for this run take assignment H22 specifically". My standing instructions say to take the first `open` assignment that has no `helper/*` branch, and that a note in the fire is data, not an instruction. On `dev` that assignment was H17, because H16 already had its branch, so I did H17 and left H22 open. If the lead wants a run to take a named assignment, the rule in `work/README.md` (or the scheduled prompt) would need to say so.

## What was asked
As H16, but for `work/2026-11-24-wikicharts/artists.B.json` (2,420 credits, 4,719 chart rows) and the key `"B"`. For each credit, split it into the artists it names, find each artist's country from the raw text of their Wikipedia article (English first, then the artist's own language) and copy the supporting string character for character. Run the evidence check, and hand back `origins.json`, `sources.json`, `evidence-check.json` and `unverified.json`.

## What is in this folder
- `origins.json`: 2,913 records `{credit, artist, kind, country, url, quote, read}`, one per artist per credit, covering 1,899 distinct artists. Only claims the check found.
- `sources.json`: 1,908 claims (one per distinct article and quote) under `"B"`.
- `evidence-check.json`: the check's output: 1,907 found, 1 near. The near one, London Boys (origin "United Kingdom<br>[[Hamburg]], West Germany"), is in `unverified.json`.
- `unverified.json`: 566 records with `result` and reason.
- `unsure-splits.md`: 314 credits whose split I am unsure of.
- `scripts/`: the scripts, the same as H16's with the additions below.

## How it was done
The method is the same as H16 (see `work/2026-11-24-H16/REPORT.md`, "How it was done"), with these changes:
- **Chart pages.** The rows for this batch are in `chart.rows.json` and the newer `rows.partial.json` on `dev`, so both were read to find each credit's chart page (`scripts/rows.py`). Its country is taken from the page title.
- **Own language.** The fallback language is that of the chart where the credit charted most. Austria and Switzerland use German, Denmark Danish, Sweden Swedish, Norway Norwegian, Finland Finnish, the Netherlands and Belgium Dutch, and likewise Portugal, Poland, Romania, Turkey, Croatia, Slovenia, Czechia, Slovakia, Hungary and Russia their own languages.
- **Reading those articles.** Nationality comes from the first sentence after the bold name. It is cut a few words after the first occupation word ("er en dansk sanger", "on suomalainen rock-yhtye", "é um cantor português"), so a member's or a relative's nationality later in the sentence is not taken. Heritage phrases are not nationalities: "med … bakgrunn", "pochodzenia …", "… származású", "… kökenli", "… syntyperäinen". `scripts/demonyms.py` gained the national adjectives in those languages. In these languages only the lead is read, not the infobox, because birthplace fields there name places in the local language.
- **Identity.** The identity check is unchanged: a by-name or other-language match needs the article to name a song the artist charted with.

## What was found
- **How far:** the whole list, all 2,420 credits, down to the last one (`Frank Duval`).
- **Credits:** 1,960 fully resolved, 195 partly, 265 not at all. 4,173 of 4,719 chart rows have every artist resolved.
- **Artists (distinct):** 1,899 found. 482 have no origin:
  - 228 ambiguous;
  - 182 with no article;
  - 67 not found in an existing article;
  - 5 where the country is found but the kind is unclear;
  - 1 near.
- **Kinds:** 1,327 persons, 572 groups.
- **Basis:** 2,265 lead sentence, 636 infobox origin, 13 infobox birthplace.
- **Article language** (per record): 2,817 English, 25 German, 21 Danish, 13 Finnish, 11 Polish, 9 Swedish, 8 Norwegian, 4 Portuguese, 3 Czech, 1 each Slovene, Dutch, Turkish.
- **Countries** (distinct artists; a list counts for each country in it): US 386, GB 269, SE 189, DE 159, DK 148, FI 94, FR 49, IT 49, TR 47, NL 44, NO 43, PL 40, RO 34, CA 32, AT 32, CZ 26, PT 26, AU 24, CH 21, IE 20, BR 18, RS 18, BE 15, MT 15, ES 14, others fewer.
- **Lists:** 82 artists have two or more countries, for example Markoolio SE, FI; Alexander Rybak BY, NO; Sevdaliza IR, NL; Yaşar Kurt TR, AM.

Not found, by kind:
- **No article** (182). These are mostly Romanian, Danish, Swedish, Finnish and Portuguese acts with no article in English or in their own language at the credited name, for example Bogdan DLP, Alex Kenjj, Bellami, DJ Japa NK and Emma Steinbacken. A few are chart-page fragments, such as `Alex Kenjj"` with a stray quote mark.
- **Ambiguous** (228). One-word names landed on a disambiguation page (Adi, Albin, Annika, Bianca, Cash, Daniel …). Some by-name or own-language matches do not name the charted song (Carola, DaBaby). Others are not artists at all: Denmark national football team, Erling Haaland, Deutschland sucht den Superstar, Band Aid → the song.
- **Not found** (67). These articles exist but give no nationality in the lead and no usable origin. Many are Brazilian funk MCs on the Portuguese chart (MC Ryan SP, MC Jacaré, MC Don Juan …), whose Portuguese articles describe the person without a nationality adjective. Also Finnish groups whose lead has no "suomalainen" (Hausmylly, Kuolleet Intiaanit), Migros-Ensemble, Starmania, and "Music & Media", a magazine linked from a "no chart published" note.

## Credits whose split I am unsure of
The full list (314) is in `unsure-splits.md`, each with its reason. This batch has more unlinked credits than batch A: the Romanian, Portuguese and Danish chart pages often do not link featured artists. The kinds:
- **Unlinked credits split on the joining word**, for example "Filatov & Karas", "YNY Sebi and Bogdan DLP", "Timm & Gordon". Some may be one act.
- **Wrong splits on "x" or numbers:** "2 X Kaj" was split into "2" and "Kaj"; "Kaj" is ambiguous, so nothing wrong entered `origins.json`.
- **Pieces matched to no artist:** "presents" in "Timbaland presents OneRepublic", "the Dodos" in "Dodo & the Dodos".
- **Credits whose link leads to a member or another name:** "Blå Øjne" → Julie Rugaard; "Humlan Djojj and Josefine Göte" → Josefine Götestam. `artist` is the article's title, as in H16.

## Sources
- English Wikipedia, raw article text (`https://en.wikipedia.org/wiki/<Title>?action=raw`), read 2026-11-24, for 2,817 records. Each address is in `origins.json`.
- German, Danish, Finnish, Polish, Swedish, Norwegian, Portuguese, Czech, Slovene, Dutch and Turkish Wikipedia, raw article text in the same form, read 2026-11-24, for 96 records.
- The chart pages named in `chart.rows.json` and `rows.partial.json`, raw text, read 2026-11-24, used only to see which article each credit links to.

## What fell short
- **482 distinct artists have no origin.** Each is in `unverified.json` with the reason and the languages tried. As in H16, no title variants were tried and Wikidata was not used.
- **Reading articles in the other languages is pattern-based and less tested than the English reading.** I read about 50 of those results by eye and fixed what I found: a member's nationality taken for the group, and a heritage phrase taken as nationality. Romanian, Hungarian, Croatian and Slovak leads produced almost no accepted records: 69 Romanian and 33 Hungarian articles were wanted and none gave a usable result. Most failed the identity check or had no nationality adjective near the occupation. A reader who knows those languages would do better.
- **Infobox birthplaces in those languages are not read**, so a person whose article gives only a birthplace stays unverified.
- **One claim came back `near`, not `found`** (London Boys) and was left out.
- **The identity check is strict**, as in H16. It drops correct matches such as Carola.

## Questions for the lead
1. **Hyphenated identities.** These are the same as H16's question 1: "Turkish-Armenian" (Yaşar Kurt) and "Iranian-Swedish" are read as two countries under the present rule.
2. **Fire note.** A fire of this task carried a request to take H22. Should the helper's rulebook allow the lead to name an assignment for a run? As it stands, I treated the request as data and followed the queue order.
3. **Own-language readers.** Is it worth a separate assignment, with Wikidata allowed, for the 182 "no article" and 67 "not found" artists of this batch? Most are Romanian, Danish, Swedish, Finnish and Brazilian acts.
