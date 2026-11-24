# H18: Where chart artists are from, batch C (Americas outside the United States, Oceania, Asia, Africa)

Date: 2026-11-24. Branch: `helper/2026-11-24-h18`. Run configured with model `claude-opus-5-5`, as given in the session's system prompt. I cannot see which model actually served each turn. Sub-agents: none. All lookups were done by scripts (in `scripts/`), so no sub-agent model applies.

## What was asked
As H16, for `work/2026-11-24-wikicharts/artists.C.json` (2,091 credits, 3,670 chart rows) and the key `"C"`. For each credit, split it into the artists it names, and find each artist's country from the raw text of their Wikipedia article: English first, then the artist's own language (Spanish or Portuguese for many of these). Copy the supporting string character for character, run the evidence check, and hand back `origins.json`, `sources.json`, `evidence-check.json` and `unverified.json`.

## What is in this folder
- `origins.json`: 2,453 records `{credit, artist, kind, country, url, quote, read}`, one per artist per credit, covering 1,698 distinct artists. It holds only claims the check found.
- `sources.json`: 1,705 claims (one per distinct article and quote) under `"C"`.
- `evidence-check.json`: the check's output. 1,700 claims were found, 4 were near and 1 was not found. Those 5 are in `unverified.json`.
- `unverified.json`: 438 records, each with a `result` and a reason.
- `unsure-splits.md`: the 194 credits whose split I am unsure of.
- `scripts/`: the scripts, copied from H17's with the changes listed below. The page caches are not included: they can be rebuilt by running `step1` to `step6` again.

## How it was done
The method is H17's (see `work/2026-11-24-H17/REPORT.md` and H16's "How it was done"). I changed these things for this batch:
- **Own language.** The credit's most-charted country picks the fallback language. Mexico, Argentina, Panama, Venezuela, Colombia, Peru, Chile, Bolivia, Guatemala, Puerto Rico and the other Spanish-speaking countries use Spanish. Brazil uses Portuguese, Indonesia Indonesian and Malaysia Malay. Singapore, New Zealand, Australia, South Africa and Nigeria use English only. No Japanese article was read: the lead-sentence reading cannot parse Japanese.
- **Spanish and Portuguese readings.** I added the country names and adjectives these articles use (brasileiro, estadunidense, méxico, perú …), the Spanish infobox fields (`fecha de nacimiento`, `lugar de nacimiento`, `fondo = solista/grupo`, `Ficha de persona`), and record words (álbum, sencillo, canción, disco, telenovela). That last addition stops an article about an album being taken as the artist.
- **Indonesian and Malay readings.** "adalah penyanyi … Indonesia" and "grup musik" are read, and so are the birthplace and origin lines whose last part is "Indonesia" or "Malaysia".
- **A genre is not a nationality.** "grupo de rock argentino", "música regional mexicana", "música folklórica de Argentina", "Spanish reggae" and "X-language" are ignored when the nationality is read. Before this fix, Calibre 50 was taken as Mexican from its genre. It is now taken from its origin line. Hernán Figueroa Reyes now has no origin, because his lead gives only a genre.
- **Origin written as "Buenos Aires (Argentina)".** The country is now read from the parenthesis.
- **Person or group.** The earlier of a group word and a person word in the lead decides. Before this change, "fue un cantante argentino, integrante del grupo …" was read as a group.
- **Redirects to another subject.** If a name redirects to an article whose title shares no word with it, the result is now `ambiguous`. This is new; H16 and H17 did not have it. It caught these, all now in `unverified.json`:
  - Tony Vilar → Antonio Villaraigosa (a politician);
  - Hammond Gamble → Blues in New Zealand;
  - Bubbler Ranx → the song "Mysterious Girl";
  - Blinky Blink → Harlem World (group);
  - Eric Nally → Foxy Shazam;
  - Paul McCoy → 12 Stones;
  - The Peels → "Juanita Banana (song)".
  
  It also drops some correct ones: 2Pac → Tupac Shakur and Puff Daddy → Sean Combs.

## What was found
- **How far:** the whole list, all 2,091 credits, down to the last one (`Frankie Venter`).
- **Credits:** 1,745 fully resolved, 129 partly, 217 not at all. 3,280 of 3,670 chart rows have every artist resolved.
- **Artists (distinct):** 1,698 found and 371 with no origin:
  - 194 with no article;
  - 137 ambiguous;
  - 36 not found in an article that exists;
  - 4 near.
- **Kinds:** 1,099 persons, 599 groups.
- **Basis** (per record): 1,793 lead sentence, 627 infobox origin, 33 infobox birthplace.
- **Article language** (per record): 2,357 English, 80 Spanish, 12 Indonesian, 2 Portuguese, 1 Malay, 1 French.
- **Countries** (distinct artists; a list counts for each country in it): US 757, GB 241, CA 75, AU 74, MX 73, NZ 57, AR 46, BR 36, IT 34, PR 29, ES 28, CO 25, ID 25, VE 25, NG 24, KR 23, FR 21, IE 14, JM 12, DE 11, ZA 10, PA 10, others fewer. Many artists on these charts are American or British, as on the European ones.
- **Lists:** 46 artists have two or more countries, for example Camila Cabello CU, MX, US; Rosé NZ, KR; Gian Franco Pagliaro IT, AR ("italiano nacionalizado argentino"); Stan Walker AU, NZ.

Not found, by kind:
- **No article** (194 distinct). Most are Latin American acts from the 1960s to 1980s with no article in English or Spanish at the credited name, for example:
  - Los Hooligans, Los Solitarios, Carmen Rivero y su Conjunto, Dúo Manzanilla, Grupo El Tren;
  - Venezuelan, Panamanian and South African acts from recent years: Omar Enrique, Roland Borjas, Dlala MJ, Litty Gvng, Zinhle Ngidi;
  - a few names written differently on the chart page: "Nio Garcia" (without the accent), "M|A|R|R|S".
  
  "Sabú (cantante argentino)", an interlanguage link on the chart page, did not resolve to a Spanish article at that title.
- **Ambiguous** (137 distinct). These are:
  - one-word names that land on a disambiguation page (César, Farah, Son, M, Water);
  - a by-name or Spanish match that does not name the charted song (Peppino di Capri on a Spanish-language article; Carlos Vives in one credit);
  - non-artists: USA for Africa → "We Are the World"; Band Aid → the song; Australian Idol season 1, American Idol, Bob the Builder, the Royal Scots Dragoon Guards;
  - the redirects listed above.
- **Not found** (36 distinct). The article exists but gives no nationality in the lead and no usable origin or birthplace, for example:
  - Bee Gees, The Partridge Family, David Seville;
  - many Spanish and Portuguese articles whose lead gives a birthplace without the country (Hernán Figueroa Reyes "Salta,"), or none at all (Altemar Dutra, Silvinho, Los Wawancó, Ramona Galarza).
- **Near** (4). These are group origin lines split by `<br/>` across two places: Gary and Dave, Bo Donaldson and The Heywoods, Sly Fox, Green Jellÿ. The check reads each of them as "near". One more, The Browns (`<small>[[United States]]</small>`), came back "not found". All five quotes are copied from the raw text. The check does not treat these markup tags as spaces, which is a limit of the checker and not a fault in the quotes.

## Credits whose split I am unsure of
The full list (194) is in `unsure-splits.md`, each with its reason. The kinds:
- **Bandleader and band credits:** "Rigo Tovar & el Conjunto Costa Azul", "X y su Conjunto", "X y su Orquesta". The lower-case band part is matched to no artist.
- **Several acts with one song**, as Argentine and Peruvian lists of the 1960s give them ("Pat Boone/David Dante/ Peppino di Capri", "Violeta Rivas/Los Tres Sudamericanos/ Beto Fernán"). These were split on "/". Each act is a separate artist with the same song.
- **Partly linked:** "Fourtwnty featuring Charita Utami", "Juan Reza, Diva Aurel, Silet Open Up and …". The unlinked names were looked up by name and pass only with the identity check.
- **Linked to an article under another name:** "Los Hermanos Záizar" → David Záizar (one of the brothers), "Inez Foxx" → Inez and Charlie Foxx (the duo), "Tommy Boyce" → Boyce and Hart. These share a word with the credit, so they passed. The country is the same either way, but the kind may be wrong.

## Sources
- English Wikipedia, raw article text (`https://en.wikipedia.org/wiki/<Title>?action=raw`), read 2026-11-24, for 2,357 records. Each address is in `origins.json`.
- Spanish, Indonesian, Portuguese, Malay and French Wikipedia, raw article text in the same form, read 2026-11-24, for 96 records.
- The 935 chart pages named in `chart.rows.json` and `rows.partial.json`, raw text, read 2026-11-24. They were used only to see which article each credit links to.

## What fell short
- **371 distinct artists have no origin.** Each is in `unverified.json` with its reason and the languages tried. As in H16 and H17, I tried no title variants ("X (cantante)", "X (banda)") and did not use Wikidata.
- **The Spanish fallback found little:** 80 of 363 Spanish lookups (counted per record) gave an accepted origin. 180 had no Spanish article at that title.
- **Portuguese and Brazilian articles rarely state a nationality next to the occupation.** Many give only a birthplace without the country. Only 2 of 33 Portuguese articles tried were accepted. A reader of Portuguese, or a birthplace-to-state table, would do better.
- **Japanese articles were not read.** The Japanese acts on the Japan year-end chart pages that have no English article are unverified.
- **The new redirect rule is coarse.** It drops correct same-person redirects whose names share no word (2Pac → Tupac Shakur, Puff Daddy → Sean Combs).
- **The checker does not treat `<br/>` and `<small>` as spaces,** so five correct infobox quotes are in `unverified.json` as near or not found.
- **I read about 200 results by eye:** a random 85, every non-English one I printed, and every multi-country one. The fixes above came from that reading. The rest is pattern-based, as in H16 and H17.

## Questions for the lead
1. **Redirect rule for H16 and H17.** H16 and H17 had no redirect check. Their `origins.json` may hold records like Tony Vilar → Antonio Villaraigosa. Should the rule be run over them?
2. **Person or group order for H16 and H17.** H16 and H17 tested the group word first, so "is an American singer and member of the band X" may have been read as a group in their records. Should they be rerun with this batch's rule?
3. **Credits that list several acts.** In credits like "Pat Boone/David Dante/ Peppino di Capri", the chart page lists several recordings of one song, not a collaboration. Should the master table treat them as separate songs?
4. The four questions in H16's report (hyphenated identities, origin against lead for groups, a third kind, the name used for `artist`) apply here too.
