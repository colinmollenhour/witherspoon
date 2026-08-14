<!-- MARKDOWN CELL 3 -->

## Before you edit the next cell: the first line

The next cell is not run the way the cell above it was. It is saved to a file called `build.sh`, made
executable, and then **run as a program** — `./build.sh`. Nobody tells the machine which shell to use.
The file has to say so itself, on its first line:

```
#!/bin/bash
```

That line names an absolute path to the program that will read the rest of the file. It matters more
than it looks, because on Ubuntu the two obvious answers are two different programs:

| You write | The machine runs |
| --- | --- |
| `#!/bin/bash` | bash — the same shell you have been typing into all unit |
| `#!/bin/sh` | whatever `/bin/sh` points at, and on Ubuntu that is a symlink to `dash` |

`sh` is not a nickname for bash here. It is a different program wearing a shorter name. Leave the
shebang alone unless you mean to change interpreters, and never delete it — a file with no first line
saying what it is has to be run by hand every time.

Two more things about the cell below before you touch it:

- **`>` starts a file. `>>` adds to it.** `>` empties whatever was there, with no warning and no
  question — the same class of hazard as `rm`. Every file in this script is started exactly once with
  `>` and extended after that with `>>`.
- **`|` is a connection, not a container.** A pipeline leaves nothing on disk. If you want the number
  a pipeline produced to survive, the pipeline's last stage still has to be redirected into a file.
