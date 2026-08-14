# Rubric — Network Self-Portrait

Four criteria. Integer weights summing to exactly **100**.

| # | Criterion | Weight |
| --- | --- | --- |
| 1 | The address portrait is correct and internally consistent | 30 |
| 2 | Every captured field is real output from the learner's own machine | 25 |
| 3 | Commands are the ones the stated platform actually has | 20 |
| 4 | **Craft** — the refused-vs-timeout observation shows the timing tell was understood, not restated | 25 |
| | **Total** | **100** |

---

## 1. The address portrait is correct and internally consistent (30)

`lan_ip` is a valid dotted quad, four octets each 0–255. It is not inside `127.0.0.0/8` and is not
`0.0.0.0`. It falls inside one of RFC 1918's three blocks — `10.0.0.0/8`, `172.16.0.0/12`, or
`192.168.0.0/16` [src 47] — and `rfc1918_block` names **that** block, not a different one. Watch the
middle block in particular: an address in `172.32.x.x` is public and belongs in none of the three, so
a submission claiming `172.16.0.0/12` for it is wrong even though the first octet matches.

`gateway` is a valid dotted quad, is not inside `127.0.0.0/8`, and is a different address from
`lan_ip`. `loopback_line` contains `127.0.0.1`, and on Linux or WSL it carries the `/8` prefix,
showing the learner understood that the whole block is loopback rather than the single address
[src 49, 50]. `lan_ip` and the address in `loopback_line` are different values.

`curl_status` is exactly three digits in the range 100–599 — the five status classes [src 84].

**Full credit:** every one of the above holds.
**Partial:** the address is real and correctly classified but one supporting field (gateway,
curl_status) is malformed or missing.
**No credit:** `lan_ip` is a loopback address, is outside all three private blocks with no
explanation, or `rfc1918_block` contradicts `lan_ip`.

## 2. Every captured field is real output from the learner's own machine (25)

`lan_ip` appears verbatim inside `lan_ip_command_output` — the address was read off a screen, not
recalled. On Linux or WSL, `lan_ip_command_output` contains the token `inet`, which is what a real
`ip addr` block prints [src 51]; a bare address with no surrounding output does not qualify on those
platforms. On macOS a bare address does qualify, because `ipconfig getifaddr` "Prints to standard
output the IP address for the first network service associated with the given interface" [src 64] and
prints nothing else.

`listening_ports` is raw pasted output containing at least one `address:port` pair, with the port an
integer in 1–65535 [src 36, 38] — or the explicit `NO LISTENERS FOUND` sentinel where the machine
genuinely had none. Blank process columns are expected and must not be penalised: `ss -p` fills that
column for the learner's own processes and leaves it blank for other users' [src 59]. Reformatted,
re-typed, aligned, or truncated output loses credit here even when the values are right, because the
point of the field is that it is evidence.

**Full credit:** every captured block is plainly raw command output and the cross-checks hold.
**Partial:** output is real but tidied, truncated, or one block is a summary rather than a paste.
**No credit:** `lan_ip` does not appear anywhere in `lan_ip_command_output`, or a block is
paraphrased rather than captured.

## 3. Commands are the ones the stated platform actually has (20)

`platform` is one of `macOS`, `Linux`, `WSL`, and `lan_ip_command` is a command that platform has.

For `macOS`, that means `ipconfig getifaddr <device>` [src 64], ideally with
`networksetup -listallhardwareports` shown as the step that found the device name [src 65]. It must
**not** be `ip addr` or anything using `ss`: no `ip(8)` or `ss` man page exists in the current macOS
man-page set [src 63], so those commands do not run there at all. A submission pairing
`platform: macOS` with `ip addr` fails this criterion outright — the output could not have come from
the machine described.

For `Linux` or `WSL`, that means `ip addr` or a narrower form such as `ip -4 addr show` [src 51].
`ifconfig` does not earn credit: Canonical's own statement is "We've already stopped installing
ifconfig on desktops (it still gets installed on servers for now)" [src 62].

Award the same scrutiny to the other captured commands where the learner names them: `ss -tlnp` and
`ip route` on Linux and WSL, `lsof -iTCP -sTCP:LISTEN -P -n` and `netstat -r` on macOS [src 58, 61,
66].

**Full credit:** every command named belongs to the stated platform, and the macOS two-step for
finding the interface is present where the platform is macOS.
**Partial:** the LAN IP command is right for the platform but another command is borrowed from the
wrong column.
**No credit:** the LAN IP command does not exist on the stated platform.

## 4. Craft — the refused-vs-timeout observation shows the timing tell was understood (25)

This is the criterion that separates a filled-in form from an understood one, and it is graded on the
learner's own words in `refused_vs_timeout`, not on the fields around it.

Full credit needs all four of these:

1. **Both exit codes named and attached to the right failure** — `7` for the connection nothing
   accepted, `28` for the host that never answered [src 132, 134].
2. **The timing stated as an observation, in the learner's own units** — how long each command
   actually took on their machine, with the first described as immediate and the second as a wait
   that ran out. A restatement of the definitions ("refused is fast, timeout is slow") without any
   evidence of having watched it happen is a partial answer at best.
3. **The reason the timing differs, correctly explained** — a refusal is an *answer*, and answers come
   back at the speed of the network; a host that is not there, or a firewall discarding packets, sends
   nothing at all, so `curl` has no choice but to wait until it gives up. A response that says the
   timings differ but treats it as arbitrary, or attributes the delay to "a slower server", misses the
   point.
4. **The wording trap avoided** — the learner does not claim to have seen "Connection refused" in the
   plain output. That phrase appears only under `-v` [src 132]; the plain line says
   `Could not connect to server`. A submission that reports seeing "Connection refused" without `-v`
   is reporting something that did not happen on their screen, and loses this element even if
   everything else is right.

The strongest answers go one step further and say what the tell is *for*: that an instant failure
sends you back to check what is actually bound and which port you typed, while a slow failure sends
you looking at the address and at whatever sits between the two machines. That is the diagnostic
Unit 6 runs on, and a learner who has already articulated it will not need it explained again.

**Full credit (23–25):** all four elements, with the timing given as something observed.
**Strong (18–22):** all four elements, but the timing reads as recalled from the reading rather than
measured.
**Partial (10–17):** both codes named and the timing contrast present, but the explanation of *why*
is missing or wrong.
**No credit (0–9):** the definitions are restated with no observation, the codes are swapped, or the
plain output is claimed to have said "Connection refused".
