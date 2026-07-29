# Quiz — A tablet hides the filesystem; a dev machine hands it to you

---

## Question 1

**Type:** MULTIPLE_CHOICE

You are on a MacBook, about to create the folder that will hold `projects/first-site/index.html`.
Which absolute path is your home directory — the folder your own work belongs in?

- `/home/<you>`
- `/Users/<you>`
- `/mnt/c/Users/<you>`
- `/Users/<you>/Desktop`

**Correct:** `/Users/<you>`

**Explanation:** Apple documents it in one line: "`/Users`—This directory contains one or more user
home directories. The user home directory is where user-related files are stored." `/home/<you>` is
the Linux and WSL answer, and typing it on a Mac gets you nowhere. `/mnt/c/Users/<you>` only exists
inside WSL, where it is the Windows drive seen from Linux — a Mac has no such mount. And
`/Users/<you>/Desktop` is a real path, which is exactly why it is tempting; it is still the place
files land when nobody decides where they go, the habit librarians describe as "saving everything to
desktop/not using file directories" (objective 1).

---

## Question 2

**Type:** MULTIPLE_CHOICE

You are running Ubuntu inside WSL on Windows 11. You are about to create `projects/first-site`. Which
location, and for which reason?

- `/mnt/c/Users/<you>/projects/first-site`, because that is the only place Windows apps can see it
- `/home/<you>/projects/first-site`, because `/mnt/c` is read-only from inside WSL
- `/home/<you>/projects/first-site`, because Microsoft recommends storing files in the WSL file
  system when you are working in a Linux command line
- `/mnt/c/Users/<you>/Desktop/first-site`, because you can then see the folder on your Windows desktop

**Correct:** `/home/<you>/projects/first-site`, because Microsoft recommends storing files in the WSL
file system when you are working in a Linux command line

**Explanation:** Microsoft's own guidance is explicit: "We recommend against working across operating
systems with your files... For the fastest performance speed, store your files in the WSL file system
if you are working in a Linux command line (Ubuntu, OpenSUSE, etc)", and they spell out the contrast
as "Use the Linux file system root directory: `/home/<user name>/Project` — Not the Windows file
system root directory: `/mnt/c/Users/<user name>/Project$`". The second option reaches the right path
by a wrong route — `/mnt/c` is not read-only, and a reason that is false today will mislead you
tomorrow. Both `/mnt/c` options optimise for seeing the folder in Windows, which is the "working
across operating systems" pattern Microsoft is warning you off (objective 1).

---

## Question 3

**Type:** MULTIPLE_CHOICE

Someone tells you a tablet can already do everything a laptop can. Which of these can you do on a
desktop or laptop machine but not on a stock phone or tablet?

- Install an app by tapping Install in the app store
- Hold the same `index.html` open in a text editor while a browser loads that same file
- Take a photo and attach it to a message
- Join a Wi-Fi network and load a web page

**Correct:** Hold the same `index.html` open in a text editor while a browser loads that same file

**Explanation:** Two independent programs reading and writing one file, addressed by its path, is a
desktop capability — and it is exactly the workflow of this course, where you edit `index.html` in
one window and reload it in another. Installing from an app store is something tablets do well; the
desktop-only version of that capability is installing a program that did *not* come from a store,
such as the web server you start in Unit 5. Taking a photo and joining Wi-Fi are things a tablet does
at least as well as a laptop, so neither discriminates (objective 2).

---

## Question 4

**Type:** MULTIPLE_CHOICE

A terminal window is showing this line and nothing else:

```
colin@seamus:~$
```

What can you correctly conclude?

- The username is `colin`, and the trailing `$` means this is bash — so Linux or WSL, not a Mac
- The username is `seamus`, and the `$` means the machine is waiting for a password
- This is a Mac, because macOS is the platform that shows your username in the prompt
- The `$` is the first character of the command you are supposed to type

**Correct:** The username is `colin`, and the trailing `$` means this is bash — so Linux or WSL, not a
Mac

**Explanation:** The stock bash prompt is `\u@\h:\w\$` — user, then `@`, then the machine's name — so
`colin` is the username and `seamus` is the machine, not the other way round. The last character is
the platform tell: bash ends its prompt with `$` and is the default on Linux and WSL, while macOS has
used zsh since Catalina and zsh prints `%`. So this cannot be a Mac. And the `$` is printed by the
shell, not typed by you: "The `$` character in tutorials indicates a command prompt. It is not meant
to be typed in" — copy-pasting it is common enough that a tool exists purely to strip it
(objective 3).

---

## Question 5

**Type:** TRUE_FALSE

On a dev machine, it does not much matter which folder a file is in, because you can always find it
again by searching for its name.

**Correct:** False

**Explanation:** The opposite is true. Search is how a phone works, and it is why "where is that
file?" can feel like a question with no answer — but the terminal you just opened cannot search on
your behalf. It has to be handed one written address, spelled from the top of the machine downward,
like `/home/colin/projects/first-site/index.html`. Search *finds* a file; a path *names* it, and from
Unit 2 onward naming is the only move available to you. That is the same reason the Desktop is a poor
home for project work — it is a place you look, not a place you chose (objectives 1, 2).
