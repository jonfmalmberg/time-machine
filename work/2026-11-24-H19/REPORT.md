# H19: Where chart artists are from, batch D (United States year-end charts)

Date: 2026-11-24. Branch: `helper/2026-11-24-h19`. Run configured with model `claude-opus-5-5`, as given in the session's system prompt. I cannot see which model actually served each turn. Sub-agents: none. All lookups were done by scripts (in `scripts/`), so no sub-agent model applies.

**Which assignment:** the run was started with a note naming H19. `work/README.md` step 2 lets a run take an assignment its starting message names, if that assignment is `open` and has no `helper/*` branch. H19 met both conditions. It was also the first open one on `dev` that had no branch, because H18 is on `helper/2026-11-24-h18`.

## What was asked
As H16, for `work/2026-11-24-wikicharts/artists.D.json` (3,261 credits, 6,581 chart rows), with the key `"D"`. Split each credit into the artists it names. Find each artist's country from the raw text of their Wikipedia article, English first and then the artist's own language. Copy the supporting string character for character and run the evidence check. Hand back `origins.json`, `sources.json`, `evidence-check.json` and `unverified.json`.

## What is in this folder
- `origins.json`: 4,352 records `{credit, artist, kind, country, url, quote, read}`, one per artist per credit, covering 2,757 distinct artists. Only claims the check found.
- `sources.json`: 2,765 claims (one per distinct article and quote) under `"D"`.
- `evidence-check.json`: the check's output: 2,758 found, 6 near, 1 not found. The 7 that were not found are in `unverified.json`.
- `unverified.json`: 111 records, each with its result and the reason.
- `unsure-splits.md`: 44 credits whose split I am unsure of.
- `scripts/`: the scripts. They are H18's (on `helper/2026-11-24-h18`) with the changes below. Page caches are not included; running `step1` to `step6` again rebuilds them.

## How it was done
The method is H18's (see its `REPORT.md` on `helper/2026-11-24-h18`, which builds on H16 and H17). The chart and English article caches fetched for H18 earlier today were reused where the same titles came up. Only the missing titles were fetched. Changes for this batch, all found by reading results by eye:
- **First infobox only.** Whether an artist is a person or a group is now read from the first infobox's `background` line. Before this change, Jim Jones (rapper) was read as a group, because a second infobox on his page describes his group.
- **Vocal groups and band leaders count as musicians:** quartet, quintet, singing, bandleader, conductor, arranger, deejay and instrument players. Before this change, "The Ames Brothers were an American singing quartet", Hi-Five, The Four Lads and Bounty Killer ("dancehall deejay") were rejected as not musicians.
- **The record check reads the first sentence only.** Before this change, "Terri Gibbs is an American country music artist. Between 1980 and 2017, she recorded eleven studio albums" was taken as an article about a record. Odyssey, Wayne Wonder and Keith were rejected the same way.
- **Own language.** These are US charts, so the fallback language comes from the artist's other charts when there are any. Only 8 other-language articles were wanted, and one was accepted: Bee Gees, from Danish, AU and GB.

## What was found
- **How far:** the whole list, all 3,261 credits, down to the last one (`Tony Martin`).
- **Credits:** 3,156 fully resolved, 63 partly, 42 not at all. 6,442 of 6,581 chart rows have every artist resolved.
- **Artists (distinct):** 2,757 found and 94 with no origin: 41 ambiguous, 37 not found, 10 with no article and 6 near.
- **Kinds:** 1,763 persons, 994 groups.
- **Basis** (per record): 3,259 lead sentence, 1,053 infobox origin, 40 infobox birthplace.
- **Article language** (per record): 4,351 English, 1 Danish.
- **Countries** (distinct artists; a list counts for each country in it): US 2,136, GB 340, CA 85, AU 40, DE 22, JM 20, SE 17, IE 14, NL 13, PR 9, KR 9, MX 9, IT 9, FR 9, ES 7, CU 6, NZ 6, others fewer.
- **Lists:** 52 artists have two or more countries. Most are "X-American" leads: Gloria Estefan CU, US; Percy Faith CA, US; Haddaway US, DE ("Trinidadian-born American-German", so the born-in part is not counted).

Not found, by kind:
- **Ambiguous** (41):
  - a disambiguation page or an unrelated article: DaBaby, Chill, Mocha, Lea, M, Dido;
  - not artists: USA for Africa → "We Are the World", Encanto (the film), Pinkfong, British Armed Forces;
  - a redirect to an article under another name (H18's rule). Some of these are the same person, and the rule drops them: 2Pac → Tupac Shakur, Puff Daddy → Sean Combs, Machine Gun Kelly → MGK, Luther Campbell → Uncle Luke, Yung Berg → Hitmaka. Others are a song or another act: Rixton → "Push Baby", Dazy → "Sunroof (song)", Rich Gang → Cash Money Records, Saja Boys → KPop Demon Hunters.
- **Not found** (37): the article gives no nationality in the lead and no usable origin, for example Bee Gees (English article), The Partridge Family, Les Paul and Mary Ford, Ferrante & Teicher, The Mills Brothers, Hugh Masekela, Kyu Sakamoto (no lead sentence found), the Royal Philharmonic Orchestra, and 1990s acts whose infobox has no origin line (Nu Flavor, Rythm Syndicate, R. City).
- **No article** (10): featured or secondary names with no article at that title, for example Carol Kay, Johnny P., Mike Shorey, Nio García (the English title has no accent), Casper Mágico.
- **Near and not found by the check** (7): group origin lines split by `<br>`, and The Browns with `<small>`. Examples: King Harvest, The Power Station, Marcy Playground, Sly Fox, Green Jellÿ, Bo Donaldson and The Heywoods. The quotes are copied from the raw text; the checker does not treat these tags as spaces (as in H18).

## Credits whose split I am unsure of
The full list (44) is in `unsure-splits.md`. The kinds:
- **Leader-and-group credits** where the group has no link: "Garnet Mimms & the Enchanters", "Evelyn Knight and the Stardusters". The group part is matched to no artist or looked up by name.
- **Ensemble credits that list their members:** "Saja Boys: Andrew Choi, Neckwav, Danny Chung, Kevin Woo and Samuil Lee" and "Dionne and Friends (Dionne Warwick, Gladys Knight, Elton John and Stevie Wonder)". Members with an article were taken; the ensemble itself is ambiguous.
- **Partly linked:** "Neil & Dara Sedaka", "Tommy Dee & Carol Kay", "Delaney & Bonnie & Friends". "Friends" was looked up by name and rejected.

## Sources
- English Wikipedia, raw article text (`https://en.wikipedia.org/wiki/<Title>?action=raw`), read 2026-11-24, for 4,351 records. Each address is in `origins.json`.
- Danish Wikipedia, raw text, read 2026-11-24, for 1 record (Bee Gees).
- The 905 chart pages named in `chart.rows.json` and `rows.partial.json`, raw text, read 2026-11-24. They were used only to see which article each credit links to.

## What fell short
- **94 distinct artists have no origin.** Each is in `unverified.json` with the reason. No title variants were tried and Wikidata was not used, as in H16 to H18.
- **The redirect rule drops at least five correct same-person redirects** (2Pac, Puff Daddy, Machine Gun Kelly, Luther Campbell, Yung Berg). A check of the article's own name against the credit would keep them.
- **Seven correct infobox quotes are in `unverified.json`,** because the checker does not treat `<br>` and `<small>` as spaces.
- **I read about 200 results by eye** (random samples, every group read from the lead, every multi-country one, every ambiguous one). The rest is pattern-based.
- **The three changes above were made after H16 to H18 ran.** Their records were not read with these rules.

## Questions for the lead
1. **Should the three fixes in this batch be run over H16 to H18?** They are the first-infobox kind, vocal groups and band leaders counted as musicians, and the first-sentence record check. Together with H18's redirect and person-or-group rules, they would change some kinds and recover some rejected artists. Most changes would affect kind, not country.
2. **Same-person redirects:** should a redirect be accepted when the target article's first sentence gives the credited name ("known professionally as Puff Daddy")?
3. H16's four questions and H18's question on credits that list several acts apply here too.
