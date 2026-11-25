# H25: Synthetic expert test for genres, pilot

Date 2026-11-24. Branch `helper/2026-11-24-h25`. Run configured as `claude-opus-5-5` (the serving model can differ from the configured one; every sub-agent reported `claude-opus-5-5`). Sub-agents: 74, all started with model `opus`, each reporting `claude-opus-5-5` and tools used "Read, Write" only.

## What was asked

Give each of the 1,454 songs in `work/2026-11-24-genretest/songs.json` to an unaided "music historian" sub-agent, 40 songs per batch with the full `genres.json`, using the brief in the queue word for word; run the whole set twice with different shuffles; hand back the answers and counts, without scoring against our data.

## What is in this folder

- `answers.run1.json`: run 1, one record per song: `song, known, genre, second, sure, missing, batch, model` (1,453 records; one is missing, see below).
- `answers.run2.json`: run 2, same shape (1,454 records).
- `seeds.json`: the two seeds and how the batches were made.
- `REPORT.md`: this file.

## How it was run

- Batches: `random.Random(seed).shuffle()` on the list in `songs.json`, in file order, then 40 songs at a time (37 batches, the last 14). Run 1 seed 20261124, run 2 seed 74. Batch numbers in the answer files refer to these splits.
- Each sub-agent got the brief from the queue exactly, then a short note on how the material reached it. **One departure from "use no tools":** the genre list (230 KB) and the batch were too large to paste into a prompt, so each sub-agent was told to read exactly two files (the genre list and its batch, copied outside the repository to a scratch folder) and to write its answers to one file, and nothing else: no web, no shell, no search, no other file. All 74 reported using only Read and Write. I cannot see inside a sub-agent beyond its report and its tool count; the counts (5 to 12 calls each) fit reading the genre list in several parts plus one batch read and one write.
- I (the run) did not look up anything about the songs. I checked only that each answer file was valid JSON, had one answer per song, and used only ids from the list.

## What was found

| | Run 1 | Run 2 |
| :- | -: | -: |
| Songs answered | 1,453 | 1,454 |
| `known: yes` | 1,180 (81%) | 1,158 (80%) |
| `genre: none` | 74 | 72 |
| sure high / medium / low | 756 / 550 / 147 | 765 / 558 / 131 |

Agreement between the two runs, over the 1,453 songs both answered:

- Same `genre`: **1,336 of 1,453 (92%)**.
- Same `genre` when both runs said known: 1,049 of 1,121 (94%). When both said not known: 198 of 236 (84%).
- The two runs gave the same `known` answer for 1,357 songs (93%).
- Looser: the two answers share an id in either `genre` or `second` for 1,425 (98%).
- By sureness, where both runs gave the same level: high 681 of 685 the same, medium 397 of 434, low 53 of 92.

Agreement is consistency, not correctness: the same model can repeat the same mistake. The lead's scoring against the answer key is what measures accuracy.

Most used genres across both runs: `none` 146, `dancepop` 111, `softrock` 89, `jpop` 56, `rocknroll` 43, `poprap` 35, `tinpan` 34, `synthpop` 34, `britbeat` 32.

### The 30 most frequent `missing` phrases (both runs together; 146 phrases, 127 distinct)

The phrases are free text and rarely repeat word for word, so beyond the first 17 the order among count-1 phrases is arbitrary.

1. 1960s british orchestral pop ballad (3)
2. pop-punk (3)
3. spanish summer novelty pop (canción del verano) (2)
4. 1990s adult-contemporary pop ballad (2)
5. easy listening orchestral pop (2)
6. adult contemporary pop ballad (2)
7. british boogie and hard rock (2)
8. easy listening steel-guitar instrumental (2)
9. pop/r&b power ballad (2)
10. post-rock (2)
11. contemporary romanian pop (2)
12. not a song: chart placeholder (2)
13. 1970s hard rock / blues rock (2)
14. mainstream pop rock (late 80s/90s) (2)
15. 2000s adult contemporary pop (2)
16. 1960s american bubblegum pop (2)
17. 2000s mainstream pop ballad (2)
18. 2020s pop rock / piano power ballad (1)
19. 1990s adult-contemporary pop power ballad (1)
20. acoustic guitar pop (2010s) (1)
21. 2000s acoustic pop ballad (1)
22. 1990s arena/stadium rock (1)
23. azerbaijani pop (estrada) (1)
24. 2020s mainstream pop (retro country-tinged) (1)
25. 2000s uk pop ballad (1)
26. easy listening orchestral instrumental pop (1)
27. 2010s indie pop / art pop (1)
28. 2000s acoustic pop singer-songwriter (1)
29. 1980s-90s pop and r&b ballad (1)
30. quiet storm / contemporary r&b ballad (1)

A rough keyword sort of all 146 phrases (my grouping by words in the phrase, not a judgement): pop ballad or adult contemporary 45; pop rock or rock (hard, arena, mainstream) 37; easy listening or orchestral pop 12; a named country's contemporary pop 10; other 42.

## Sources

None. The assignment forbids lookups; nothing in this folder is sourced, and none of it is evidence under the project's evidence rule. It is model judgement only.

## What fell short

- **Run 1, batch 9:** the sub-agent wrote 39 answers for 40 songs and said 39. Song `s_rv0xwzbjgt` (Ciwan Haco, "Gula Sor", 1983) has no run-1 answer. It was not re-asked, because a second ask would not be independent. Run 2 has it.
- No sub-agent refused, used a web or shell tool by its own report, returned malformed JSON, or used an id not in the list. All `none` answers carry a `missing` phrase and no other answer does.
- The tool-use departure described under "How it was run" (reading the two files instead of having them pasted in).
- Two "songs" are chart placeholders, not songs: `s_c9q3ccj5ez` ("No Top 40 released", charted AT 2021) and `s_60g8asbbz0` ("Summer break - no chart", charted NZ 1970). Both runs answered `none` for both and said so in `missing`.

## Questions for the lead

1. The `missing` phrases concentrate on mainstream pop ballads, adult contemporary and mainstream or hard rock. Is that a gap in the genre set, or should such songs go to an existing broad id (`softrock`, `dancepop`), with the brief saying so?
2. Should the two placeholder rows (`s_c9q3ccj5ez` "No Top 40 released", `s_60g8asbbz0` "Summer break - no chart") be removed from the chart data they came from?
