# ============================================================================
#  CODE CELL 2 — READ ONLY, do not edit
# ============================================================================
#  Carried forward from Project 2 (Cold start): rebuild the working tree from
#  nothing, using only the terminal.
#
#  This cell runs first, before your script, in the container's own shell.
#  It is the reason `~/projects/first-site/` exists when your script arrives.
#
#  `mkdir -p` is what makes it safe to run every single time:
#      "-p, --parents"  ->  "no error if existing, make parent directories as
#      needed"                                                        [src 19]
#  Run it on a fresh machine and it builds both folders. Run it on a machine
#  that already has them and it does nothing and says nothing.
# ============================================================================

mkdir -p ~/projects/first-site
cd ~/projects/first-site
ls -la

# ============================================================================
#  END READ ONLY
# ============================================================================
