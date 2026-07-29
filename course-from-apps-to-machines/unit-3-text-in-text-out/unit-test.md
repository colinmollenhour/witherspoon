# Unit 3 test — Text in, text out

**Assesses:** editing files in place from the terminal and escaping any editor you land in
(`which nano`, `Ctrl-O`, `Ctrl-X`, `code .`, `Esc` then `:q!`); turning command output into files with
`>` and `>>` and knowing which of the two destroys what is already there; the two output streams, and
why an error still reaches your screen through a redirect; discarding output with `> /dev/null`;
chaining programs with `|`, what each stage receives, and paging long output with `| less`; and
generating `~/projects/first-site/index.html` from command output rather than typing it.

**Passing score:** 70

---

## 1. MULTIPLE_CHOICE

You are standing in `~/projects/first-site/` and want to change one line of `index.html` without
leaving the terminal. You run `which nano`. The shell prints nothing at all and hands you back the
prompt. What has happened, and what is the right next move?

- nano opened and closed too fast to see — run it again and watch more carefully
- **`which` searched for a program called nano and found none on this machine, so nano is not the tool here — use `code .`, or `vi`, which Unix-like systems ship as a matter of course**
- `index.html` does not exist yet, so `which` had nothing to check — create the file first
- nano is installed but has to be saved before it reports a path — press `Ctrl-O`, then Enter, then run the check again

**Explanation:** `which` locates a *program* on disk. Silence is an answer: it means there is no nano
here, and that is precisely why the check comes before the habit. nano ships by default on Ubuntu
(`Priority: standard`, with both `ubuntu-standard` and `ubuntu-wsl` depending on it) and on Fedora
(`nano-default-editor` in `@standard`) [src 34], and the default Ubuntu WSL image carries
`nano 7.2-2ubuntu0.1` [src 130] — but its presence on current macOS could not be confirmed, so you
check rather than assume. The third option confuses `which` with a test on a file; `which` never looked
at `index.html` and would print the same nothing whether the file existed or not. The fourth borrows
nano's own save key, `Ctrl-O` — Write Out — which only exists once nano is running and cannot conjure
an absent program. The first treats a silent, instant return as a failure to observe, when a silent
return is the result. (objective 1)

---

## 2. MULTIPLE_CHOICE

From inside `~/projects/first-site/`, you run `code .`. VS Code opens. What is in front of you?

- A new, empty, unsaved file named `.`
- `index.html` on its own, opened as a single document, with nothing else listed
- **The `first-site` folder, with a sidebar listing everything inside it — `index.html` included**
- Your home directory, because `code` always starts where you log in

**Explanation:** `.` is the current directory, so `code .` does not say "open a file" — it says *open
this folder*, and the editor opens with `first-site/` in the sidebar. That is the design, not a
convenience: a project is a directory tree, not a file, so an editor that is handed the tree knows what
else exists and what each file sits next to. The second option is what a double-click from a file
manager gives you, and it is exactly the blindness Unit 1 removed — an editor holding one bare file
knows nothing but that file. The first reads `.` as a filename; it is a directory, and the shell has
meant that by it since Unit 1. The fourth describes bare `cd`, which is the command that goes to
`$HOME` when you give it no argument. (objective 2)

---

## 3. MULTIPLE_CHOICE

Something on the machine dropped you into `vim` without asking. You have typed several sentences that
went nowhere useful, and you want out, keeping none of them. Which sequence returns you to the prompt?

- `Ctrl-O`, then Enter, then `Ctrl-X`
- **`Esc`, then type `:q!`, then Enter**
- `Ctrl-C`, pressed twice
- Close the terminal window and open a new one

**Explanation:** `Esc` leaves whatever mode you are in and returns to the mode where keystrokes are
commands rather than text; then `:` starts a command, `q` is quit, and `!` means *do it anyway*,
discarding what you typed. The first option is nano's pair — `^O` Write Out, `^X` Exit — and reaching
for the keys of the editor you know while sitting in the editor you do not is how people get trapped in
the first place. `Ctrl-C` interrupts a running command; vim is not misbehaving, it is waiting. Closing
the window does technically work, and it costs you the shell you were standing in — its directory, its
history — to solve a two-keystroke problem. If it helps: "How do I exit Vim?" has **3,316,707 views**
and is the most-viewed question on Stack Overflow [src 160]. This is the most common moment in the
history of the profession, not your personal failure. (objective 3)

---

## 4. MULTIPLE_CHOICE

In `~/projects/first-site/` you run these three commands, in this order:

```
echo "one" > notes.txt
echo "two" >> notes.txt
echo "three" > notes.txt
```

What does `cat notes.txt` print afterwards?

- `one`, then `two`, then `three`
- **`three`, and nothing else**
- `one`, then `two`
- `two`, then `three`

**Explanation:** `>` starts a file from scratch. It creates the file if it is missing and empties it if
it is not — so the third command threw away everything the first two put there, and one line survives.
The first option reads all three arrows as "add", which is what `>>` does and `>` does not; that single
misreading is the whole hazard, because `>` destroys the existing contents with no warning and no
prompt, the same class of danger as `rm` in Unit 2. The third option assumes something refused the third
command or protected the file; nothing did, and nothing will. The fourth imagines `>` replacing only the
file's first line, which is a tidy idea the shell has never implemented. (objective 4)

---

## 5. TRUE_FALSE

You run `mkdir ~/projects/first-site > out.txt`. The folder already exists, so the command fails and
prints `mkdir: cannot create directory '.../first-site': File exists`. Because of the `>`, that message
goes into `out.txt` and your screen stays clean.

**Answer:** False

**Explanation:** The opposite is true — the message appears on your screen, and `out.txt` ends up empty.
A program has *two* output streams. `>` redirects standard output only; error messages travel on
standard error, a separate channel that the plain `>` never touched, which is why redirecting a failing
command still leaves the complaint in front of you. `2>` is the redirect that captures the error stream.
This is not trivia to be filed away: the web server you meet in Unit 5 prints its startup banner to
stdout and every single access-log line to stderr [src 116], so which stream a program chose decides
where its output can be sent and which redirect will catch it. (objective 5)

---

## 6. MULTIPLE_CHOICE

Which situation is `> /dev/null` actually for?

- You want to keep a command's output but have not chosen a filename, so you park it in `/dev/null` and rename it later
- You want to delete a file safely, so you send it to `/dev/null`
- **You are running a command for what it does, not for what it prints, and its chatter is burying the one line you are watching for**
- You want to empty an existing file without deleting the file itself

**Explanation:** `/dev/null` is a destination that discards whatever is written to it, so `> /dev/null`
means "produce this output and throw it away" — the right move when a command's noise is drowning out
something you care about, or when you only want the command's *effect*. The first option treats it as a
temporary file, but nothing is stored there, so there is nothing to rename later; that is the same
container mistake in a new costume. The second confuses redirection with file management: `>` writes a
command's output somewhere, it does not move or remove files — that is `mv` and `rm` from Unit 2. The
fourth is a real job, but it is what `>` pointed at *that file* does, not what `/dev/null` does.
(objective 6)

---

## 7. MULTIPLE_CHOICE

You run:

```
ls -la ~/projects | grep site | wc -l
```

A number prints. You then run `ls` and there is no new file anywhere. A classmate insists the command
must have failed. Who is right?

- The classmate — the chain needed a filename on the end, as in `ls -la ~/projects | grep site | wc -l site-count.txt`
- **You — `|` is a connection between running programs, not a container. Text flowed out of each program and into the next, the last one printed to your screen, and nothing was ever put on disk**
- The classmate — each stage of a pipeline writes a temporary file and deletes it when the next stage has read it, so the file existed and is gone
- You — the result was written into `~/projects` rather than into the current directory, so `ls` looked in the wrong place

**Explanation:** Nothing failed, and nothing was supposed to appear. `>` makes a **container**; `|`
makes a **connection**. That is the whole distinction, and collapsing the two is the most reliable way to
misread every command in this unit. The first option is the right instinct spelled wrong: if you want to
keep the number, you add a redirect — `... | wc -l > site-count.txt` — because `wc` reads a bare word
after it as a file to *count*, not a place to write. The third invents a mechanism the shell does not
use: the three programs run at the same time and text flows between them while they run, so there is no
temporary file to find. The fourth assumes the shell picks a directory for you; it did not write
anywhere, because you never asked it to write. (objectives 4, 7)

---

## 8. SHORT_ANSWER

`grep -rn "http" ~/projects` prints hundreds of lines, and they scroll off the top of the screen before
you can read the first one. Write the command that lets you read them from the beginning, one screen at
a time. Then say what `less` is receiving, and whether any file exists on disk afterwards.

**Sample answer:** `grep -rn "http" ~/projects | less`. The pipe hands `grep`'s standard output to
`less` as its standard input. `less` normally takes a filename; here it is given no filename at all and
reads the text arriving on the pipe instead, behaving exactly as it does on a file — arrow keys to move
in both directions, `q` to quit. No file exists afterwards. The pipe is a connection, so once `less`
exits there is nothing on disk to read again or clean up; if you want the results kept, that is a
separate job for `>`.

**A grader must see:** (1) the pipe with `less` on its right-hand side; (2) that `less` is receiving
`grep`'s output on stdin rather than being given a filename; (3) that nothing is written to disk — this
is the distinction from `>`, not a variation on it. (objectives 7, 8)

---

## 9. SHORT_ANSWER

You are in `~/projects/first-site/` and `index.html` currently holds an old version of the page that you
do not want any part of. Using only `echo` and redirection — no editor — write the two commands that
leave `index.html` holding exactly these two lines, in this order:

```
<title>First Site</title>
<h1>Hello from the terminal</h1>
```

Say which arrow belongs on which line and why, and explain why nothing on the machine checked that what
you wrote was really HTML.

**Sample answer:**

```
echo "<title>First Site</title>" > index.html
echo "<h1>Hello from the terminal</h1>" >> index.html
```

The first command uses `>` because the old page has to go: `>` empties the file and starts it again, so
the truncation that is a hazard everywhere else is exactly the tool here. The second uses `>>` because
the title line now has to survive — `>` on that line would destroy it and leave a one-line page. Nothing
checked the bytes because nothing ever does. `index.html` is a file of bytes and `echo` just wrote some;
`.html` on the end is a hint about what is inside, not a rule the machine enforces, which is the same
reason renaming a `.jpg` to `.png` does not convert the picture [src 166]. The *name* matters later for a
different reason: when a directory is requested, the web server looks for a file called exactly
`index.html` [src 112].

**A grader must see:** (1) both commands, with `>` on the first and `>>` on the second — the order is the
answer, not a detail; (2) the reason: start the file once, then add to it, because `>` on the second line
would take the first line with it; (3) that the file is bytes and the extension is a hint, not a check.
(objectives 4, 9)
