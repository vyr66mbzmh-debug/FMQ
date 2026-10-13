# FMQ Prototype versions v04

## v04 — 13 October 2026

Released from the existing verified LaTeX library. Further conversion is paused at the user's request. This is a usable release of the available content; the full two-book library is not complete.

- 40 of 137 skills available: 938 questions and 2,441 original worked-solution sections.
- Pure Core 1: 1.01–1.27 (27 skills, 687 questions).
- Pure Core 2: 2.01–2.04, 2.38–2.40, 2.52, 2.55, 2.59, 2.66, 2.70, 2.74 (13 skills, 251 questions).
- The other 97 skills remain visible as Awaiting conversion. Unverified drafts are excluded.
- The v03 layout, book/topic/skill navigation, Reveal next, full solution, question/solution full-page views, presentation mode and fullscreen controls are retained.
- Question and solution text is rendered from LaTeX; original mathematical diagrams are retained. No question-page scans are used as substitutes.
- Skill 2.04 contains one additional worked-solution entry, number 34, present only in the source solutions PDF.

Validation: all 40 included skills loaded in the browser and displayed their final question and complete solution; no browser warnings/errors were recorded. All 17,461 mathematical expressions passed strict rendering validation. Question and solution-section counts match the verified conversion records. All referenced diagram files are present. ZIP integrity and file counts are checked on packaging.

## Source differences retained

Skill 2.39 Q28b: the textbook gives y=1/3 at x=1, while the worked solution uses y=e/3. Q34b: the textbook gives y=2/3 at x=0, while the solution uses y=5/3. These source differences are preserved, as are the original Q8a integrating-factor differential and Q16d final expression.

The repository LaTeX projects and saved unfinished conversion work are preserved separately. They have not been replaced by the prototype's browser files.

## v04.1 loading correction
Content is bundled locally rather than fetched. Open OPEN_FMQ.html directly after extracting the complete folder. Browser verification passed for all 40 skills, final questions and full solutions, original diagrams, reveal, navigation and full-page mode with no page errors.
