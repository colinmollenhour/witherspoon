The laptop tab still shows your page.
`http://localhost:8000` works there.

Pick the phone up.
Type the same URL again.

It fails.
Same letters.
A different machine.

`localhost` is not a shared name for the laptop.
It is the machine that is asking.

The phone asked itself.
Its browser looked for a server on the phone.
Nothing on the phone is serving `~/projects/first-site`.

## The name that never leaves

`localhost` and `127.0.0.1` name the same kind of address.

`127.0.0.1` is loopback.
Loopback is this computer talking to itself.

Loopback must not appear outside a host.
The phone cannot use the laptop's loopback.
It has its own `127.0.0.1`.
That address never leaves the phone either.

That is why the laptop tab works and the phone does not.
The laptop asked itself, and the server is there.
The phone asked itself, and the server is not.

People type `localhost` from another device because it already worked once.
The name did not travel with you.
It never meant "the laptop".
It meant "me".

## All doors were already open

The server should still be running in `~/projects/first-site`.
If the terminal is gone, start it again:

```bash
python3 -m http.server 8000
```

Look at the first line it printed.
That line is the **banner** — the server saying where it listens.

```
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

```widget
{
  "type": "anatomy",
  "title": "The banner, piece by piece",
  "subject": "Click any piece of the line the server printed.",
  "parts": [
    { "text": "Serving HTTP", "label": "the job", "note": "This process answers HTTP requests." },
    { "text": " on " },
    { "text": "0.0.0.0", "label": "all interfaces", "note": "Every address this machine has. Not loopback only." },
    { "text": " port " },
    { "text": "8000", "label": "the door", "note": "The port you type after the colon." },
    { "text": " (" },
    { "text": "http://0.0.0.0:8000/", "label": "not a phone URL", "note": "This writes the bind as a URL. Do not type `0.0.0.0` on the phone." },
    { "text": ") ..." }
  ],
  "caption": "`0.0.0.0` is where the server listens. It is not the address the phone types."
}
```

A **bind address** is the address the server listens on.

`0.0.0.0` means all interfaces.
Every address this machine has is a door the server will answer.
The number you wrote down in Unit 3 is one of those doors.

`127.0.0.1` as a bind would mean this machine only.
`--bind 127.0.0.1` is how you ask for that.
You did not type that flag.

The default is all interfaces.
The banner already said so.
Read the word after `on`.
It is `0.0.0.0`, not `127.0.0.1`.

You do not restart the server with a new flag.
The server was willing.
The URL was not.

Do not type `http://0.0.0.0:8000` on the phone.
`0.0.0.0` is a listen address, not a place the phone can visit.

## Type the third address

You wrote a LAN IP down in Unit 3.
A **LAN** is the machines that share your Wi-Fi.
That number is the laptop on this network.
If the scrap is gone, run `ip -4 addr` again.
Skip the `127.0.0.1` line.
Write the other number.

On the phone, type `http://`, then that number, then `:8000`.

Both devices must be on the same Wi-Fi.
Mobile data is a different network.
A phone on mobile data cannot see a private LAN address.

Open it.

The same `index.html` should appear.
The phone sent the request to the laptop this time.
Same file.
A third address.

Look back at the terminal.

A new line appears when the phone asks.
That line is an **access log** — the server's record of who asked.

The first field is the client.

Reload the laptop tab.
That new line starts with `127.0.0.1`.
The laptop asked itself again.

Reload the phone.
The next line starts with a different address.
That address is the phone.
It is not `127.0.0.1`.

Do not guess the number.
Read the one the server just printed.
The different first field is the proof the second device arrived.

```widget
{
  "type": "compare",
  "title": "Same page, three attempts",
  "columns": [
    { "label": "`http://localhost:8000` on the laptop", "tone": "ok" },
    { "label": "`http://localhost:8000` on the phone", "tone": "bad" },
    { "label": "`http://192.168.x.x:8000` on the phone", "tone": "ok" }
  ],
  "rows": [
    {
      "aspect": "Who the host names",
      "cells": [
        "The laptop — the machine that is asking.",
        "The phone — the machine that is asking.",
        "The laptop — the LAN IP you wrote down."
      ]
    },
    {
      "aspect": "Does the page load",
      "cells": [
        "Yes. The server is on this machine.",
        "No. The phone asked itself.",
        "Yes, on the same Wi-Fi."
      ]
    },
    {
      "aspect": "Log first field",
      "cells": [
        "`127.0.0.1`",
        "None on the laptop. The request never left the phone.",
        "The phone — not `127.0.0.1`."
      ]
    }
  ],
  "caption": "The server was willing. The phone needs the LAN IP, not localhost."
}
```

If you typed the LAN URL and the page still fails, look at the laptop.
Watch the terminal while you reload the phone.
If no new log line appears, the request never reached the server.
A **firewall** is a filter that can block inbound connections.
The bind can be `0.0.0.0` and the packet can still stop there.

> **On Windows / WSL.** A Windows browser can reach WSL at `localhost`. The phone cannot. Default NAT often blocks LAN. The last page of this unit has the documented path.

## What you carry forward

The same file now loads at `http://192.168.x.x:8000` on a second device.
The access log shows that client.

You have three addresses for one file.
The next page writes the two lines that start and stop this.
