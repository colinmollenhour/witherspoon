#!/bin/bash
# ============================================================================
#  CODE CELL 4 — this is the one you edit.
#
#  Saved as ~/build.sh, made executable, and run as ./build.sh
#  Everything below is a command you already know from Topics 8, 9 and 10.
#  Two gaps are marked TODO A and TODO B. Nothing else needs to change.
# ============================================================================

cd ~/projects/first-site

# ---------------------------------------------------------------- 1. the page
# `>` creates index.html if it is missing and empties it if it is not.
# This is the only line in the whole script that is allowed to start the page,
# which is why it is the only line here using a single arrow.
echo "<title>First Site</title>" > index.html

# TODO A ---------------------------------------------------------------------
# Add the heading line to index.html. The heading is:
#
#     <h1>Hello from the terminal</h1>
#
# Use `echo`, and use the arrow that ADDS to a file rather than replacing it.
# Pick the wrong arrow and the title line above disappears — check with `cat`.
# ----------------------------------------------------------------------------


# ------------------------------------------------------------ 2. the manifest
# Start the manifest, then append the listing of every page in this folder.
# `ls -la` prints one line per entry; `grep html` keeps only the lines that
# mention html; `>>` puts what survives on the end of MANIFEST.txt.
echo "MANIFEST for first-site" > MANIFEST.txt
ls -la | grep html >> MANIFEST.txt
echo "pages:" >> MANIFEST.txt

# TODO B ---------------------------------------------------------------------
# The line below is a lie. It appends the character 0 no matter how many pages
# this folder actually holds. Delete it and append a real COUNT instead.
#
# Build the count out of three stages you have already run by hand:
#
#     ls -la     ->     grep html     ->     wc -l
#
# then send the last stage's output to the end of MANIFEST.txt. Remember that
# the pipe is a connection: on its own it puts nothing on disk.
echo "0" >> MANIFEST.txt
# ----------------------------------------------------------------------------


# --------------------------------------------------------- 3. show your work
echo "--- index.html ---"
cat index.html
echo "--- MANIFEST.txt ---"
cat MANIFEST.txt
