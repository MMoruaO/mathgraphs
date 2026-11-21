# Daily puzzle editorial pilot

## Purpose and scope

This is a short interface and content pilot, not a production release calendar. It seeds one continuous twelve-day window: a seven-day archive/current week from 2026-11-15 through 2026-11-21, followed by five dates from 2026-11-22 through 2026-11-26 that are shown as locked. The example five days in the past is 2026-11-16.

Past released challenges remain playable. The current released UTC date is playable. Future dates appear locked and have no public puzzle IDs. If a date passes without a published puzzle, it is marked unavailable rather than shown as a playable archive. `src/data/dailySchedule.ts` owns the public date-to-puzzle mapping; dates are ISO `YYYY-MM-DD` and switch at 00:00 UTC.

The pilot intentionally has a fixed date range. It must be replaced with a rolling editorial schedule before it is treated as a live daily service. Unreleased drafts are stored only in the local, Git-ignored `daily-drafts/` directory. They must not be imported by the app, copied into public catalog files, force-added to Git, or included in a public build before release. This keeps future puzzle data out of both GitHub and the static client bundle.

## Seed calendar

| Date (UTC) | Puzzle | Topic | Difficulty |
|---|---|---|---|
| 2026-11-15 | An implication ladder | Logic | Easy |
| 2026-11-16 | Difference, set, and union | Set theory | Easy |
| 2026-11-17 | The two properties of a basis | Linear algebra | Easy |
| 2026-11-18 | Orthogonality and invertibility | Linear algebra | Medium |
| 2026-11-19 | Preimages of intersections and unions | Set theory | Medium |
| 2026-11-20 | Basis and unique coordinates | Linear algebra | Medium |
| 2026-11-21 | Intersection, set, and union | Set theory | Easy |
| 2026-11-22 | Locked / unpublished | — | — |
| 2026-11-23 | Locked / unpublished | — | — |
| 2026-11-24 | Locked / unpublished | — | — |
| 2026-11-25 | Locked / unpublished | — | — |
| 2026-11-26 | Locked / unpublished | — | — |

The released daily seed is deliberately focused on introductory logic, sets, and linear algebra. Evaluate every candidate against the expected preparation of early undergraduate students; do not imply that every first-semester student will already have studied a topic just because it appears in a standard text.

## Solver audit

The reviewed counts below are relative to the current curated catalog. They describe accepted arrangements found by exhaustive permutation search, not universal theorem proofs.

| Date | Accepted / evaluated arrangements |
|---|---:|
| 2026-11-15 | 1 / 24 |
| 2026-11-16 | 1 / 6 |
| 2026-11-17 | 2 / 6 |
| 2026-11-18 | 6 / 24 |
| 2026-11-19 | 4 / 24 |
| 2026-11-20 | 2 / 6 |
| 2026-11-21 | 1 / 6 |
| 2026-11-22–26 | Unpublished; no public solver counts | — |

## Source and reuse policy

The pilot puzzles use independently written MathGraphs statements, explanations, and graph constraints. Bibliographic links identify mathematical references, not copied exercises.

- Jim Hefferon, *Linear Algebra*, is a free text for a first undergraduate course. It covers linear systems, vector spaces, linear maps, matrices, determinants, and eigenvalues. Its official page lists one semester of calculus as a prerequisite, so its early concepts are references, not proof that the full pilot suits every first-semester student. The author permits use under either the GNU Free Documentation License or CC BY-SA 3.0. See [the text](https://hefferon.net/linearalgebra/) and [the license/source page](https://hefferon.net/source.html).
- Jim Hefferon, *Introduction to Proofs*, is useful as a reference for logic and sets. Its author describes it as an inquiry-based course for mathematics majors and notes that his students typically have prior calculus and linear algebra. Use its definitions as a reference; do not treat the book's assumed mathematical maturity as the target difficulty for MathGraphs. See [the text](https://hefferon.net/proofs/).

Do not copy textbook exercise wording, diagrams, or solutions into puzzle data. If a future puzzle adapts a licensed exercise, record the exact edition/section, attribution, license, and any share-alike obligations, and review compatibility with MathGraphs' distribution plans before publication.

## Required review before a real daily release

For every puzzle:

1. State its mathematical universe and assumptions explicitly.
2. Record the source theorem/definition and a concise mathematical justification for every catalog relation.
3. Run the exhaustive solver and record permutations evaluated and accepted arrangements. Counts describe the curated catalog only; they are not universal proofs.
4. Independently inspect all solutions and possible unintended arrangements.
5. Have a reviewer check the mathematics and a beginner playtester check clarity and moderate difficulty.
6. Review Spanish and English statements, context, explanation, and hints.
7. Assign a stable puzzle ID and a UTC release date only after review.

## Local draft and release workflow

1. Keep unreleased puzzle JSON and any catalog additions in `daily-drafts/`, which is ignored by Git. Do not copy draft titles, topics, statements, solution counts, or source notes into public documentation.
2. On the intended UTC release day, review the draft mathematics, assumptions, source attribution, all solver solutions, translations, and playability.
3. Copy the approved puzzle into `src/data/puzzles/`, merge only the catalog entries it needs into `src/data/masterCatalog.ts`, and assign its ID to that date in `src/data/dailySchedule.ts`.
4. Run typecheck, unit tests, browser interaction tests, and production build. Confirm the future draft is now intentionally part of the public release.
5. Publish the reviewed changes. After release, the puzzle remains public and playable in the archive.

This manual process is adequate for the interface pilot. A real daily service should use a deliberate release pipeline and rolling schedule; a static client cannot conceal data after it has been bundled.

Do not publish a candidate just because the solver finds a solution. The solver can only validate relations represented in the curated catalog.
