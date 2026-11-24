# H16: Where chart artists are from, batch A (Ireland, France, Germany, Italy, Spain, United Kingdom)

Date: 2026-11-24. Branch: `helper/2026-11-24-h16`. Run configured with model `claude-opus-5-5` (as given in the session's system prompt; the model that served each turn may differ and I cannot see that). Sub-agents: none. All lookups were done by scripts in this run (in `scripts/`), so no sub-agent model applies.

## What was asked
For each credit in `work/2026-11-24-wikicharts/artists.A.json` (2,371 credits, most chart rows first): split it into the artists it names, find each artist's country from the raw text of their Wikipedia article (English first, then the artist's own language), copy the supporting string character for character, run the evidence check, and hand back `origins.json`, `sources.json`, `evidence-check.json` and `unverified.json`.

## What is in this folder
- `origins.json`: 2,685 records `{credit, artist, kind, country, url, quote, read}`, one per artist per credit, 1,986 distinct artists. Only claims the check found.
- `sources.json`: 1,987 claims (one per distinct article and quote) under the key `"A"`, in the shape `tools/check_evidence.py` reads. Extra fields: `kind: "origin"`, `basis`, `country`, `read`.
- `evidence-check.json`: the check script's output for `sources.json`: 1,987 of 1,987 `found`.
- `unverified.json`: 330 records that are not in `origins.json`, each with `result` (`ambiguous`, `no article`, `not found`, `not an artist`, `kind unclear`) and the reason.
- `unsure-splits.md`: the 122 credits whose split I am unsure of (also summarised below).
- `scripts/`: the scripts that did the work, in order `step1` to `step6` (`extract.py` and `demonyms.py` hold the reading rules), so the lead can rerun or change a rule. They need the network and write their caches to the current folder.

## How it was done
1. **Split.** I fetched the raw text of every chart page that lists a batch-A credit (708 pages, from `chart.rows.json`) and read which articles the credit's cell links to. Each link is one artist; a band whose name contains "&" is one link, so the split follows the articles, not the punctuation. Where a credit, or part of it, has no link, it was split on the joining words (featuring, feat., and, &, with, et, y, e, und, con, /, x, vs., commas), and an unlinked whole credit with a joining word was first tried as one article.
2. **Article.** Each linked article was fetched as `https://en.wikipedia.org/wiki/<Title>?action=raw`, following redirects. Where English had no article, or one that did not answer, the article of the same name in the language of the chart where the credit charted most (fr, de, it, es) was fetched the same way. One fetch per source per artist; no title variants were tried.
3. **Country.** Person: the nationality the lead sentence gives ("is an English singer"); if the lead gives none, the infobox `birth_place` line, if its last part names a country. Group: the infobox `origin` line, if its last part names a country; otherwise the nationality in the lead ("are an American musical group"). Rules applied when reading the lead: "X-born" and "X-based" are not nationalities ("Egyptian-born French" → FR); "of X origin/descent" is not a nationality; the verb nearest the occupation is the one that describes the artist; a lead whose nationality sits in a different sentence, or describes a relative ("child of … American actress"), gives nothing. Two or more nationalities in the lead are a list, in the order given.
4. **Quote.** The quote is a piece of the raw text copied as it stands: the infobox line, or the run of the lead from the verb to the occupation word, cut where a template, reference or hidden comment begins, so it holds no text the rendered page lacks.
5. **Identity.** A link on the chart page is taken to identify the artist. An artist looked up only by name (no link, or another language's article) is accepted only if the article names one of the songs that artist charted with on these pages; otherwise it is `ambiguous`. This removed, for example, "Ringo" (in "Sheila & Ringo"), which redirects to Ringo Starr.
6. **Check.** `python3 tools/check_evidence.py work/2026-11-24-H16/sources.json --out work/2026-11-24-H16/evidence-check.json`: 1,987 found, nothing else. (To save time I first ran the same script on three thirds of the file side by side, which filled its page cache, then ran it once on the whole file; the handed-back output is that whole run.)

## What was found
- **How far:** the whole list, all 2,371 credits, down to the last one (`Kid Yugi`).
- **Credits:** 2,069 fully resolved (every artist in them has a checked origin), 73 partly, 229 not at all. By chart rows: 4,472 of 4,874 rows have every artist resolved.
- **Artists (distinct):** 1,986 found; 288 not found anywhere (163 ambiguous, 80 with no article, 53 not found in an article that exists, 1 kind unclear, plus the placeholder credits "No release", "Various Artists" and "Compilation", which are not artists).
- **Kinds:** 1,361 persons, 625 groups.
- **Basis:** 2,020 lead sentence, 629 infobox origin, 36 infobox birthplace. Article language: 2,625 English, 28 German, 18 Spanish, 11 French, 3 Italian (counted per record).
- **Countries (distinct artists, a list counts for each country in it):** US 451, GB 384, IT 267, FR 226, DE 197, ES 108, IE 89, CA 38, NL 36, AU 29, SE 19, BE 18, JM 16, AT 13, PR 10, others fewer.
- **Lists:** 78 artists have two or more countries (for example Charles Aznavour FR, AM; Paul Anka CA, US; Gloria Estefan CU, US; Mika LB, GB; Regard XK, AL).

Not found, by kind:
- **No article** (80): mostly Irish showbands, one-hit French and Spanish acts and featured guests (The Real McCoy, Café Crème, Nstasia, Tarlisa, Joe Cuddy…), plus a few chart-page text fragments ("No charts exist for 34 weeks due to a strike.", "Varios", "Multi-interprètes", "Johnny Hallydya", a misspelling on the chart page).
- **Ambiguous** (163): a by-name lookup that landed on a disambiguation page or an unrelated article (Amnesia, Images, Indiana, Pinocchio, Machete…); a linked article that is about a record or a programme, not the artist (Band Aid → the song, Star Academy, Deutschland sucht den Superstar, Operación Triunfo); a by-name lookup whose article does not name the charted song (Ringo Starr, Michel Berger, Kontra K, Bonez MC); a nationality that is not one present country (Gims and Maître Gims "Congolese"); charity ensembles, football teams and characters (Republic of Ireland national football team, Dustin the Turkey, Pulcino Pio).
- **Not found** (53): the article exists but gives neither a nationality in the lead nor a usable origin or birthplace. Examples: Bee Gees (the `origin` field is deliberately left empty), Monty Python, Renée and Renato (origin "Italy and the United Kingdom"), Farid Bang (nationality and occupation in different sentences), the X Factor series pages, musical-theatre casts (Notre-Dame de Paris, Roméo et Juliette, Le Roi Soleil).

## Credits whose split I am unsure of
The full list (122) with the reason for each is in `unsure-splits.md`. The kinds:
- **Partly linked** (the chart page links some names, not others): the unlinked names were looked up by name and pass only with the identity check in step 5, e.g. "Mariah Carey featuring Westlife", "Cécilia Cara & Damien Sargue", "Samra and Capital Bra".
- **Not linked at all and split on the joining word**, e.g. "Kummer featuring Fred Rabe", "Stone & Eric Charden", "DJ Kost & Goldfinger", "Patrick Green & Olivier Lejeune", "Emile & Images". Some of these may be one act (a duo billed as "A & B"); with no article I could not tell.
- **Pieces matched to no artist**, e.g. "and the Plainsmen", "and the Monarchs", "y la Ganga" (Irish and Spanish bandleader-and-band credits), and in "John Lennon and Yoko Ono and the Plastic Ono Band with the Harlem Community Choir" the choir: "Harlem" was matched to the article on Harlem, which the musician check rejected.
- **Linked to an article under another name.** The `artist` field is the article's title, which can differ from the credited name: "Diego Modena" → Luis Rigou, "Supa T" → Trevor Taylor, "Starsound" → Stars on 45, "Inéz" → Ines Reingold-Tali (that last one is in `unverified.json`).

## Sources
- English Wikipedia, raw article text: `https://en.wikipedia.org/wiki/<Title>?action=raw`, read 2026-11-24, for 2,625 records; the address of each is in `origins.json`.
- German, Spanish, French and Italian Wikipedia, raw article text, same form (`https://de.wikipedia.org/wiki/<Title>?action=raw` and so on), read 2026-11-24, for 60 records.
- The chart pages listed in `work/2026-11-24-wikicharts/chart.rows.json` (raw text, read 2026-11-24), used only to find which article each credit links to, not as evidence of origin.

## What fell short
- **288 distinct artists have no origin.** Each is in `unverified.json` with the reason and the languages tried. No title variants ("X (singer)", "X (band)") were tried, as the assignment allows one fetch per source per artist; many of the disambiguation cases would resolve with one more targeted fetch.
- **Wikidata was not used,** as the assignment names Wikipedia only. It would resolve most "no article" and "not found" cases in one query.
- **The identity check is strict.** It drops correct by-name matches whose article lists no charted song (Michel Berger, Lazza in one credit, Kontra K). These are in `unverified.json` as `ambiguous` with that reason.
- **Lead-sentence reading is pattern-based.** I read about 250 results by eye and fixed what I found; the remaining risk is a lead whose demonym is not in `scripts/demonyms.py`. A missing demonym makes a list shorter, for example "Irish-Zambian-American" was caught only after Zambian was added. The demonym table is in the scripts for review.
- **The infobox `origin` of a group can be read as "the last part names a country",** so "Italy and the United Kingdom" and "Brittany" give nothing, and "[[West Germany]]" is read as DE.
- **Historical countries** (Kingdom of Egypt, Yugoslavia, Soviet Union, "Congolese") are not mapped to a present country, so those artists fall back to their birthplace or stay unverified.

## Questions for the lead
1. **Hyphenated identities.** The rule "two nationalities in the first sentence → a list" turns "Cuban-American", "Senegalese-American", "Kosovo-Albanian", "Lebanese-German", "British Irish" into two countries, although some of these describe heritage, not citizenship. Should a hyphenated "X-American" be read as American only, or kept as a list?
2. **Group origin against lead.** For groups I preferred the infobox `origin` (where formed) over the lead's nationality. Where they disagree (a band formed abroad), is `origin` the right choice for the "Made there" filter?
3. **Kind for projects and characters.** Studio projects (King África "proyecto musical", Crazy Frog "CGI-animated character") are neither clearly a person nor a group. One is in `unverified.json` as `kind unclear`; Crazy Frog is in `origins.json` as a person. Should there be a third kind?
4. **Name used for `artist`.** `artist` is the Wikipedia article's title, so a stage name can turn into a legal name (Luis Rigou for Diego Modena). Should the master table key artists by the credited name and keep the article title as an alias?
