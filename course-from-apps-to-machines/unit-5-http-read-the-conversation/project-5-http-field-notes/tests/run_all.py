#!/usr/bin/env python3
"""
Runs all six HTTP Field Notes tests against a submission and prints a weighted score.

    python3 tests/run_all.py submission.json

Weights sum to 100. Each test prints PASS or a line beginning FAIL:.
"""

import os
import subprocess
import sys

TESTS = [
    ("test_local_response_authentic.py", 30),
    ("test_content_type_real_file.py", 25),
    ("test_public_capture_both_halves.py", 15),
    ("test_status_line_local.py", 10),
    ("test_redirect_is_3xx.py", 10),
    ("test_annotations_cover_six.py", 10),
]


def main(submission):
    here = os.path.dirname(os.path.abspath(__file__))
    earned = 0
    for name, weight in TESTS:
        result = subprocess.run(
            [sys.executable, os.path.join(here, name), submission],
            capture_output=True, text=True,
        )
        output = (result.stdout + result.stderr).strip()
        passed = output.splitlines()[0].strip() == "PASS" if output else False
        if passed:
            earned += weight
        print("[%s] %-38s (%2d)  %s" % ("PASS" if passed else "FAIL", name, weight,
                                        "" if passed else output))
    print("\nScore: %d/100" % earned)
    return 0 if earned == 100 else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "submission.json"))
