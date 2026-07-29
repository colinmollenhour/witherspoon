#!/usr/bin/env python3
"""
test_05_runbook_starts_stops_and_closes  —  weight 10

The mechanical floor under the runbook. It checks only what a machine can check: that the
runbook says how to start the server, how to stop it, and how to close what the project
opened. Whether the runbook is any good — whether a stranger could follow it — is the
craft criterion in rubric.md and is not decided here.

  * a start line containing `python3 -m http.server`
  * a stop line containing `Ctrl-C` (or `Ctrl+C`); the server prints
    `Keyboard interrupt received, exiting.` when it receives it
  * a `## Teardown` section with real content under it, because this project has the
    learner open an inbound port on a machine a beginner owns, and a runbook that never
    closes it has taught half a habit
  * on WSL, that the teardown section names the rule that was created — `MyWebServer`

Self-contained: standard library only. Usage:
    python3 test_05_runbook_starts_stops_and_closes.py path/to/submission.txt
Prints PASS, or a single definite failure line beginning FAIL:.
"""

import os
import re
import sys

HEADER = re.compile(r"^===\s*([a-z_]+)\s*===\s*$")
PLATFORMS = ("macOS", "Linux", "WSL")
NO_CHANGE = "No firewall change was made."


def parse(path):
    fields, cur = {}, None
    with open(path, encoding="utf-8") as fh:
        for raw in fh:
            line = raw.rstrip("\n")
            m = HEADER.match(line)
            if m:
                cur = m.group(1)
                fields[cur] = []
                continue
            if line.startswith(";;"):
                continue
            if cur is not None:
                fields[cur].append(line)
    return {k: "\n".join(v).strip() for k, v in fields.items()}


def fail(msg):
    print("FAIL: " + msg)
    sys.exit(1)


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("SUBMISSION", "submission.txt")
    try:
        f = parse(path)
    except OSError as exc:
        fail("cannot read the submission file %r (%s)" % (path, exc.strerror))

    platform = f.get("platform", "")
    if platform not in PLATFORMS:
        fail("platform is %r — it must be exactly one of macOS, Linux, WSL" % platform)

    runbook = f.get("runbook", "")
    if not runbook:
        fail("runbook is empty — fill in starter/runbook-skeleton.md and paste it here")

    lines = runbook.split("\n")

    if not any("python3 -m http.server" in ln for ln in lines):
        fail("the runbook has no line containing `python3 -m http.server` — a runbook that does "
             "not say how to start the thing is not a runbook")

    if not any(("Ctrl-C" in ln) or ("Ctrl+C" in ln) for ln in lines):
        fail("the runbook has no line containing `Ctrl-C` — it must say how to stop the server. "
             "A server left running keeps serving your project directory to everyone on that "
             "Wi-Fi")

    heads = [i for i, ln in enumerate(lines) if ln.strip().startswith("## Teardown")]
    if not heads:
        fail("the runbook has no `## Teardown` section — this project has you open an inbound "
             "port, and the runbook has to say how it gets closed again")

    start = heads[0] + 1
    end = len(lines)
    for i in range(start, len(lines)):
        if lines[i].strip().startswith("## "):
            end = i
            break
    section = [ln.strip() for ln in lines[start:end] if ln.strip()]
    content = [ln for ln in section if not ln.startswith("<")]

    if not content:
        fail("the `## Teardown` section is empty or still holds only the skeleton's "
             "angle-bracket prompts — replace them with what you actually did")

    joined = "\n".join(content)

    if platform == "WSL":
        if "MyWebServer" not in joined:
            fail("platform is WSL but the Teardown section does not name `MyWebServer`, the "
                 "Hyper-V firewall rule this project had you create. Name the rule and record "
                 "the exact command you ran to remove it")
    else:
        if NO_CHANGE not in joined and max(len(ln) for ln in content) < 20:
            fail("the Teardown section says too little to act on. Either name the firewall entry "
                 "or setting that was changed and how it was reversed, or state exactly: "
                 "%r" % NO_CHANGE)

    print("PASS")


if __name__ == "__main__":
    main()
