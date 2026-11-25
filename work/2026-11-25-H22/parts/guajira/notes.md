# guajira: Música guajira and punto cubano (H22 research notes, read 2026-11-25)

## (a) Confidence
Good for identity, instruments, form and the UNESCO listing: UNESCO's own page and English and Spanish Wikipedia agree, and every claim (97) was found by the checker. The playlist is full (25 songs, 9 albums) and every song exists on an iTunes album page. The genre tie is strong for Indio Naborí (track titles say "Punto Cubano", "Controversia Guajira"; Wikipedia calls him the greatest name in punto), Justo Vega and Adolfo Alfonso (listed under "Intérpretes de punto cubano"; album "Controversias"), Celina González, Albita, Ramón Veloz, Coralia Fernández, Radeúnda Lima and Portabales (named as punto or guajira-son performers on Wikipedia), and Joseíto Fernández (guajira-son). **Ties by title only:** Evelio Rodríguez's El arroyo que murmura and Duo Spirituano's Pobre guajiro (only from the compilation title "25 Guajiras Inmortales"; El arroyo que murmura is also the 1899 first guajira, but that page names the song, not this recording). Weak points: `began` 1700 is an estimate (17th-century popularity, 18th-century consolidation); the peak window's end (1965) is a judgement; the ES "later" line's start year (1935) is a judgement, since no source dates the punto's life on La Palma; the origin coordinates (Santa Clara) are a judgement for a diffuse rural origin; most release years are null because the tracks come from reissues.

Scope choice: one record covering both punto (the improvised décima tradition) and the composed guajira and guajira-son that grew from it, as the task named. The sources treat guajira as "derived from the punto cubano"; Portabales's guajira-son is, by English Wikipedia's own account, son and bolero-son with country words. The playlist keeps both but leans to punto.

## (b) Sources
- UNESCO, Punto (Representative List, inscribed 2017): https://ich.unesco.org/en/RL/punto-01297
- Wikipedia (en), Punto guajiro: https://en.wikipedia.org/wiki/Punto_guajiro
- Wikipedia (es), Punto cubano: https://es.wikipedia.org/wiki/Punto_cubano
- Wikipedia (en), Guajira (music): https://en.wikipedia.org/wiki/Guajira_(music)
- Wikipedia (es), Guajira (música): https://es.wikipedia.org/wiki/Guajira_(m%C3%BAsica)
- Wikipedia (en), Twoubadou: https://en.wikipedia.org/wiki/Twoubadou
- Wikipedia (en), Guantanamera: https://en.wikipedia.org/wiki/Guantanamera
- Wikipedia (es), Jesús Orta Ruiz: https://es.wikipedia.org/wiki/Jes%C3%BAs_Orta_Ruiz
- Wikipedia (es), Celina González: https://es.wikipedia.org/wiki/Celina_Gonz%C3%A1lez
- Wikipedia (es), José Fernández Díaz (Joseíto Fernández): https://es.wikipedia.org/wiki/Jos%C3%A9_Fern%C3%A1ndez_D%C3%ADaz
- iTunes lookup (album and track lists), ids: 346713347 (Por los Campos de Cuba - 25 Guajiras Inmortales), 516392921 (El Indio Naborí, Punto Cubano), 1523395701 (Celina y Reutilio, Rezos y Cantos Guajiros), 1757719424 and 1510823338 (Justo Vega & Adolfo Alfonso, Controversias 1 and 2), 1522995485 (Portabales, Aquí Está Portabales!), 943039097 (Portabales, La Guajira de Salón), 1618176367 (Las Canciones de Joseíto Fernández), 1495440475 (Ramón Veloz, Linda Guajira), 1529970716 (Veloz & Coralia Fernández, Amanecer Guajiro), 1373342449 and 1145626533 (Celina González, EGREM 1984 and 1982), 1145571155 (Albita, Habrá Música Guajira), 1721638164 (Radeúnda Lima, Mi Tierra Es Así), 157700389 (Paco de Lucía, Festival Flamenco Gitano), 1732307891 (Pete Seeger, Complete Carnegie Hall Concert 1963). Addresses are `https://itunes.apple.com/lookup?id=<id>&entity=song`.

## (c) Disagreements with our records
- **Twoubadou**: our record (`data/genres.json`, parentage `son` principal, `bolero` other) ties twoubadou to Cuban son. English Wikipedia (citing Manuel, Caribbean Currents, p. 156) says it "combined music derived from the guajiro traditions of Cuba" with méringue, and its infobox gives "Méringue combined with Cuban guajiro traditions" as stylistic origins. So the research note's claim is supported, with two caveats: the source says "guajiro traditions", not "guitar style", and the book was not read. Proposed as an `other` parent, leaving son as principal.
- **iberianpop** ends in 1800 and is centred on Seville; the sources put punto's roots in Andalusia "and above all in the Canaries" (the décima, the coplas and the laúd came from the Canaries). The parent link holds, but the tree has no Canary Islands record.
- **Guantanamera's year**: Spanish Wikipedia says the melody was composed in 1928; English Wikipedia says 1929 is the consensus. Not in our data yet. 1928 is used here, as a judgement.
- **flamenco**: our parentage has no Cuban input to flamenco. English Wikipedia says the punto was taken into flamenco as the guajira palo in the second half of the 19th century. Proposed as `guajira → flamenco`, kind `other`.

## (d) Neighbours with no id
- Canary Islands folk music (punto canario, isas, folías), the other side of the "round trip" with punto cubano.
- Puerto Rican música jíbara (seis, aguinaldo, décima with cuatro), the nearest sister tradition; English Wikipedia's twoubadou page calls the guajiro tradition "related to the jibaro musical tradition of Puerto Rico". Not researched here.
- Changüí exists in the tree only as a name in Wikipedia's navigation, not as an id; not relevant to the parentage given.

## (e) What fell short
- Spanish Wikipedia's API answered HTTP 429 for most of the run. Articles were read from the plain address instead. The pages on Ramón Veloz, Coralia Fernández and Radeúnda Lima were not read (missing, or the rate limit), so those three are tied to the genre only through the Guajira (music) pages.
- No primary or scholarly source (Manuel 2004 "The guajira between Cuba and Spain"; Linares; Sublette) was read. Everything rests on UNESCO, Wikipedia and iTunes.
- No first-release dates for the 1940s-50s recordings (Celina y Reutilio on Ansonia, Ramón Veloz on Musart, the compilation tracks), so their years are null. MusicBrainz was not used.
- No recording of the Naborí and Ángel Valiente "controversia del siglo" was found.
- 97 claims is above the brief's guide of about 60, because each song has its own track-row claim and the years have separate copyright-line claims.

## (f) Questions for the lead
1. Is one record for punto plus guajira and guajira-son right, or should guajira-son (Portabales) be left under `son` as a sub-genre? The sources say guajira-son is son in all but its words.
2. Should `guajira → twoubadou` (other) be added on Wikipedia's word alone, or wait until someone reads Manuel's book?
3. Should the tree get a Canary Islands folk record, as punto's other home and the source of its décima and laúd?
4. Name: "Música guajira and punto cubano" is proposed. The task's "Música guajira / punto cubano" uses a slash; choose one.
