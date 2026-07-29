# A file is bytes; the extension is only a hint

You have `~/projects/first-site/index.html` and you can say its address out loud. Double-click it and
a browser opens a page. The icon on it looks like a browser icon. So the obvious conclusion is that
the file *is* a web page — that `.html` on the end is what makes it one.

That conclusion is wrong, and it will cost you an afternoon later. Here is the belief in the wild,
written by someone who was sure of it:

> "From experience I know that if I save .jpg file with an .png extension (or vice versa) the most
> programs will open it as normally." [src 166]

## Rename a file and nothing happens

Make a file called `notes.txt` next to your `index.html`. Type a sentence into it. Now rename it to
`notes.html` — in your file manager, click the name, edit it, press Enter.

Three things change: the name, the icon, and the program that opens on a double-click. One thing does
not change: the **bytes**. A byte is the unit a file is stored in — one byte holds one character of
plain English text. Your sentence occupies the same bytes, in the same order, before and after. If
the file's size read as 12 before, it reads as 12 after.

The extension is the part of the name after the final dot. It is not stored separately from the name,
it is not a property of the file, and nothing enforces it. It is a **hint to the desktop about which
program to launch**. Rename a photo to `.txt` and the desktop will dutifully open it in a text editor
and show you garbage — because the bytes were never text, and renaming changes the label, not the
contents.

## The same bytes, two programs

The running example proves this without any extra files. Open `~/projects/first-site/index.html`
twice.

| Program | What it does with the bytes |
| --- | --- |
| A text editor | Shows you every character exactly as stored — you see `<h1>` and `</h1>` as literal text |
| A browser | Reads the same characters as instructions and draws the result — the `<h1>` becomes a large heading and disappears from view |

Neither program is showing you "the file." Each shows you *its own interpretation* of one unchanged
sequence of bytes: the editor reads them as text, the browser reads them as markup — tags that
describe structure. `index.html` is a plain text file the whole time.

That is the sentence to keep: **a file is bytes, and meaning lives in the program that opens it.**

*Forward reference, one line:* when this same file is served over a real web server in Unit 5, the
extension stops being ignorable — the server reads it and sends `Content-type: text/html` alongside
the bytes [src 114], so the browser is *told* what it received instead of guessing. Note the name and
move on.

## The folder that looks empty

Second belief worth killing early. People open a folder, see nothing, and conclude it is empty:

> "Why doesn't this show the hidden files/folders?" — 222,790 views [src 162]

A file whose name begins with a dot is a **dotfile**, and by long convention tools do not list it
unless you ask. Nothing is encrypted or protected; the name starts with `.` and the listing skips it.
This is why configuration lives in dotfiles: out of your way until you want it.

The listing you will meet everywhere is `ls -la`. From the manual: `-a` means "do not ignore entries
starting with ." and `-l` means "use a long listing format" [src 13]. You are here to *read* one, not
to run one — Unit 2 owns commands. This is a real capture from a real machine [src 10]:

```
drwxr-xr-x.   3 colin ubuntu  120 Jul 29 04:25 .
-rw-------.   1 colin ubuntu   14 Jul 29 04:25 .env
-rw-r--r--.   1 colin ubuntu   12 Jul 29 04:25 index.html
drwxr-xr-x.   2 colin ubuntu   40 Jul 29 04:25 projects
```

Take the `index.html` row and walk it left to right.

| Field | Value here | What it means |
| --- | --- | --- |
| Type character | `-` | A regular file. `d` means a directory (a folder) |
| Owner triple | `rw-` | The owner may read and write it, but not execute it |
| Group triple | `r--` | Members of the group may read it only |
| Others triple | `r--` | Everyone else may read it only |
| Link count | `1` | How many names point at this data |
| Owner | `colin` | The user account that owns it |
| Group | `ubuntu` | The group that owns it |
| Size | `12` | Twelve bytes. Twelve characters of text |
| Modified | `Jul 29 04:25` | When the contents last changed |
| Name | `index.html` | The label — including the hint |

The nine characters after the type character are three **triples**, always in this order: owner,
group, others. Inside each triple the slots are always `r`, `w`, `x` — `r` read, `w` write, `x`
execute (run it as a program; on a directory, `x` means you may enter it). A `-` in a slot means that
permission is absent. Reading these is the skill; changing them is not this topic.

Now the other rows. `projects` starts with `d`: a directory, and its `rwxr-xr-x` includes `x`, so it
can be entered. `.env` is a dotfile — invisible without `-a` — and `rw-------` gives the owner read
and write and everybody else nothing. The first row is named `.`, which is the folder being listed,
itself.

Two things that will otherwise confuse you:

- **The 11th character.** Every permission string above ends in a `.` before the spaces. That is not
  part of the permissions. It is an SELinux security-context marker, printed on Fedora and RHEL
  machines; plain Ubuntu and Debian print ten characters with no dot [src 11]. If your own listing is
  one character shorter than this one, nothing is wrong.
- **Where the default came from.** New files on Ubuntu arrive as `644` and new directories as `755`,
  because of a setting called the umask, default `0022` [src 12]. `644` is the `rw-r--r--` on
  `index.html`; `755` is the `rwxr-xr-x` on `projects`. `.env` is narrower than the default, so
  something deliberately set it that way.

## Where this leaves you

You can now read any `ls -la` line field by field, you know a dot-prefixed name is hidden rather than
missing, and you know `index.html` is plain text that a browser chooses to interpret. The extension
is a hint your desktop takes seriously and the bytes ignore. Next you build the folder by hand, in
Project 1 — and after that you stop clicking to create files and start typing the commands that make
them.
