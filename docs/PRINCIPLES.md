# Design principles

How to judge a choice when no rule covers it. Each principle comes from the two records of 23 November 2026: [where the project came from](vision/2026-11-23-origins.md) and [where it is going](vision/2026-11-23-direction.md). Read those for the reasoning in full. This file may be refined as we learn. The records it comes from are not rewritten; corrections are added to them inline, dated.

## The product

1. **Authentic or nothing.** A playlist has to be able to impress someone who lived in that place and time. One wrong song breaks it. When speed and accuracy pull apart, accuracy wins.
2. **Familiar but new.** By default, lead people to something they half recognise and have not heard lately. Strange trips are a seasoning. If a feature keeps sending people somewhere they did not want to go, the weights are wrong, not the people.
3. **A moment, fast.** The first visit should reach music in about ten seconds and explain itself without the information button. Depth sits behind that, never in front of it.
4. **The result decides, not the mechanism.** We use whatever produces the best playlist for the listener. Today that is Spotify's AI working from our prompt. We replace it only when a real comparison says ours is at least as good.
5. **Freshness needs breadth.** People return if the same request can give them something they have not been given before. That is the reason to aim for a full song database, and the reason to remember what each person has already been offered.
6. **Local first.** A place's playlist leans to the music made there, the way a local radio station would, unless the listener asks otherwise.
7. **Out and back.** Unfamiliar music is tiring in long stretches. Anything that sequences listening alternates new ground with familiar ground.
8. **Genres are alive and continuous.** A genre has a life: it appears, takes hold, peaks, leaves the charts, survives as a niche, and only rarely dies. A tradition runs through time; it is not a point. Views must be able to show where a sound is now, not only where it began.

## The interface

9. **It is an iPhone app that happens to be a website.** Grouped lists, full-screen detail you can back out of to exactly where you were, capsule and text buttons, one icon family, one type scale. The approved style guide is the reference; do not design a new screen from scratch.
10. **One place for each function.** Before adding a control, find the one that already does this and reuse it, adjusting it if needed. Two controls for one job is a defect.
11. **Main action first.** Order every screen by what people come to do there, most common first.
12. **Empty is a design state.** A place or period with no data still has to feel intended on the globe and in the lists.

## The data

13. **Design before collection.** Know what is being collected, which properties each record carries, and why, before a research run starts. A second round must be able to continue the first.
14. **Things have identities.** Songs, artists, albums, genres and places each have a stable key. Nothing refers to another thing by a copied name or a position in a list.
15. **Completeness is tested separately from quality.** "Are the defining songs right" and "are the artists I listened to here" are different questions and need different research and different tests.
16. **No weight is neutral.** Every ranking embeds a judgement about what matters. State it, make it adjustable, and tune it against how playlists are received.
17. **Forward, with flags.** When research falls short, mark it precisely so it can be redone, and move on. Do not loop on a failure while the rest of the map is empty. What is thin is shown as thin, never dressed up.

## Learning from people

18. **Watch first, ask second.** Unpaid testers will not write reviews. Design each feature so that ordinary use tells us whether it works. Asking is for the cases where someone already wants to tell us something, and then it should take one tap.
19. **Stated and observed preferences both count, and they differ.** Lean on behaviour, and nudge toward what people say they want.
20. **Keep human and synthetic judgements apart.** Store them as separate scores so they can be compared and so a listener can choose the blend.
21. **A test is evidence about how the app feels, not a box to tick.** Every feature starts with the question it must answer and the measurement that answers it. If a measure stops reflecting real experience, change it and write down why.
22. **Everything is reproducible.** Which test, which version of it, on which data, with what result. Test prompts are versioned and never overwritten.

## Working

23. **The plan lives outside anyone's head.** The roadmap, the tracker and the work log are the memory of the project. A decision that is not written down has not been made.
24. **Own it.** Bring findings and proposals, not only finished tasks. Say what was not tested. Treat the owner's time and the free allowances as scarce.
25. **Nothing reaches users without the owner's approval, and user data is not touched without it.** See `CLAUDE.md` for the working rules.
