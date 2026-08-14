Open your file manager. That is the window of folders you click through.

Go to home. On Linux that folder is `/home/you`, with your login in place of `you`.

Do not drop the work on the Desktop. This course will look under home every time.

Inside home, make a folder called `projects`. Inside `projects`, make a folder called `first-site`.

Click into `first-site` so you can see it is empty. That empty folder is about to hold the page.

Open a text editor. Type this one line, and nothing else:

```html
<h1>Ground Zero</h1>
```

Save the file as `index.html` inside `first-site`. You now have `~/projects/first-site/index.html`.

On Linux that place is `/home/you/projects/first-site/index.html`.

Look back at the file manager. `index.html` should sit inside `first-site`, inside `projects`, inside home.

If you can see the file there, it has a place you can point at.

Double-click `index.html`. A browser opens. The page should say Ground Zero.

Now read the address bar. It should show `file:///home/you/projects/first-site/index.html`.

A file is a thing with a place. The browser wrote that place as a `file://` URL.

A URL is an address the browser knows how to open. The `file://` kind names a file on this computer.

It is not a page on the internet. That address works only on your machine.

Send it to a friend and they cannot open your file. Their computer does not have your copy.

The string in the bar is a path with a prefix. A path is the place of a file, written as folders separated by slashes.

On Linux yours is `/home/you/projects/first-site/index.html`. The words on the page are the content.

The bar is the place. You typed one. The browser named the other.

Home is not a program. It is a folder. Your files sit under it.

The Desktop is one folder among those. Easy to see. Easy to lose the path this course will ask for.

You got here by double-clicking. That is enough for this page.

The file lives on this computer, so this computer can open it. Leave both windows up.

Here is the nest you just built.

```widget
{
  "type": "tree",
  "title": "Where the page lives",
  "root": {
    "name": "home/",
    "note": "Linux keeps each account under here.",
    "children": [
      {
        "name": "you/",
        "tone": "ok",
        "note": "Your home. On Linux this is `/home/you`.",
        "children": [
          {
            "name": "Desktop/",
            "tone": "bad",
            "note": "Not here. This course will not look on the Desktop."
          },
          {
            "name": "projects/",
            "tone": "ok",
            "note": "The folder you just made.",
            "children": [
              {
                "name": "first-site/",
                "tone": "accent",
                "note": "One folder, one page.",
                "children": [
                  {
                    "name": "index.html",
                    "tone": "accent",
                    "note": "The file you typed. Double-click this."
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "caption": "The page is a file under home: `home/you/projects/first-site/index.html`."
}
```

Look at the address bar again. After `file://`, the next pieces are home.

On Linux they read `/home/you`. That is how you find home: it is already in the bar.

The folders after your name should still read `projects/first-site/index.html`. If they do, you put the file in the right nest.

If the bar contains `Desktop`, you put it in the wrong folder. Move `first-site` under `projects` under home. Double-click again.

If the bar contains `/mnt/c` or a drive letter such as `C:`, you are on the Windows side. Move the project to `/home/you/projects/first-site`. Double-click again.

The Desktop is a pile that grows. Home is the folder that is yours.

Put the project in `projects/first-site` under home so you can find it next time. The rest of the course uses that exact folder.

> **On your machine**
>
> On a Mac, home is `/Users/<you>`, not `/home/<you>`. The address bar will start `file:///Users/…`.
>
> On Windows with WSL, home is `/home/<you>` on the Linux side. Put the project there, not under `/mnt/c`. `/mnt/c` is the Windows `C:` drive as Linux sees it. The Windows Desktop lives on that side, so it is the wrong place too.

If the prefix in the bar is `/Users/…` or `/home/…`, you are fine. The last folders must still be `projects/first-site/index.html`.

That bar is the measurement. Before you started, the file did not exist.

Now it exists, and the browser can name it. Close the tab. Double-click `index.html` once more.

Same words. Same address. The file stayed. Leave the tab open.

You should still see Ground Zero and the `file://` address. The file manager still shows the same file.

Two writings of one place: a row in the file manager, and a `file://` URL in the bar.

## First-hour glossary

| Term | Meaning |
| --- | --- |
| Home | The folder that is yours. On Linux it is `/home/you`. |
| Path | The place of a file, written as folders separated by slashes. |
| File manager | The window of folders you click through. |
| `file://` | A browser address that names a file on this computer. It works only here. |
| Terminal | The app you type commands into. You do not need it yet. |

You have a file at `~/projects/first-site/index.html`. It is open.

The address starts with `file://`. Next you will take that address apart, piece by piece.
