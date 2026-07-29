# Flashcards — Loopback versus the network

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

**Front:** `127.0.0.1`

**Back:** An address meaning *this machine* — on whichever machine is asking. RFC 6890 marks the whole
`127.0.0.0/8` block `Forwardable | False` and `Global | False`, so no router ever carries it anywhere.

---

**Front:** `localhost`

**Back:** A **name** for `127.0.0.1`, defined in the plain text file `/etc/hosts` on every machine:
`127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4`. It needs no network
because `files` is consulted before `dns`.

---

**Front:** `0.0.0.0`

**Back:** A **bind instruction**, not a destination: "accept connections arriving on any interface."
It is what a server listens on, never something you type into a browser. Your banner —
`Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...` — has said so since Topic 18.

---

**Front:** Bind address versus destination address — what is the difference?

**Back:** A bind address answers "which of my interfaces should I receive connections on" and is set
by the server at startup. A destination address answers "who am I sending this to" and is set by the
client. `0.0.0.0` is only ever the first kind; `127.0.0.1` can be either.

---

**Front:** Your phone, on the same Wi-Fi, loaded `http://localhost:8000` and got nothing. What did it actually do?

**Back:** It resolved `localhost` from its own `/etc/hosts` to `127.0.0.1`, then asked *itself* for
port 8000, found nothing listening, and gave up. No packet left the phone, so the laptop's access log
stayed silent.

---

**Front:** Command to find your LAN IPv4 address on Linux or WSL

**Back:** `ip addr`. Read the `inet` line on the Wi-Fi interface, not the `lo` block — `lo` reads
`inet 127.0.0.1/8 scope host lo`, which is loopback.

---

**Front:** On macOS, why can't you jump straight to asking `en0` for its address?

**Back:** Wi-Fi is not reliably `en0` — Apple Silicon Macs have been reported as `en2`. Run
`networksetup -listallhardwareports` first to find which device is Wi-Fi.

---

**Front:** macOS command that prints one interface's IPv4 address, and what empty output means

**Back:** `ipconfig getifaddr <interface>`. It "will be empty if no service is currently configured or
active on the interface" — empty means you named the wrong interface, so go back to the hardware-ports
list.

---

**Front:** You found an address. How do you check it is a normal local-network address?

**Back:** See whether it falls in one of RFC 1918's three private blocks: `10.0.0.0 - 10.255.255.255`,
`172.16.0.0 - 172.31.255.255`, or `192.168.0.0 - 192.168.255.255`. Anything starting `127.` is the
loopback line you meant to skip.

---

**Front:** A real access-log line reads `127.0.0.1 - - [29/Jul/2026 04:26:16] "GET /nope HTTP/1.1" 404 -`. What does the first field prove?

**Back:** It is the address of whoever asked. `127.0.0.1` means the laptop asked itself. A line whose
first field is the phone's address is proof that a request crossed the network and was answered — and
it is what Project 6 grades.
