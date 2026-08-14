# Outline critic

Read at the end of Stage 3, **before** the approval gate. The outline is still in memory; nothing
has been written to disk.

Isolated topic writers will faithfully execute whatever this outline specifies. A contract that says
"use the librarian quotes" and "do not create the file yet" produces that page. The critic is the
last chance to stop a specimen syllabus reaching the user.

## Who runs it

Spawn **one** agent that did not write the contracts. Hand it: the spine block (including the
default dialect), the full outline, every contract, and this file.

If you cannot spawn, do a distinct critic pass yourself: list the cuts, apply them, then continue.
Do not present the first draft. The author of twenty-one contracts will not cut them in the same
breath.

## What the critic may do

Cut, merge, reorder, rewrite contracts, retitle. Change a three-topic unit into two. Fold a
satellite into a "Requested activities" sidebar on the page that needs it.

It may **not** change the running example, the transformation numbers, the failure moment, the
licence, or the copyright holder. It may not add topics. If the spine itself is wrong, say so in
one line and leave it — that is a user decision, not a critic one.

## Checks, in order

1. **Unit 1 order.** First topic puts the running example in the learner's hands. Second names the
   parts they just saw. A design-bet / non-goals / competitor-contrast topic, if it exists, comes
   after that. See `spine.md` → First hour. Swap; do not add a pep paragraph.

2. **Leaves ≠ Inherits.** Walk every topic's handoff. If the leaving state equals the inherited
   state, it is not a topic — it is a sidebar. Fold it. A tool-skill (`Tab`, escaping an editor,
   `--help`) lives in a box on the page that first needs it, not as its own quiz.

3. **Count against the spine, not the size option.** The interview picked a band, not a quota.
   Three real state-changes beat eight mentions of the artifact. A large band (~6 units) is
   allowed only when the critic can write a different one-line artifact state for every topic.
   Otherwise cut down.

4. **One default dialect.** The spine names the path, OS, or tool the running example is written
   in. Exactly one setup topic (or a short appendix on topic 1) owns install and the platform map.
   Every other contract writes the default only, and may mention variants as an "On a Mac / On
   Windows" box of a few lines. A contract that restates the full three-platform table after
   setup has failed — strip it.

5. **Contracts do not paste the ledger.** Grounded facts (filled later) will be claims, numbers,
   and `[src N]` ids. A generation prompt that says "use the ACRLog quotes" or "quote RFC 1918
   verbatim" will put that quote on the page. Rewrite it to "teach the claim; do not paste the
   source." Error messages and a command's own output may still be named as objects of study.

6. **Every reading does something.** Each contract's READ request names a typed, clicked, or
   opened action in the opening, not only in a later project. "The file does not exist yet —
   Project 1 creates it" is a defect: the topic that teaches the address creates the file, or
   the project moves earlier.

7. **Titles name the thing they will do or hold**, not a thesis. Bad: *A tablet hides the
   filesystem; a dev machine hands it to you.* Good: *Where your files actually live.*

8. **Project briefs stay briefs.** The contract / project sketch for each project lists goal,
   tasks, done-when, expected shape, rules. Adversarial rationale and environment pins are
   author-side — they must not be asked of the learner-facing brief.

## Output

Return the **revised outline in full** — units, topics, objectives, contracts — not a diff and not
a memo. One short preamble naming what you cut and why (two or three lines) so the orchestrator
can tell the user at the approval gate.

The orchestrator **replaces** its outline with this result and presents that at Stage 4. The user
approves the criticised syllabus. They never see the first draft.
