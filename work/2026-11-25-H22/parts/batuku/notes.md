# Batuku (`batuku`): research notes, H22, read 2026-11-25

## (a) Confidence
Medium for the definition, low for dates and size. The sound and structure (cloth pads and clapping, three-over-two cross-rhythm, lead and chorus, improvised finaçon verse, the txabéta climax, women's circle on Santiago) are stated by en and pt Wikipedia and by Margarida Brito's 1998 survey, and agree. The first date (1772) rests on one source, pt Wikipedia, and en Wikipedia contradicts it (see c). The playlist has 23 songs. The strong ties are: a Wikipedia example row (Mayra Andrade, Lura's 'Rabóita', Nancy Vieira, Bulimundo, Gil Semedo), a track or album title naming the genre (Lura 'Batuku', Princezito 'Batuku Azul' and 'Batuku Pilon', Madonna 'Batuka', which Wikipedia also calls a batuque song), and the French field albums whose titles name batuco/batuque/finaçon (Rincon, Nha Mita Pereira, Ntóni Denti d'Oru, Nácia Gomi). **Ties by title only:** Princezito's two songs, Batuko Tabanka 'Finaçon' (group name and title), Nácia Gomi 'Rapazinho bo é tentadu' (the anthology labels it finaçon). **Ties through the performer only:** Tcheka 'Nu Monda' (Tcheka is described as a guitar batuque player; the particular song is not called batuku) and Nácia Gomi & Ntóni Denti d'Oru 'Finkadu na Raiz'. All 76 claims were found by the checker.

**Sub-genre proposal (asked for):**
- **Finaçon:** an alias and the second marker of batuku, not a separate record. It is the improvised proverb verse sung by the lead singer inside a batuku session, in the batuku rhythm (en Wikipedia; Brito: "O Finaçon é uma melopeia ... no ritmo de batuque"). Recordings labelled finaçon are batuku circle recordings. Caution: the band **Finaçon** (1988 to about 1998, out of Bulimundo) played funaná and is already in our data as a funaná artist (`a_6jy7kvfs77`). The alias must match the genre word, never the artist.
- **Tabanka:** a separate record in a later round, a sibling under `n_capeverdeanmusic` and not a child of batuku. It is a different Santiago and Maio institution: a procession with drums, conch shells and cornets in a fast binary rhythm, held May to July, and also a mutual-aid association. It was banned from the late 19th century (1896 in Praia, per en Wikipedia). No source makes it a form of batuku. If added, the proposed id is `tabanka` with parent `wadrum` (a judgement). Songs to start from: Os Tubarões 'Tabanca' (1980), Simentera 'Nha nobo' (1997), Lura 'Tabanka Assigo' and 'Tabanka', and Nha Sabadu 'Tanbanka de varzea' on the Ocora anthology. None of these was checked for this hand-back.
- parentage.json records both proposals as lines with `kind` `alias` and `none` and a `proposal` field. Neither `finaçon` nor `tabanka` is an id, so the lead should not merge those two lines as they stand.

**Proposed parent:** `wadrum` (principal) is a judgement. The sources say "de origem africana" (Brito), and Gonçalves (quoted on pt Wikipedia) says batuku is an adaptation of some African dance that developed in Cape Verde. No source names a parent. Dulce Almada (quoted by Brito) links it to the São João (San Jon) rhythm, which has no id.

## (b) Sources
- Batuque (Cape Verde), English Wikipedia: https://en.wikipedia.org/wiki/Batuque_(Cape_Verde)
- Batuque (Cabo Verde), Portuguese Wikipedia: https://pt.wikipedia.org/wiki/Batuque_(Cabo_Verde)
- Margarida Brito (1998), Breves Apontamentos sobre as Formas Musicais existentes em Cabo Verde (PDF): http://www.attambur.com/Recolhas/PDF/FormasMusicaisCaboVerde.pdf
- Music of Cape Verde, English Wikipedia: https://en.wikipedia.org/wiki/Music_of_Cape_Verde
- Tabanca, Portuguese Wikipedia: https://pt.wikipedia.org/wiki/Tabanca
- Finaçon (band), English Wikipedia: https://en.wikipedia.org/wiki/Fina%C3%A7on
- Funaná, Portuguese Wikipedia (Finaçon 'Fomi 47' row): https://pt.wikipedia.org/wiki/Funan%C3%A1
- Orlando Pantera, English and Portuguese Wikipedia: https://en.wikipedia.org/wiki/Orlando_Pantera, https://pt.wikipedia.org/wiki/Orlando_Pantera
- Tcheka, English Wikipedia: https://en.wikipedia.org/wiki/Tcheka
- Lura (singer), English Wikipedia: https://en.wikipedia.org/wiki/Lura_(singer)
- Batuka (song), English Wikipedia: https://en.wikipedia.org/wiki/Batuka_(song)
- UNESCO ICH, Cabo Verde: https://ich.unesco.org/en/state/cabo-verde-CV
- iTunes lookups (country FR unless noted): Femmes de Rincon, Cap-Vert: Batuco de l'île de Santiago (id 166462003); Nha Mita Pereira, Cape Verde: Batuque & Finaçon (424221723); Ntóni Denti d'Oro, same title (1364539862); Cap-Vert: un archipel de musiques (619280402); Lura, Di Korpu Ku Alma (422741030); Nacia Gomi & Ntoni Denti D'oro, Finkadu Na Raiz (1632109753); Batuko Tabanka, Djunta Mô (340771761, PT); Batukadeiras Estrelas de Bela Vista, Cuza Pensa (1854979496, PT); Princezito, Spiga (1884633557) and Praia - Dakar Conexões (1130478412). Address form: https://itunes.apple.com/lookup?id=<id>&entity=song&country=<cc>
- MusicBrainz releases: Bulimundo, Batuco https://musicbrainz.org/release/4c423ce4-8a23-4954-8b1b-a38d298b68f3; Nancy Vieira, Lus https://musicbrainz.org/release/aa5383bc-c8d9-44d5-89d5-187286323221; Tcheka, Nu Monda https://musicbrainz.org/release/4cd1b62a-ccea-4c6c-a5b6-4e1ebfc52089

## (c) Disagreements with our records
- No line in data/ covers batuku, finaçon or tabanka, so nothing in our records is contradicted directly.
- The sources disagree with each other on the first record. pt Wikipedia says the oldest reference is a ban dated September 1772. en Wikipedia says there are written records only from the 19th century. 1772 is used, with `attested: true`. The lead may prefer to drop `attested` because the 1772 text speaks of "zambunas", not batuku.
- `funana`'s definition says it was "spread ... abroad with Finaçon". That is the band, which is right, but it shows why the `finaçon` alias needs care.
- `morna` is in family `folk` while `funana`, `coladeira` and this proposal are in family `africa`, all under tradition `n_capeverdeanmusic`, which is itself family `folk`. This is not a contradiction from a source. It is an inconsistency in our tree that the lead may want to look at.

## (d) Neighbours with no id
- **Tabanka** (Santiago and Maio procession music): proposed as its own record, see (a).
- **Neo-batuku** (Pantera generation: Tcheka, Vadú, Princezito, Lura, Mayra Andrade): kept inside batuku as an alias and in the sound. A separate record is possible later if the listening view needs it.
- **São João / Kola San Jon** (the drum rhythm Dulce Almada links to batuku, via Brito): no id.
- **Brazilian batuque** and the Azorean form (São Miguel) named by Brito: same word, a different tradition, no id. Do not use the alias `batuque` to match Brazilian recordings.

## (e) What fell short
- Gláucia Nogueira's two batuku studies (the 2011 master's thesis on the Cape Verde government portal, HTTP 503, and the 2012 RBEC article, host unreachable) could not be read. They are the best scholarly sources on the history and on the heritage listing.
- Nha Nácia Gomi and Ntóni Denti d'Oru, the best-known traditional singers, have no Wikipedia page and no biography that could be read. They are present only through album titles.
- The Wikipedia API rate-limited after a few calls, and MusicBrainz was busy once. The pages were fetched from plain article addresses instead.
- There are no original 1950s-80s recordings of the circle, and no Orlando Pantera recording: he died before making his album.
- Mayra Andrade's 'Dispidida' rests only on the Wikipedia example rows (no store lookup was made).
- At 76 claims the budget of about 60 was exceeded, because each song carries its own claim.

## (f) Questions for the lead
1. Is `wadrum` an acceptable principal parent for an island creole form, or should batuku have no principal parent until a source names one?
2. Keep `attested: true` for 1772, which rests on a ban on "zambunas" quoted only in pt Wikipedia, or record 1772 as an estimate?
3. Should finaçon be an alias, as proposed, given that the funaná band Finaçon already exists as an artist in data/?
4. Should a `tabanka` record be scheduled for a later helper round?
5. Peak 1995-2010 is a judgement from the dates of the revival. Should the traditional circle (no peak in the record era) instead be shown as a long, low presence from 1772?
