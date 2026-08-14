# Unit 4 test — Reach the phone

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

**What's covered:** Quick check: can you say why localhost failed, put the LAN IP on the phone, and restart the server from a two-line runbook?

**Pass at:** 70%

## Question 1

**Type:** SHORT_ANSWER

The server banner reads `Serving HTTP on 0.0.0.0 port 8000`. What does `0.0.0.0` mean here?

**Sample answer:**

The server is listening on all interfaces, not only loopback. A client that can reach this machine's LAN IP on port 8000 can talk to it.

**A full-credit answer shows:**

A strong answer covers: (1) all interfaces, not just 127.0.0.1; (2) that is why the LAN URL can work.

**Explanation:**

`0.0.0.0` as a bind address is every door. `127.0.0.1` as a bind would have been laptop-only (objective 2).

## Question 2

**Type:** SHORT_ANSWER

`python3 -m http.server 80` fails with `PermissionError: [Errno 13] Permission denied` for an ordinary user. Why does 8000 work?

**Sample answer:**

Ports below 1024 are privileged. Port 80 needs extra rights. Port 8000 is above that line, so an ordinary user can bind it.

**A full-credit answer shows:**

A strong answer covers: (1) ports below 1024 are privileged; (2) 80 is in that range; (3) 8000 is not.

**Explanation:**

The privileged-port line is 1024. That is a Unix convention; on Linux the sysctl default is 1024 (objective 5).

## Question 3

**Type:** SHORT_ANSWER

The phone still cannot load `http://192.168.x.x:8000`. Put these checks in the order that eliminates a whole class each time: firewall; server running in the right folder; phone using the LAN IP not localhost.

**Sample answer:**

1. Is the server running, in `~/projects/first-site`? 2. Is the phone using the LAN IP, not localhost? 3. Then the firewall.

**A full-credit answer shows:**

A strong answer puts server/directory first, then the URL the phone typed, then firewall. Order may swap the first two if both are named before firewall.

**Explanation:**

Do not start with the firewall. Confirm the server is up and the phone is asking for the laptop, then look at filters (objective 6).

## Question 4

**Type:** TRUE_FALSE

The two-line runbook is: start `python3 -m http.server 8000` inside `~/projects/first-site`; stop with Ctrl-C.

**Correct answer:** true

**Explanation:**

Start in the right folder on 8000. Stop with Ctrl-C — you should see `Keyboard interrupt received, exiting.` That is the whole runbook (objective 6).

## Question 5

**Type:** MULTIPLE_CHOICE

Why does `http://localhost:8000` work on the laptop and fail on the phone?

- The server is bound to the laptop only because you forgot a flag
- `localhost` means the machine that is asking — the phone asked itself
- Phones cannot speak HTTP
- Port 8000 is blocked on every phone by default

**Correct option index:** 1

**Explanation:**

The banner already said `0.0.0.0` — the server was willing. The phone used the wrong name for the laptop (objectives 1, 2).

## Question 6

**Type:** MULTIPLE_CHOICE

Your LAN IP is `192.168.1.42`. Which URL do you type on the phone?

- `http://localhost:8000`
- `http://127.0.0.1:8000`
- `http://192.168.1.42:8000`
- `file:///home/you/projects/first-site/index.html`

**Correct option index:** 2

**Explanation:**

The third address uses the LAN IP and port 8000. `localhost` and `127.0.0.1` are the phone talking to itself. `file://` is not on the network at all (objective 3).
