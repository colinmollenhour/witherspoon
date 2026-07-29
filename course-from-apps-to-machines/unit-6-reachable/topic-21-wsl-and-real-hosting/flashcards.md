# Flashcards — WSL, and the shape of real hosting

---

**Front:** Why does a server inside WSL 2 behave differently from one on plain Linux when another
device tries to reach it?

**Back:** WSL 2 runs Linux in a virtual machine that "has a virtualized ethernet adapter with its own
unique IP address" — a second machine inside your laptop, on its own network, so the address WSL
reports is not the address your Wi-Fi knows.

---

**Front:** You are in a WSL shell. Which command shows the WSL virtual machine's address, and which
shows the Windows LAN address?

**Back:** `ip addr` shows WSL's own NAT'd address, usually in `172.16.0.0 - 172.31.255.255`.
`ipconfig.exe` shows the Windows addresses, including the `192.168.x.x` one your phone needs — a Linux
shell can run it because "WSL can run Windows tools directly from the WSL command line using
`[tool-name].exe`".

---

**Front:** `networkingMode=mirrored`

**Back:** The `.wslconfig` setting, under `[wsl2]`, that switches WSL 2 off NAT so you can "Connect to
WSL directly from your local area network (LAN)". Needs Windows 11 22H2 or higher. It is generally
available but not the default — the default is `NAT`.

---

**Front:** Where does `.wslconfig` live, and does it already exist?

**Back:** It "does not exist by default. It must be created and stored in your `%UserProfile%`
directory."

---

**Front:** You edited `.wslconfig`. What must you do before the change takes effect?

**Back:** Run `wsl --shutdown` and wait — "This typically takes about 8 seconds after closing ALL
instances of the distribution shell."

---

**Front:** Mirrored mode is on and `ip addr` now matches `ipconfig.exe`, but the phone still cannot
connect. What is the next documented step?

**Back:** Add a Hyper-V firewall rule, because that firewall is on by default. In an admin PowerShell:
`New-NetFirewallHyperVRule -Name "MyWebServer" -DisplayName "My Web Server" -Direction Inbound -VMCreatorId '{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}' -Protocol TCP -LocalPorts 8000`

---

**Front:** `hostname -I` versus `hostname -i`

**Back:** "`wsl hostname -i` is your local machine (127.0.1.1 is a placeholder diagnostic address),
whereas `wsl hostname -I` will return your local machine's IP address as seen by other machines." The
Windows 10 `netsh portproxy` fallback needs the capital `I`.

---

**Front:** A private address versus a public address

**Back:** A private address comes from an RFC 1918 block (`10/8`, `172.16/12`, `192.168/16`), is usable
by anyone "without any coordination with IANA or an Internet registry", and identifies a machine only
inside one network. A public address is unique on the whole internet, so a stranger can reach it.

---

**Front:** What does NAT do for a house full of `192.168.x.x` machines?

**Back:** On the way out, the router replaces the private source address with its own public one and
remembers who to hand the reply back to. It makes outbound connections work; it gives no way for an
outside machine to start a connection inward.

---

**Front:** What does a hosting provider actually sell you?

**Back:** Three things your laptop cannot give: a publicly routable IP address, a persistent name
pointing at it, and a machine that keeps running when your lid closes.

---
