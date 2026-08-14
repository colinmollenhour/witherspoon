You are standing in `~/projects/first-site`. Type this.

```
mkdir -p ~/projects/first-site
```

Nothing prints. The folder is already there. That is the point.

`-p` means *parents*. A parent is a folder that must exist before a child can sit inside it. `mkdir -p` creates every missing parent on the way. It also stays quiet if the path already exists. That second part is called *idempotent*: run it twice, same result. The path starts at `~`, so the command works from any folder. Read it from the left. `~` is already there. `projects` may be there. `first-site` may be there. `-p` fills any gap. That is why one line rebuilds the project from nothing.

Without `-p` the same idea fails in two ways. A missing parent prints `No such file or directory`. A folder that already exists prints `File exists`. You will rebuild this path later. Keep the one-liner with `-p`. You do not need the failures.

Now make a scratch file. Leave `index.html` alone.

```
touch scratch.txt
```

`touch` creates an empty file. It does not open a window. The file just appears. Practise copies, renames, and deletes on `scratch.txt`. The real page stays put until the project asks you to tear the folder down. Run `ls`. `scratch.txt` should sit next to `index.html`.

Copy keeps the original. Move does not.

```
cp scratch.txt scratch-copy.txt
```

`cp` needs `-r` before it will copy a directory. A directory is a folder: a named place that can hold files. You are copying a file, so the plain command is enough.

Rename the copy.

```
mv scratch-copy.txt notes.txt
```

You now have `scratch.txt` and `notes.txt` in this folder. The copy left the original. The rename only changed a name.

`mv` is two jobs in one command. If the destination does not exist, it is a new name. If the destination is a directory, the source moves inside it.

```widget
{
  "type": "compare",
  "title": "`mv a b` looks at `b` first",
  "columns": [
    { "label": "`b` is missing" },
    { "label": "`b` is a directory" }
  ],
  "rows": [
    {
      "aspect": "What happens",
      "cells": [
        "Rename: `a` is now called `b`.",
        "Move-into: `a` goes inside `b`."
      ]
    },
    {
      "aspect": "What you have after",
      "cells": [
        "One file, under the new name.",
        "The same file, living in that folder."
      ]
    }
  ],
  "caption": "Missing means rename. A directory means move inside. Same command."
}
```

Try the second job. Make a folder, then move `notes.txt` into it.

```
mkdir -p scratch-dir
mv notes.txt scratch-dir
```

`notes.txt` now lives inside `scratch-dir`. It is no longer sitting next to `index.html`. Same command, different destination, different job.

> **Tab and the up arrow**
>
> You are not supposed to memorise long paths. Type `~/pr` and press Tab. The shell should finish `projects` if that folder exists. Press the up arrow to recall the last command. Edit it. Run it again.

A space in a name splits it. The shell reads `my file.html` as two words, `my` and `file.html`. Quote the whole name so it stays one word.

```
touch "my file.html"
mv "my file.html" "my notes.html"
```

Double quotes are enough here. Skip them and the command looks for a file called `my` that you do not have.

Safety flags exist for the nervous moment. Plain `mv` will overwrite a file that already has the destination name. `cp -i` and `mv -i` prompt before they overwrite. `cp -n` and `mv -n` refuse to overwrite. Use them when two names might collide.

Delete is the one that does not forgive.

```
rm scratch.txt
```

`rm` has no trash. The file is gone. There is no undo. The file manager's trash is a different tool. `rm` does not use it. An engineer at GitLab once ran `rm -rf` on the wrong database host and destroyed live production data. Your scratch file is smaller. The rule is the same.

By default `rm` does not remove directories. `rm scratch-dir` refuses. The flag `-r` means *recursive*: delete the folder and everything inside it. `-i` prompts before every removal. `-f` never prompts.

The slash is the other trap. `rm -r home/` starts from where you are standing. `rm -r /home/` starts at the top of the machine. That leading `/` is the difference between a local folder and every user's home. Do not run the second one.

Clean up the rest of the scratch work.

```
rm "my notes.html"
rm -r scratch-dir
```

`index.html` is still here. Check with `ls` if you want. You did not touch it. The scratch names are gone. The folder is the same one you opened as `file://`.

You can now rebuild the folder from the keyboard:

```
mkdir -p ~/projects/first-site
```

The project will delete this path and ask you to bring it back for real. `rm` is how it disappears. `mkdir -p` is how it returns. The page itself is still the file you double-clicked. Next you will put words into it without a mouse.
