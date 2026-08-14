`~/projects/first-site/index.html` is already on disk.

Do not open it. Do not edit it. The page can wait.

This topic is about the machine that holds the file, not the file.

Open a terminal. Type this and press Enter:

```bash
ip -4 addr
```

A list of interfaces appears. An interface is a named connection the machine uses to talk on a network.

One line will look exactly like this:

```
inet 127.0.0.1/8 scope host lo
```

```widget
{
  "type": "anatomy",
  "title": "The loopback line, piece by piece",
  "subject": "Click any piece of the line.",
  "parts": [
    { "text": "inet", "label": "IPv4 row", "note": "This line is an IPv4 address. IPv4 is four octets — 32 bits in total." },
    { "text": " " },
    { "text": "127.0.0.1", "label": "loopback", "note": "This computer talking to itself. Not the address on your Wi-Fi." },
    { "text": "/" },
    { "text": "8", "label": "whole block", "note": "The `/8` means the whole `127.0.0.0/8` block is loopback, not only `.1`." },
    { "text": " " },
    { "text": "scope host", "label": "this host only", "note": "This address must not appear outside a host. Skip the line." },
    { "text": " " },
    { "text": "lo", "label": "the interface", "note": "`lo` is the loopback interface. It is never the LAN address." }
  ],
  "caption": "If the line says `127.0.0.1` and `lo`, it is not the address you write down."
}
```

That line is loopback. Loopback is this computer talking to itself.

The address is `127.0.0.1`. The `/8` means the whole `127.0.0.0/8` block is loopback, not only `.1`.

`scope host` and `lo` mark it as this host only. Loopback must not appear outside a host.

So this is not the address you write down.

Scan the rest of the listing. Each `inet` line sits under an interface name.

`lo` is loopback. Skip it.

Find an `inet` line that is not `127.0.0.1`.

The four dotted numbers after `inet` are this machine's LAN address.

A LAN is a local area network: the machines that share your Wi-Fi.

The `-4` keeps the list to IPv4. Write that address down. You will need it later.

> **On a Mac.** There is no `ip` command. First run `networksetup -listallhardwareports`. Find the device name next to Wi-Fi — it is not always `en0`. Then run `ipconfig getifaddr` with that name. Empty output means the wrong interface, not a missing network.

> **On Windows / WSL.** Run the same `ip -4 addr` inside your Ubuntu terminal.

## Four numbers

An IPv4 address is four octets. An octet is eight bits. Four of them make 32 bits in total.

They are written with dots, like `192.168.1.42`.

That shape is a documented example, not a capture from this machine. Your numbers will differ.

Every machine on the Wi-Fi has one of these. They are private addresses.

A private address is one that anyone may use on their own network. You do not register it first.

These three ranges are the RFC 1918 private blocks. RFC 1918 is just the name of that reservation.

| Block | Addresses that belong |
| --- | --- |
| `10.0.0.0/8` | `10.0.0.0`–`10.255.255.255` |
| `172.16.0.0/12` | `172.16.0.0`–`172.31.255.255` |
| `192.168.0.0/16` | `192.168.0.0`–`192.168.255.255` |

These numbers are not unique on the internet. Another network may use the same four octets.

They only have to be unique on your LAN.

Read the first number of the address you wrote down.

If it is `10`, the address sits in `10.0.0.0/8`.

If the first two numbers are `192.168`, it sits in `192.168.0.0/16`.

The middle block is the trap. `172` is not enough.

The second number must sit between `16` and `31`.

`172.16.0.0` through `172.31.255.255` is private. A `172` with any other second number is not.

Try a shape. `10.0.0.5` starts with `10`, so it is `10.0.0.0/8`.

`192.168.1.42` starts with `192.168`, so it is `192.168.0.0/16`.

Now classify yours. Tick one of the three rows.

Write the block next to the address. You need both later.

If the number you wrote is `127.0.0.1`, you copied the loopback line. Look at the listing again.

If you see more than one other `inet` line, pick the interface you are actually using.

## This computer, or the network

`127.0.0.1` means this computer talking to itself.

Nothing on the Wi-Fi can use it. It never leaves the machine.

A `192.168` address is the opposite kind of local. Other machines on your network can send to it.

It still stops at your network. A private address is not reachable from the public internet.

When traffic goes out, the router rewrites the private address. That rewrite is NAT. We stop there.

```widget
{
  "type": "compare",
  "title": "`127.0.0.1` versus a `192.168` address",
  "columns": [
    { "label": "`127.0.0.1`" },
    { "label": "`192.168.x.x`" }
  ],
  "rows": [
    {
      "aspect": "Who can use it",
      "cells": [
        "Only this computer. It is loopback.",
        "Any machine on your local network."
      ]
    },
    {
      "aspect": "Does it leave the machine",
      "cells": [
        "No. Loopback must not appear outside a host.",
        "Yes, on the local network. It still stops at your router."
      ]
    }
  ],
  "caption": "`127.0.0.1` never leaves this computer. A `192.168` address is for the local network, not the public internet."
}
```

The same wall applies to a `10.` address and to a `172.16`–`31.` address. Private means local.

## Keep the number

You have not touched `index.html`. The file is still in `~/projects/first-site`.

What changed is what you know about the machine that holds it.

You printed its LAN address. You placed that address in one of the three private blocks.

Copy the number somewhere you will not lose it.

Do not copy `127.0.0.1`. If that is what you have on paper, run the command again.

Next you will look at the doors on that address. An address names the machine. Something still has to be listening.
