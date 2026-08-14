You have a LAN IP written down.
`~/projects/first-site/index.html` still sits on disk.
That number finds the machine.
It does not find a program.

Take the IP.
After it, type a colon and `8000`.
You now have `host:port`.
The **host** is the machine.
The **port** is the door.

A port is a number that picks which program on that machine should answer.
One address, many doors.
The usual `http` door, the usual `https` door, and this file's door can share one IP.
Each one sits behind a different number.
This file will use door `8000`.

## The numbers on the doors

Ports run from `0` to `65535`.
The usable range you can claim is `1` to `65535`.
Port `0` is reserved.

Three doors you will keep meeting:

- **80** is the usual door for `http://`.
- **443** is the usual door for `https://`.
- **8000** is the door this file will use.

`8000` is not registered as HTTP.
The registry calls it `irdmi`.
Local servers use it by convention.
People treat that convention as if it were official.
It is not.
The number still works.
The name on the registry does not make it HTTP.

Ports below `1024` are **privileged**.
An ordinary program cannot claim them.
`80` sits below that line.
So does `443`.
So does `22`, the ssh door.
`8000` does not.
That is why this file will use `8000`, not `80`.

## The browser hides two doors

A **URL** is the address you type in the browser.
It writes the host, then a colon, then the port.
The browser hides the port when it is the usual one.

Type `http://` and a host with no port.
The browser knocks on `80`.
Type `https://` with no port.
It knocks on `443`.
Any other door you must type.
`:8000` is mandatory.

```widget
{
  "type": "compare",
  "title": "When the browser fills in the door",
  "columns": [
    { "label": "`http://` with no port" },
    { "label": "`https://` with no port" },
    { "label": "`http://` plus `:8000`" }
  ],
  "rows": [
    {
      "aspect": "Door the browser knocks on",
      "cells": ["`80`", "`443`", "`8000`"]
    },
    {
      "aspect": "Do you type the port?",
      "cells": [
        "No — the browser hides it",
        "No — the browser hides it",
        "Yes — `:8000` is mandatory"
      ]
    }
  ],
  "caption": "Leave the port off and you get 80 or 443. Door 8000 you type."
}
```

Write that URL now.
Start with `http://`.
Paste the LAN IP you wrote down.
Finish with `:8000`.
You have three pieces: `http://`, the host, and the door.
Keep that line.
You will need it when the door opens.
Nothing answers yet.
The door is still shut.
You are learning its number, not opening it.

## See which doors are open

A program that is **listening** is waiting behind a door.
List the listeners.
On Linux, and in WSL, run:

```
ss -tlnp
```

Each flag has one job.
`-t` means TCP.
`-l` means listening.
`-n` keeps numbers, not service names.
You want to read `8000`, not a name.
`-p` names the process.

Look at the address:port column.
Scan it for `:8000`.
On a quiet machine that row is probably missing.
That is expected.
You have not opened the door yet.
Write down whether `:8000` appeared.
That note is your baseline.
You may see other rows.
Ignore them for now.
You are hunting `:8000`.

**On a Mac.** `ss` is a Linux tool.
List TCP listeners with `lsof -iTCP -sTCP:LISTEN -P -n`.
`-P` keeps port numbers.
`-n` keeps addresses numeric.

After the next topic, `ss -tlnp` will grow a line like this:

```
LISTEN 0      5            0.0.0.0:8000      0.0.0.0:*    users:(("python3",pid=8,fd=4))
```

`LISTEN` means a program is waiting.
The last field names the process: `python3`.
Do not start that process now.
Learn the column you will match.

```widget
{
  "type": "anatomy",
  "title": "The address:port column",
  "subject": "This is the field `ss` prints. Click each piece.",
  "parts": [
    {
      "text": "0.0.0.0",
      "label": "address",
      "note": "The address this door is written on. It is not the same writing as `127.0.0.1`."
    },
    { "text": ":" },
    {
      "text": "8000",
      "label": "port",
      "note": "The door. This is the number you type after the colon."
    }
  ],
  "caption": "Same door number on a different address is a different line. Match `0.0.0.0:8000` later, not the name `localhost`."
}
```

Read that column as `address:port`.
Left of the colon is the address.
Right of the colon is the door.

`0.0.0.0:8000` and `127.0.0.1:8000` share a door number.
They do not share an address.
Do not treat those two writings as the same.

**`localhost` is a name, not a second machine.**
It is written in `/etc/hosts` as a name for `127.0.0.1`.
It is not the LAN IP you wrote down.
The machine reads that file before it asks the wider network.
Open the file and look:

```
cat /etc/hosts
```

One machine prints this line:

```
127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
```

Yours may add or drop names.
The pair that matters is `127.0.0.1` and `localhost`.

You can name the door.
Port `8000` is the one `~/projects/first-site/index.html` will use.
You have listed what, if anything, is listening.
Next you open that door.
