# Sources

Every load-bearing number, command, error string, and claim in this course traces to a row below.
Quotes are verbatim. Where a fact could not be verified, it appears under **Ungrounded** and the
course either cuts it, teaches the method for finding it, or flags it in the topic.

Research date: **29 July 2026**. Angles: A1 primary source · A2 authoritative numbers ·
A3 current-state check (a=Python, b=macOS, c=Linux, d=WSL) · A4 misconception harvest ·
A5 prior-art gap.

---

## Primary

- **`http.server` — HTTP servers**, Python 3.14.6 docs — https://docs.python.org/3/library/http.server.html
  — the exact CLI contract for the course's server. Page footer: "Last updated on Jul 29, 2026".
- **Overview of HTTP** — MDN — https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview
- **HTTP messages** — MDN — https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Messages
- **What is a URL?** — MDN — https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL
- **Accessing network applications with WSL** — Microsoft Learn — https://learn.microsoft.com/en-us/windows/wsl/networking
- **Ubuntu manpages, noble 24.04 LTS §1** (`ls`, `mkdir`, `cp`, `mv`, `rm`) — https://manpages.ubuntu.com/manpages/noble/en/man1/ls.1.html
  — chosen over the GNU Coreutils manual because it is the exact text a learner sees when they run `man ls`.
- **RFC 9110 (HTTP Semantics, STD 97)** — https://www.rfc-editor.org/rfc/rfc9110.txt
- **RFC 1918 (Private Internets)** — https://www.rfc-editor.org/rfc/rfc1918.txt
- **RFC 6335 (Port Number Registry Procedures)** — https://www.rfc-editor.org/rfc/rfc6335.txt

---

## Ledger

### Filesystem, paths, permissions

| # | Claim | Value / verbatim quote | Source | Angle |
|---|-------|------------------------|--------|-------|
| 1 | macOS home directories live under `/Users` | "`/Users`—This directory contains one or more user home directories. The user home directory is where user-related files are stored." | https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/FileSystemProgrammingGuide/FileSystemOverview/FileSystemOverview.html | A3b |
| 2 | Linux home is `/home/<user>` | `echo $HOME` → `/home/colin`; passwd: `colin:x:1000:1000:Ubuntu:/home/colin:/usr/bin/bash` | command: `echo $HOME; getent passwd colin` | A3c |
| 3 | WSL: Windows drives mount at `/mnt/c` | "the Windows file system C:\ drive (`C:\Users\<user name>\Project`) will look like this when mounted in a WSL command line: `/mnt/c/Users/<user name>/Project$`." | https://learn.microsoft.com/en-us/windows/wsl/filesystems | A3d |
| 4 | WSL: put project files in the Linux filesystem, not `/mnt/c` | "We recommend against working across operating systems with your files, unless you have a specific reason for doing so. For the fastest performance speed, store your files in the WSL file system if you are working in a Linux command line (Ubuntu, OpenSUSE, etc)." | https://learn.microsoft.com/en-us/windows/wsl/filesystems | A3d |
| 5 | WSL: MS's own path contrast | "Use the Linux file system root directory: `/home/<user name>/Project` — Not the Windows file system root directory: `/mnt/c/Users/<user name>/Project$`" | https://learn.microsoft.com/en-us/windows/wsl/filesystems | A3d |
| 6 | APFS default is case-INsensitive | "APFS, like HFS+, is case-sensitive on iOS and is available in case-sensitive and case-insensitive variants on macOS, with case-insensitive being the default." | https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/APFS_Guide/FAQ/FAQ.html | A3b |
| 7 | APFS is case-PRESERVING in all variants | "APFS accepts only valid UTF-8 encoded filenames for creation, and preserves both case and normalization of the filename on disk in all variants." | same as 6 | A3b |
| 8 | Linux filesystems are case-SENSITIVE — proven | `index.html` inode `4924918`, `Index.html` inode `4924919`; `cat` returns `lowercase file` vs `UPPERCASE file` | command: `ls -li; stat -c '%n %i %s' index.html Index.html` | A3c |
| 9 | WSL Linux FS case-sensitive; `/mnt/c` is not | "When working in the WSL file system, you are running Linux, thus files and directories are treated as case-sensitive by default." + "NTFS-formatted drives mounted to a WSL distribution will be case-insensitive by default." | https://learn.microsoft.com/en-us/windows/wsl/case-sensitivity | A3d |
| 10 | Real `ls -la` teaching block | `drwxr-xr-x.   3 colin ubuntu  120 Jul 29 04:25 .` / `-rw-------.   1 colin ubuntu   14 Jul 29 04:25 .env` / `-rw-r--r--.   1 colin ubuntu   12 Jul 29 04:25 index.html` / `drwxr-xr-x.   2 colin ubuntu   40 Jul 29 04:25 projects` | command: `ls -la` | A3c |
| 11 | An 11th character may follow the permission string | Trailing `.` is an SELinux security-context marker (Fedora/RHEL hosts). Plain Ubuntu/Debian prints 10 characters, no dot. | command: `ls -la; ls -Z` | A3c |
| 12 | Default umask sets new-file modes | Ubuntu default `umask 0022` → files `644`, directories `755` | command: `umask` | A3c |
| 13 | `ls -a` reveals dotfiles | `-a` → "do not ignore entries starting with ." ; `-l` → "use a long listing format" | https://manpages.ubuntu.com/manpages/noble/en/man1/ls.1.html | A1 |
| 14 | `ls` with no argument lists the current directory | "List information about the FILEs (the current directory by default). Sort entries alphabetically if none of **-cftuvSUX** nor **--sort** is specified." | https://manpages.ubuntu.com/manpages/noble/en/man1/ls.1.html | A1 |

### Shell and commands

| # | Claim | Value / verbatim quote | Source | Angle |
|---|-------|------------------------|--------|-------|
| 15 | `cd` is a shell builtin, not a coreutils program | "cd — change the working directory" / "The cd utility shall change the working directory of the current shell execution environment" | https://pubs.opengroup.org/onlinepubs/9799919799/utilities/cd.html | A1 |
| 16 | Absolute paths are defined by a leading `/` | "If the directory operand begins with a <slash> character, set curpath to the operand and proceed to step 7." | https://pubs.opengroup.org/onlinepubs/9799919799/utilities/cd.html | A1 |
| 17 | Bare `cd` goes to `$HOME` — the origin of `~` | "If no directory operand is given and the HOME environment variable is set to a non-empty value, the cd utility shall behave as if the directory named in the HOME environment variable was specified as the directory operand." | https://pubs.opengroup.org/onlinepubs/9799919799/utilities/cd.html | A1 |
| 18 | `cd -` toggles and prints the destination | Alternates `/etc` ↔ `/var/log`, echoing the directory moved to; backed by `$OLDPWD` | command: `cd /etc; cd /var/log; cd -; cd -` | A3c |
| 19 | `mkdir -p` creates parents and is idempotent | "-p, --parents" → "no error if existing, make parent directories as needed". Without `-p`: `mkdir: cannot create directory '.../x/y/z': No such file or directory` and `mkdir: cannot create directory '.../a': File exists` | https://manpages.ubuntu.com/manpages/noble/en/man1/mkdir.1.html + command | A1, A3c |
| 20 | `mv` is both rename and move | "mv - move (rename) files" / "Rename SOURCE to DEST, or move SOURCE(s) to DIRECTORY." | https://manpages.ubuntu.com/manpages/noble/en/man1/mv.1.html | A1 |
| 21 | `cp` needs `-r` for directories | "-R, -r, --recursive" → "copy directories recursively" | https://manpages.ubuntu.com/manpages/noble/en/man1/cp.1.html | A1 |
| 22 | `rm` refuses directories by default | "rm removes each specified file. By default, it does not remove directories." | https://manpages.ubuntu.com/manpages/noble/en/man1/rm.1.html | A1 |
| 23 | `rm` flag semantics | "-f, --force" → "ignore nonexistent files and arguments, never prompt"; "-i" → "prompt before every removal"; "-r, -R, --recursive" → "remove directories and their contents recursively" | https://manpages.ubuntu.com/manpages/noble/en/man1/rm.1.html | A1 |
| 24 | `mv`/`cp` safety flags | "-i, --interactive" → "prompt before overwrite"; "-n, --no-clobber" → "do not overwrite an existing file" | https://manpages.ubuntu.com/manpages/noble/en/man1/mv.1.html | A1 |
| 25 | `grep -rn` output shape | `README.md:179:**Activity types** (9): readings, lectures, flashcards, podcasts, quizzes, games, music (jam),` | command: `grep -rn "flashcard" README.md` | A3c |
| 26 | Searching a single file omits the `path:` prefix | GNU grep prints `line:text` only when given one file; `-H` forces the filename | command: `grep -rn` on one file vs a directory | A3c |
| 27 | `wc` output columns | `wc /etc/hosts` → `  7  40 384 /etc/hosts` (lines, words, bytes); `wc -l /etc/hosts` → `7 /etc/hosts` | command: `wc /etc/hosts` | A3c |
| 28 | Linux default shell is bash; prompt ends `$` | `echo $SHELL` → `/usr/bin/bash`; stock PS1 `\u@\h:\w\$ ` renders `colin@seamus:~$`. The `\$` escape prints `#` when uid is 0. | command: `echo $SHELL`; `grep -n "PS1=" /etc/skel/.bashrc` | A3c |
| 29 | `/bin/sh` is NOT bash on Ubuntu/Debian | `lrwxrwxrwx 1 ... /bin/sh -> dash` | command: `ls -l /bin/sh /bin/bash` | A3c |
| 30 | macOS default shell is zsh; prompt ends `%` | "Starting with macOS Catalina, your Mac uses zsh as the default login shell and interactive shell." + zsh manual: "%# — A '#' if the shell is running with privileges, a '%' if not." | https://support.apple.com/en-au/HT208050 · https://zsh.sourceforge.io/Doc/Release/Prompt-Expansion.html | A3b |
| 31 | Terminal.app location | "In the Finder, open the /Applications/Utilities folder, then double-click Terminal." | https://support.apple.com/guide/terminal/open-or-quit-terminal-apd5265185d-f365-44cb-8b09-71a064a42125/mac | A3b |
| 32 | Ubuntu/Fedora default terminal is now **Ptyxis**, not GNOME Terminal | "Ptyxis is the new default terminal emulator introduced in Ubuntu 26.04, replacing the traditional GNOME Terminal." Default since Ubuntu 25.04; Fedora Workstation 41+ (GNOME 47). | https://ubuntu.fan/en/docs/desktop-use/basics/default-apps-changes · https://discussion.fedoraproject.org/t/gnome-terminal-is-ptyxis-now/131691 | A3c |
| 33 | Windows Terminal is MS's recommended host | "We recommend using WSL with Windows Terminal, especially if you plan to work with multiple command lines." | https://learn.microsoft.com/en-us/windows/wsl/setup/environment | A3d |
| 34 | `nano` ships by default on Ubuntu and Fedora | Ubuntu `Priority: standard`; `apt-cache rdepends nano` → `ubuntu-standard`, `ubuntu-wsl`. Fedora ships `nano-default-editor` in `@standard` and sets `$EDITOR`. | command: `apt-cache show nano`, `apt-cache rdepends nano` · https://fedoraproject.org/wiki/Changes/UseNanoByDefault | A3c |
| 35 | Current Ubuntu LTS | Ubuntu 26.04 LTS "Resolute Raccoon", released 2026-04-23 | https://canonical.com/blog/canonical-releases-ubuntu-26-04-lts-resolute-raccoon | A3c |

### Networking — addresses and ports

| # | Claim | Value / verbatim quote | Source | Angle |
|---|-------|------------------------|--------|-------|
| 36 | Ports are a 16-bit namespace → 0–65535 | "TCP, UDP, UDP-Lite, SCTP, and DCCP use 16-bit namespaces for their port number registries." | https://www.rfc-editor.org/rfc/rfc6335.txt | A2 |
| 37 | TCP header port fields are 16 bits | "Source Port:  16 bits" / "Destination Port:  16 bits" | https://www.rfc-editor.org/rfc/rfc9293.txt | A2 |
| 38 | Port 0 is Reserved → bindable range is 1–65535 | IANA CSV: `,0,tcp,Reserved,,,,2024-12-20,[RFC6335],,,` | https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.csv | A2 |
| 39 | System / Well-Known Ports = 0–1023 | "o  the System Ports, also known as the Well Known Ports, from 0-1023 (assigned by IANA)" | https://www.rfc-editor.org/rfc/rfc6335.txt | A2 |
| 40 | User / Registered Ports = 1024–49151 | "o  the User Ports, also known as the Registered Ports, from 1024-49151 (assigned by IANA)" | https://www.rfc-editor.org/rfc/rfc6335.txt | A2 |
| 41 | Dynamic / Private Ports = 49152–65535 | "o  the Dynamic Ports, also known as the Private or Ephemeral Ports, from 49152-65535 (never assigned)" | https://www.rfc-editor.org/rfc/rfc6335.txt | A2 |
| 42 | Port 80 = http | IANA CSV: `http,80,tcp,World Wide Web HTTP,[IESG],[IETF_Chair],,2021-10-01,[RFC9110],,,` | https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.csv | A2 |
| 43 | Port 443 = https | IANA CSV: `https,443,tcp,http protocol over TLS/SSL,[IESG],[IETF_Chair],,2021-10-01,[RFC9110],,,` | same as 42 | A2 |
| 44 | Port 22 = ssh | IANA CSV: `ssh,22,tcp,The Secure Shell (SSH) Protocol,,,,,[RFC4251],,,` | same as 42 | A2 |
| 45 | **Port 8000 is NOT registered as HTTP** — it is `irdmi` | IANA CSV: `irdmi,8000,tcp,iRDMI,[Gil_Shafriri],[Gil_Shafriri],,,,,,` — no RFC reference, no relation to HTTP. Dev-server use is pure convention. | same as 42 | A2 |
| 46 | A registered port implies nothing about the traffic | "ASSIGNMENT OF A PORT NUMBER DOES NOT IN ANY WAY IMPLY AN ENDORSEMENT OF AN APPLICATION OR PRODUCT, AND THE FACT THAT NETWORK TRAFFIC IS FLOWING TO OR FROM A REGISTERED PORT DOES NOT MEAN THAT IT IS \"GOOD\" TRAFFIC" | https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.txt | A2 |
| 47 | RFC 1918 private IPv4 blocks | "     10.0.0.0        -   10.255.255.255  (10/8 prefix)" / "     172.16.0.0      -   172.31.255.255  (172.16/12 prefix)" / "     192.168.0.0     -   192.168.255.255 (192.168/16 prefix)" | https://www.rfc-editor.org/rfc/rfc1918.txt | A2 |
| 48 | Private addressing needs no coordination with IANA | "An enterprise that decides to use IP addresses out of the address space defined in this document can do so without any coordination with IANA or an Internet registry." | https://www.rfc-editor.org/rfc/rfc1918.txt | A2 |
| 49 | Loopback is the whole 127/8, not just 127.0.0.1 | RFC 1122 §3.2.1.3 form (g): "(g)  { 127, <any> }" / "Internal host loopback address.  Addresses of this form MUST NOT appear outside a host." | https://www.rfc-editor.org/rfc/rfc1122.txt | A2 |
| 50 | Loopback block in CIDR | RFC 6890 Table 4: "Address Block        | 127.0.0.0/8" / "Name                 | Loopback" / "Forwardable          | False" / "Global               | False" | https://www.rfc-editor.org/rfc/rfc6890.txt | A2 |
| 51 | Real loopback interface output | `inet 127.0.0.1/8 scope host lo` | command: `ip -4 addr show` | A3c |
| 52 | IPv4 is 32 bits / four octets | "Addresses are fixed length of four octets (32 bits)." | https://www.rfc-editor.org/rfc/rfc791.txt | A2 |
| 53 | IPv6 is 128 bits | "IPv6 increases the IP address size from 32 bits to 128 bits" | https://www.rfc-editor.org/rfc/rfc8200.txt | A2 |
| 54 | An IP socket address is address + 16-bit port | "An IP socket address is defined as a combination of an IP interface address and a 16-bit port number." | https://man7.org/linux/man-pages/man7/ip.7.html | A2 |
| 55 | Ports below 1024 are privileged | "The port numbers below 1024 are called privileged ports (or sometimes: reserved ports).  Only a privileged process (on Linux: a process that has the CAP_NET_BIND_SERVICE capability in the user namespace governing its network namespace) may bind(2) to these sockets." | https://man7.org/linux/man-pages/man7/ip.7.html | A2 |
| 56 | The privileged-port threshold is a tunable, default 1024 | "ip_unprivileged_port_start - INTEGER ... Default: 1024". Verified locally: `net.ipv4.ip_unprivileged_port_start = 1024` | https://docs.kernel.org/networking/ip-sysctl.html + command: `sysctl net.ipv4.ip_unprivileged_port_start` | A2, A3c |
| 57 | Linux's real ephemeral range differs from IANA's | "The default values are 32768 and 60999 respectively." (`ip_local_port_range`) — **not** the IANA Dynamic range 49152–65535 | https://docs.kernel.org/networking/ip-sysctl.html | A2 |
| 58 | `ss -tlnp` real output | `LISTEN 0      5            0.0.0.0:8000      0.0.0.0:*    users:(("python3",pid=8,fd=4))` | command: `ss -tlnp` | A3c |
| 59 | `ss -p` shows your own processes without sudo | The Process column is populated for processes you own and blank for other users'; `sudo ss -tlnp` fills every row | command: `ss -tlnp` before/after starting an owned listener | A3c |
| 60 | ss flag meanings | `-t` TCP, `-u` UDP, `-l` listening, `-n` don't resolve service names, `-p` show process | command: `ss --help` | A3c |
| 61 | `netstat` is officially obsolete on Linux | netstat(8) NOTES: "This program is mostly obsolete.  Replacement for netstat is  ss.   Replacement for netstat -r is ip route." | command: `man netstat` | A3c |
| 62 | `ifconfig` is no longer installed by default | Canonical: "We've already stopped installing ifconfig on desktops (it still gets installed on servers for now)" | https://ubuntu.com/blog/if-youre-still-using-ifconfig-youre-living-in-the-past | A3c |
| 63 | macOS has no `ip` or `ss` | No `ip(8)` or `ss` man page exists in the current macOS/Xcode man-page set; both are Linux iproute2 tools. Negative evidence. | https://keith.github.io/xcode-man-pages/ | A3b |
| 64 | macOS LAN IPv4 command | ipconfig(8) `getifaddr`: "Prints to standard output the IP address for the first network service associated with the given interface. The output will be empty if no service is currently configured or active on the interface." | https://keith.github.io/xcode-man-pages/ipconfig.8.html | A3b |
| 65 | macOS Wi-Fi is not reliably `en0` | Apple Silicon Macs have been observed reporting Wi-Fi as `en2`. Discover with networksetup(8) `-listallhardwareports`: "Displays list of hardware ports with corresponding device name and ethernet address." | https://developer.apple.com/forums/thread/820120 · https://keith.github.io/xcode-man-pages/networksetup.8.html | A3b |
| 66 | macOS listening-port command | lsof(8): `-P` "inhibits the conversion of port numbers to port names for network files"; `-n` "inhibits the conversion of network numbers to host names for network files" | https://keith.github.io/xcode-man-pages/lsof.8.html | A3b |
| 67 | macOS `netstat -a` needed to see listeners | "The socket is listening for incoming connections. Unconnected listening sockets like these are only displayed when using the -a option." | https://keith.github.io/xcode-man-pages/netstat.1.html | A3b |

### Names and DNS

| # | Claim | Value / verbatim quote | Source | Angle |
|---|-------|------------------------|--------|-------|
| 68 | Real `/etc/hosts` localhost line | `127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4` and `::1         localhost localhost.localdomain localhost6 localhost6.localdomain6` | command: `cat /etc/hosts` | A3c |
| 69 | `/etc/hosts` is consulted before DNS | `hosts:          files mdns4_minimal [NOTFOUND=return] dns myhostname` — `files` precedes `dns` | command: `grep ^hosts /etc/nsswitch.conf` | A3c |
| 70 | macOS has `/etc/hosts` at the same path | hosts(5): "hosts — host name data base" | https://keith.github.io/xcode-man-pages/hosts.5.html | A3b |
| 71 | **`dig` was NOT removed from macOS** | dig(1) is present in the current (Xcode 27.0 beta 4) man-page set: "dig - DNS lookup utility". `host(1)` and `nslookup(1)` also ship. No DNS-tool removal appears in the macOS 15 or macOS 26 release notes. | https://keith.github.io/xcode-man-pages/dig.1.html | A3b |
| 72 | macOS `dig` bypasses the system resolver | "The dig command does not use the host name and address resolution or the DNS query routing mechanisms used by other processes running on macOS." | https://keith.github.io/xcode-man-pages/dig.1.html | A3b |
| 73 | `dig` is NOT preinstalled on Debian/Ubuntu/WSL | `dpkg -S /usr/bin/dig` → `bind9-dnsutils`. `dnsutils` is a "Transitional package for bind9-dnsutils". Absent from the Ubuntu 24.04 WSL manifest. Install: `sudo apt install bind9-dnsutils` | command: `dpkg -S`, `apt-cache show dnsutils` · https://cloud-images.ubuntu.com/wsl/noble/current/ubuntu-noble-wsl-amd64-wsl.manifest | A3c, A3d |

### HTTP

| # | Claim | Value / verbatim quote | Source | Angle |
|---|-------|------------------------|--------|-------|
| 74 | What HTTP is | "HTTP is a protocol for fetching resources such as HTML documents. It is the foundation of any data exchange on the Web and it is a client-server protocol, which means requests are initiated by the recipient, usually the Web browser." | https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview | A1 |
| 75 | Requests and responses are discrete messages | "Clients and servers communicate by exchanging individual messages (as opposed to a stream of data). The messages sent by the client are called requests and the messages sent by the server as an answer are called responses." | same as 74 | A1 |
| 76 | HTTP is human-readable | "HTTP is generally designed to be human-readable... HTTP messages can be read and understood by humans, providing easier testing for developers, and reduced complexity for newcomers." | same as 74 | A1 |
| 77 | HTTP is stateless | "HTTP is stateless: there is no link between two requests being successively carried out on the same connection." | same as 74 | A1 |
| 78 | Minimal real request | `GET / HTTP/1.1` / `Host: developer.mozilla.org` / `Accept-Language: fr` | same as 74 | A1 |
| 79 | Every HTTP message has the same four parts | "1. A _start-line_ ... 2. An optional set of _HTTP headers_ ... 3. An empty line indicating the metadata of the message is complete. 4. An optional _body_ containing data associated with the message." | https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Messages | A1 |
| 80 | Request-line grammar | `<method> <request-target> <protocol>` | same as 79 | A1 |
| 81 | Status-line grammar | `<protocol> <status-code> <reason-phrase>` | same as 79 | A1 |
| 82 | The reason phrase is decorative | "The optional text after the status code is a brief, purely informational, text description of the status to help a human understand the outcome of a request." | same as 79 | A1 |
| 83 | Head vs body | "The start-line and headers of the HTTP message are collectively known as the _head_ of the requests, and the part afterwards that contains its content is known as the _body_." | same as 79 | A1 |
| 84 | Status codes group into five classes | Informational (`100`–`199`), Successful (`200`–`299`), Redirection (`300`–`399`), Client error (`400`–`499`), Server error (`500`–`599`) | https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status | A1 |
| 85 | 200 OK | "The 200 (OK) status code indicates that the request has succeeded.  The content sent in a 200 response depends on the request method." (RFC 9110 §15.3.1) | https://www.rfc-editor.org/rfc/rfc9110.txt | A2 |
| 86 | 301 Moved Permanently | "The 301 (Moved Permanently) status code indicates that the target resource has been assigned a new permanent URI and any future references to this resource ought to use one of the enclosed URIs." (§15.4.2) | same as 85 | A2 |
| 87 | 304 Not Modified | "The 304 (Not Modified) status code indicates that a conditional GET or HEAD request has been received and would have resulted in a 200 (OK) response if it were not for the fact that the condition evaluated to false." (§15.4.5) | same as 85 | A2 |
| 88 | 404 Not Found | "The 404 (Not Found) status code indicates that the origin server did not find a current representation for the target resource or is not willing to disclose that one exists." (§15.5.5) | same as 85 | A2 |
| 89 | 500 Internal Server Error | "The 500 (Internal Server Error) status code indicates that the server encountered an unexpected condition that prevented it from fulfilling the request." (§15.6.1) | same as 85 | A2 |
| 90 | 404 in beginner terms | "The server cannot find the requested resource. In the browser, this means the URL is not recognized. ... This response code is probably the most well known due to its frequent occurrence on the web." | https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status | A1 |
| 91 | HTTP/1.1 requires a `Host` header | "A client MUST send a Host header field (Section 7.2 of [HTTP]) in all HTTP/1.1 request messages." | https://www.rfc-editor.org/rfc/rfc9112.txt | A2 |
| 92 | Missing/duplicate Host → 400 | "A server MUST respond with a 400 (Bad Request) status code to any HTTP/1.1 request message that lacks a Host header field and to any request message that contains more than one Host header field line" | same as 91 | A2 |
| 93 | What `Host` is for | "The \"Host\" header field in a request provides the host and port information from the target URI, enabling the origin server to distinguish among resources while servicing requests for multiple host names." | https://www.rfc-editor.org/rfc/rfc9110.txt | A2 |
| 94 | `Content-Type` | "The \"Content-Type\" header field indicates the media type of the associated representation" | same as 93 | A2 |
| 95 | `Content-Length` | "The \"Content-Length\" header field indicates the associated representation's data length as a decimal non-negative integer number of octets." | same as 93 | A2 |
| 96 | RFC 9110 obsoletes the 723x series | "Obsoletes: 2818, 7230, 7231, 7232, 7233, 7235, 7538, 7615, 7694" / "STD: 97" / "June 2022" | same as 93 | A2 |
| 97 | RFC 2616 → 723x → 911x | Datatracker, RFC 2616: "Obsoleted by RFC 7230 , RFC 7231 , RFC 7232 , RFC 7233 , RFC 7234 , RFC 7235" | https://datatracker.ietf.org/doc/rfc2616/ | A2 |

### URLs

| # | Claim | Value / verbatim quote | Source | Angle |
|---|-------|------------------------|--------|-------|
| 98 | What a URL is | "A **URL** (Uniform Resource Locator) is the address of a unique resource on the internet." | https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL | A1 |
| 99 | Scheme | "The first part of the URL is the _scheme_, which indicates the protocol that the browser must use to request the resource" | same as 98 | A1 |
| 100 | Authority = domain + port | "Next follows the _authority_, which is separated from the scheme by the character pattern `://`. If present the authority includes both the _domain_ (e.g., `www.example.com`) and the _port_ (`80`), separated by a colon" | same as 98 | A1 |
| 101 | **An IP address may replace the domain** | "The domain indicates which Web server is being requested. Usually this is a domain name, but an IP address may also be used (but this is rare as it is much less convenient)." | same as 98 | A1 |
| 102 | **Port as a "gate"; why `:8000` must be typed** | "The port indicates the technical \"gate\" used to access the resources on the web server. It is usually omitted if the web server uses the standard ports of the HTTP protocol (80 for HTTP and 443 for HTTPS) to grant access to its resources. Otherwise it is mandatory." | same as 98 | A1 |
| 103 | The URL path was once a literal file path | "`/path/to/myfile.html` is the path to the resource on the Web server. In the early days of the Web, a path like this represented a physical file location on the Web server. Nowadays, it is mostly an abstraction handled by Web servers without any physical reality." | same as 98 | A1 |
| 104 | The fragment never reaches the server | "It is worth noting that the part after the **#**, also known as the **fragment identifier**, is never sent to the server with the request." Also MDN URI reference: "The fragment is not sent to the server when the URI is requested; it is processed by the client (e.g., the browser) after the resource is retrieved." | same as 98 · https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Fragment | A1, A4 |
| 105 | The address bar needs an absolute URL | "In your browser's address bar, a URL doesn't have any context, so you must provide a full (or _absolute_) URL" | same as 98 | A1 |

### The server — `python3 -m http.server`

| # | Claim | Value / verbatim quote | Source | Angle |
|---|-------|------------------------|--------|-------|
| 106 | Invocation and default port | "The server listens to port 8000 by default." `--help`: `port  bind to this port (default: 8000)` | https://docs.python.org/3/library/http.server.html + command: `python3 -m http.server` | A1, A3a |
| 107 | Default bind is all interfaces | "Specifies a specific address to which it should bind. Both IPv4 and IPv6 addresses are supported. **By default, the server binds itself to all interfaces.**" Verified: `ss -ltn` → `LISTEN 0 5 0.0.0.0:8000` | same as 106 | A1, A3a |
| 108 | Startup banner (stdout) | `Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...` | command: `python3 -u -m http.server 8000` | A3a |
| 109 | The server speaks HTTP/1.0 by default | CPython source line 694: `protocol_version = "HTTP/1.0"` (BaseHTTPRequestHandler; not overridden by SimpleHTTPRequestHandler). Docs: "For backwards compatibility, the setting defaults to `'HTTP/1.0'`." Live response line: `HTTP/1.0 200 OK` | https://github.com/python/cpython/blob/3.14/Lib/http/server.py + command: `curl -I` | A3a |
| 110 | It serves the current working directory | "Specifies a directory to which it should serve the files. **By default, the server uses the current directory.**" (`-d`/`--directory` added in 3.7) | https://docs.python.org/3/library/http.server.html | A1, A3a |
| 111 | URL path maps to a local file path | "The request is mapped to a local file by interpreting the request as a path relative to the current working directory." | same as 110 | A1 |
| 112 | Why `index.html` is special | "If the request was mapped to a directory, the directory is checked for an index page as specified by `index_pages`. If found, the file's contents are returned; otherwise a directory listing is generated by calling the `list_directory()` method." `index_pages` "Defaults to `(\"index.html\", \"index.htm\")`." | same as 110 | A1, A3a |
| 113 | **Real full `curl -I` response** | `HTTP/1.0 200 OK` / `Server: SimpleHTTP/0.6 Python/3.14.6` / `Date: Wed, 29 Jul 2026 04:26:16 GMT` / `Content-type: text/html` / `Content-Length: 31` / `Last-Modified: Wed, 29 Jul 2026 04:23:59 GMT` | command: `curl -sS -I http://localhost:8000/index.html` | A3a |
| 114 | **A served `.html` file gets `Content-type: text/html` with NO charset** | Real file → `Content-type: text/html` (lowercase "t", no charset). Only the *generated* directory listing gets `Content-type: text/html; charset=utf-8`, and the 404 page `Content-Type: text/html;charset=utf-8`. | command: `curl -sS -I` against a file, a directory, and a missing path | A3a |
| 115 | **Real access-log line** | `127.0.0.1 - - [29/Jul/2026 04:26:16] "GET /nope HTTP/1.1" 404 -` | command: `python3 -u -m http.server 8000` | A3a |
| 116 | Access log goes to stderr; the banner goes to stdout | Source line 656: `sys.stderr.write("%s - - [%s] %s\n" % ...)`. Timestamp is local time with no timezone suffix; the size field is always `-`. | source `http/server.py:656` + command: redirect stdout and stderr separately | A3a |
| 117 | The request line in the log echoes the client's version | Log shows `"GET /nope HTTP/1.1"` (the client's request) while the *response* is HTTP/1.0 | command: `curl` against the server | A3a |
| 118 | `Server:` header leaks the Python version | `server_version = "SimpleHTTP/" + __version__` with `__version__ = "0.6"`, plus `sys_version = "Python/" + sys.version.split()[0]` | source `http/server.py:83,304,719` | A3a |
| 119 | **Port 80 as non-root fails** | `PermissionError: [Errno 13] Permission denied`, raised from `socketserver.py` `self.socket.bind(self.server_address)`; exit code 1. Raw errno 13 = EACCES. | command: `python3 -m http.server 80` (uid 1000) | A3a, A3c |
| 120 | **Port already in use** | `OSError: [Errno 98] Address already in use` on Linux; **Errno 48** on macOS. Exit code 1. | command: two servers on port 8000 | A3a |
| 121 | Ctrl-C output | `Keyboard interrupt received, exiting.` | source `http/server.py:1360-1362` + command: `kill -INT` | A3a |
| 122 | Production warning | "http.server is not recommended for production. It only implements basic security checks." | https://docs.python.org/3/library/http.server.html | A1, A3a |
| 123 | The concrete reason why | "SimpleHTTPRequestHandler will follow symbolic links when handling requests which makes it possible for files outside of the specified directory to be served." | same as 122 | A1, A3a |
| 124 | The module is not deprecated (one sub-feature is) | Only: "Deprecated since version 3.13, will be removed in version 3.15: `CGIHTTPRequestHandler` is being removed in 3.15" and the `--cgi` flag. The module itself is current. | same as 122 | A3a |
| 125 | Python 2's `SimpleHTTPServer` is dead | `ModuleNotFoundError: No module named 'SimpleHTTPServer'`; `python2: command not found`; bare `python` absent | command: `python3 -c "import SimpleHTTPServer"` | A3a |
| 126 | Current stable Python | 3.14.6, released 10 June 2026 | https://www.python.org/downloads/source/ | A3a |
| 127 | **macOS ships no Python runtime** | macOS 12.3 release notes: "Python 2.7 was removed from macOS in this update. Developers should use Python 3 or an alternative language instead. (39795874)" Catalina notes: "Future versions of macOS won't include scripting language runtimes by default, and might require you to install additional packages. (49764202)" | https://developer.apple.com/documentation/macos-release-notes/macos-12_3-release-notes · https://developer.apple.com/documentation/macos-release-notes/macos-catalina-10_15-release-notes | A3b |
| 128 | What a Mac beginner sees typing `python3` | GUI dialog: "The \"python3\" command requires the command line developer tools. Would you like to install the tools now?" Python docs: "Recent versions of macOS include a python3 command in `/usr/bin/python3` that links to a usually older and incomplete version of Python provided by and for use by ... Xcode or the Command Line Tools for Xcode." | https://developer.apple.com/forums/thread/698531 · https://docs.python.org/3/using/mac.html | A3a, A3b |
| 129 | The macOS fix | xcode-select(1) `--install`: "Opens a user interface dialog to request automatic installation of the command line developer tools." | https://keith.github.io/xcode-man-pages/xcode-select.1.html | A3b |
| 130 | Ubuntu/WSL ships python3, curl, nano, ip, ss | WSL manifest: `python3 3.12.3-0ubuntu2`, `curl 8.5.0-2ubuntu10.6`, `nano 7.2-2ubuntu0.1`, `iproute2 6.1.0-1ubuntu6` (provides `ip` and `ss`) | https://cloud-images.ubuntu.com/wsl/noble/current/ubuntu-noble-wsl-amd64-wsl.manifest | A3d |

### Reaching it from another device

| # | Claim | Value / verbatim quote | Source | Angle |
|---|-------|------------------------|--------|-------|
| 131 | curl status-code idiom | `curl -s -o /dev/null -w '%{http_code}\n' https://example.com` → `200` | command: as shown | A3c |
| 132 | **curl 8.x wording for a closed port** | `curl: (7) Failed to connect to 127.0.0.1:9999 after 0 ms: Could not connect to server` (exit 7). "Connection refused" appears **only** under `-v`: `connect to 127.0.0.1 port 9999 from 127.0.0.1 port 48604 failed: Connection refused` | command: `curl http://127.0.0.1:9999`, `curl -v ...` | A3c |
| 133 | The underlying errno for refused | `errno=111 [Errno 111] Connection refused` (ECONNREFUSED) | command: `python3 -c "socket.connect(('127.0.0.1',9999))"` | A3c |
| 134 | Refused vs unreachable is a timing difference | Refused = instant, exit 7. Unreachable (`192.0.2.1`, RFC 5737 TEST-NET) = `curl: (28) Operation timed out after 4002 milliseconds with 0 bytes received`, exit 28. | command: `curl --max-time 4 http://192.0.2.1/` | A3c |
| 135 | A failed `ping` does not mean the network is down | In a restricted environment: `ping: socktype: SOCK_RAW` / `ping: socket: Operation not permitted` / `ping: => missing cap_net_raw+p capability or setuid?` — failing even for `127.0.0.1`, while `curl` to the internet succeeded on the same machine. | command: `ping -c 3 127.0.0.1`; `getcap /usr/bin/ping`; `capsh --print` | A3c |
| 136 | **WSL2: LAN access does not work by default** | "When using a WSL 1 distribution, if your computer was set up to be accessed by your LAN, then applications run in WSL could be accessed on your LAN as well. **This isn't the default case in WSL 2. WSL 2 has a virtualized ethernet adapter with its own unique IP address.** Currently, to enable this workflow you will need to go through the same steps as you would for a regular virtual machine. (We are looking into ways to improve this experience.)" | https://learn.microsoft.com/en-us/windows/wsl/networking | A1, A3d |
| 137 | NAT is still the WSL default in 2026 | "By default WSL uses a NAT based architecture, and we recommend trying the new Mirrored networking mode". `networkingMode` default = `NAT`. | https://learn.microsoft.com/en-us/windows/wsl/networking · https://learn.microsoft.com/en-us/windows/wsl/wsl-config | A3d |
| 138 | Windows→WSL localhost forwarding works | "you can access it from a Windows app (like your Edge or Chrome internet browser) using `localhost` (just like you normally would)." | https://learn.microsoft.com/en-us/windows/wsl/networking | A1, A3d |
| 139 | Apps must accept LAN connections | "When using remote IP addresses to connect to your applications, they will be treated as connections from the Local Area Network (LAN). This means that you will need to make sure your application can accept LAN connections. For example, you may need to bind your application to `0.0.0.0` instead of `127.0.0.1`." (`python3 -m http.server` already does — see row 107) | same as 138 | A1, A3d |
| 140 | **Mirrored mode enables LAN access** | "On machines running Windows 11 22H2 and higher you can set `networkingMode=mirrored` under `[wsl2]` in the `.wslconfig` file to enable mirrored mode networking." Benefits list includes: "Connect to WSL directly from your local area network (LAN)" | same as 138 | A1, A3d |
| 141 | Mirrored mode is GA, not experimental, not the default | `networkingMode` now sits in the main `[wsl2]` settings table with default `NAT`; it is no longer in the `[experimental]` table. | https://learn.microsoft.com/en-us/windows/wsl/wsl-config | A3d |
| 142 | **The Hyper-V firewall rule mirrored mode requires** | "Run the following command in PowerShell window with admin privileges to Configure Hyper-V firewall settings to allow inbound connections: `New-NetFirewallHyperVRule -Name \"MyWebServer\" -DisplayName \"My Web Server\" -Direction Inbound -VMCreatorId '{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}' -Protocol TCP -LocalPorts 80`" | https://learn.microsoft.com/en-us/windows/wsl/networking | A3d |
| 143 | The WSL VMCreatorId | "The WSL VMCreatorId is `{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}`." | https://learn.microsoft.com/en-us/windows/security/operating-system-security/network-security/windows-firewall/hyper-v-firewall | A3d |
| 144 | Hyper-V firewall is on by default for WSL | "On machines running Windows 11 22H2 and higher, with WSL 2.0.9 and higher, the Hyper-V firewall feature will be turned on by default." | https://learn.microsoft.com/en-us/windows/wsl/networking | A3d |
| 145 | The NAT-mode fallback command | `netsh interface portproxy add v4tov4 listenport=<yourPortToForward> listenaddress=0.0.0.0 connectport=<yourPortToConnectToInWSL> connectaddress=(wsl hostname -I)` | same as 144 | A1, A3d |
| 146 | `hostname -I` vs `-i` | "Using a lowercase \"i\" with the hostname command will generate a different result than using an uppercase \"I\". `wsl hostname -i` is your local machine (127.0.1.1 is a placeholder diagnostic address), whereas `wsl hostname -I` will return your local machine's IP address as seen by other machines" | same as 144 | A1, A3d |
| 147 | `ipconfig.exe` runs from inside WSL | "WSL can run Windows tools directly from the WSL command line using `[tool-name].exe`." Example: `ipconfig.exe \| grep IPv4 \| cut -d: -f2` | https://learn.microsoft.com/en-us/windows/wsl/filesystems | A3d |
| 148 | `.wslconfig` location and the restart rule | "The .wslconfig file does not exist by default. It must be created and stored in your `%UserProfile%` directory". "You must wait until the subsystem running your Linux distribution completely stops running and restarts... This typically takes about 8 seconds after closing ALL instances of the distribution shell." | https://learn.microsoft.com/en-us/windows/wsl/wsl-config | A3d |
| 149 | Windows Firewall blocks inbound by default | "The default behavior of Windows Firewall is to: - block all incoming traffic, unless solicited or matching a *rule* - allow all outgoing traffic, unless matching a *rule*" | https://learn.microsoft.com/en-us/windows/security/operating-system-security/network-security/windows-firewall/ | A3d |
| 150 | Public vs private profile matters | "The *public network* profile is designed with higher security in mind for public networks... **It's the default profile for unidentified networks.**" Check with `Get-NetConnectionProfile`. | same as 149 | A3d |
| 151 | macOS firewall alert wording | "When your Mac detects an attempt to connect to an app you haven't added to the list and given access to, an alert message appears asking if you want to allow or deny the connection over the network or internet." | https://support.apple.com/guide/mac-help/block-connections-to-your-mac-with-a-firewall-mh34041/mac | A3b |
| 152 | WSL install command and prerequisites | "You must be running Windows 10 version 2004 and higher (Build 19041 and higher) or Windows 11 to use the commands below." / `wsl --install` / "By default, the installed Linux distribution will be Ubuntu." | https://learn.microsoft.com/en-us/windows/wsl/install | A1, A3d |
| 153 | WSL 2 is the default version | "New Linux installations, installed using the `wsl --install` command, will be set to WSL 2 by default." | same as 152 | A1, A3d |

### Misconceptions (distractor stock)

| # | Claim | Value / verbatim quote | Source | Angle |
|---|-------|------------------------|--------|-------|
| 154 | **Learners expect `localhost` to work from another device** | "So I want to directly connect to my apache2 server from my android device using **localhost and not the servers IP** (ex 192.168.1.70)." Companion question "Accessing localhost (xampp) from another computer over LAN network - how to?" has **903,096 views**. | https://stackoverflow.com/questions/58584142/ · https://stackoverflow.com/questions/5524116/ | A4 |
| 155 | `0.0.0.0` vs `127.0.0.1` vs `localhost` are conflated | "What is the difference between 0.0.0.0, 127.0.0.1 and localhost?" — **379,882 views** | https://stackoverflow.com/questions/20778771/ | A4 |
| 156 | The firewall is the invisible second cause | "Typing the 192.168.xxx.xxx:8080 in the browser of this device (ipad). But this doesn't work. \"This site cannot be reached\". ... First I switched off the firewall then I was able to request the site from another device. So it is a firewall setting." (71,123 views) | https://superuser.com/questions/1228430/ | A4 |
| 157 | WSL learners hit exactly this wall | "Connecting to WSL2 server via local network" — "I can't connect to my server from another computer in the same network. ... None of the above have worked" — **364,943 views** | https://stackoverflow.com/questions/61002681/ | A4 |
| 158 | `Address already in use` reads as a broken machine | "Node / Express: EADDRINUSE, Address already in use - how can I stop the process using the port?" — **1,833,924 views** | https://stackoverflow.com/questions/4075287/ | A4 |
| 159 | `command not found` is read as "not installed" | "bash: pip: command not found" — **2,426,531 views**; "zsh: command not found: brew" — 1,105,124 views | https://stackoverflow.com/questions/9780717/ | A4 |
| 160 | Being trapped in vim is the most-viewed question on Stack Overflow | "How do I exit Vim?" — "I am stuck and cannot escape. It says: ... But when I type that it simply appears in the object body." **3,316,707 views** | https://stackoverflow.com/questions/11828270/ | A4 |
| 161 | The `$` prompt gets copy-pasted | "The `$` character in tutorials indicates a command prompt. It is not meant to be typed in." A dedicated tool exists: `undollar` — "Often when copy-pasting terminal commands from the internet you'll inadvertently end up also having copied the dollar sign at the beginning (especially if you triple-click to select)" | https://mac.install.guide/terminal/command-not-found-$ · https://github.com/xtyrrell/undollar | A4 |
| 162 | Hidden dotfiles read as "the folder is empty" | "Why doesn't this show the hidden files/folders?" (222,790 views); "How to show only hidden files in Terminal?" (1,009,429 views) | https://askubuntu.com/questions/356902/ | A4 |
| 163 | The cwd mismatch reads as "the file is corrupted" | "command prompt says \"No such file or directory\" but the file exists" — "I copy n pasted a pathway for an existing file and just swapped the file with the one that im being told does not exist." (21,771 views) | https://stackoverflow.com/questions/55672620/ | A4 |
| 164 | Absolute vs relative slash, with permanent consequences | "Undo rm -r, restore data" — "I used `rm -r /home/` instead of `rm -r home/` as root. Is there anything I can do to restore my /home/ dir? ... Unfortunately I have no backups." (56,565 views) | https://unix.stackexchange.com/questions/49080/ | A4 |
| 165 | `rm` has no trash — a professional-scale example | GitLab's public postmortem: an engineer ran `rm -rf` on the wrong database host and destroyed live production data; "out of 5 backup/replication techniques deployed none are working reliably or set up in the first place" | https://about.gitlab.com/blog/gitlab-dot-com-database-incident/ | A4 |
| 166 | Renaming the extension is believed to convert the file | "Saving one file format with a different file extension. JPG - PNG; MOV - MP4" — "From experience I know that if I save .jpg file with an .png extension (or vice versa) the most programs will open it as normally." | https://superuser.com/questions/1576056/ | A4 |
| 167 | Spaces in filenames break unquoted commands | "How to use cp command in bash script to copy files with spaces and $ characters in it?" (55,267 views) | https://unix.stackexchange.com/questions/219750/ | A4 |
| 168 | **A `file://` URL is believed to be shareable** | Teaching resource documenting this exact student failure: "If the address contains a drive letter (usually C://), you've accidentally linked to a file on your computer, not on the server" — "**Such a link will work only on your computer.**" | https://mason.gmu.edu/~dtaciuch/webdev/troublelinks.html | A4 |
| 169 | Learners ask why a local server is needed at all | "Is there an advantage to running code on a localhost as opposed to simply double clicking on the HTML file?" — "It seems I can simply click on an HTML file (say, index.html) and the app will display in my browser, so why go through all of the trouble of setting up a localhost?" | https://teamtreehouse.com/community/is-there-an-advantage-to-running-code-on-a-localhost-as-opposed-to-simply-double-clicking-on-the-html-file | A4 |
| 170 | `file://` breaks JS loading sibling files, and it reads as a path bug | "\"Origin null is not allowed by Access-Control-Allow-Origin\" in Chrome. Why?" — "I am just working with local files." (79,546 views). "Is it a path issue for product-color.html? All my three files are in the same root folder" (252,808 views). MDN: "Browsers commonly treat requests to load resources using the `file://` scheme as cross-origin requests." | https://stackoverflow.com/questions/5224017/ · https://stackoverflow.com/questions/27742070/ · https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Tools_and_setup/set_up_a_local_testing_server | A4 |
| 171 | 404 vs 500 — whose fault it is | "A **404** means the client made a mistake (like requesting a page that doesn't exist)." — "**The server is working fine** — it just doesn't have what you're looking for." vs "A **500** means the server broke" | https://hyperping.com/blog/404-vs-500-error-client-vs-server-errors-explained | A4 |
| 172 | http and https are believed to share a port | Standing need to configure both: "Serve http (port 80) and https (port 443) on same VirtualHost" (176,498 views) | https://serverfault.com/questions/303744/ | A4 |

### The gap this course fills

| # | Claim | Value / verbatim quote | Source | Angle |
|---|-------|------------------------|--------|-------|
| 173 | Librarian-documented literacy gaps in current college students | "Not understanding how to navigate Microsoft OneDrive vs computer file directories (or: why doesn't my paper show up on the computer?)" · "Saving everything to desktop/not using file directories" · "Unable to use browser (only uses phone applications)" · "The technical understanding of computers, programs, and how they work just isn't there in many young adults" | https://acrlog.org/2024/03/21/turn-it-off-and-on-again-digital-literacy-in-college-students/ | A5 |
| 174 | The hierarchy metaphor has no referent for this generation | Sarah Barrett (information architect) argues Gen Z never used physical filing cabinets, so the metaphor underpinning hierarchical directories has no referent; educators must teach the mental model explicitly rather than assume it. | https://sarahrbarrett.com/gen-z-can-t-use-file-structures | A5 |
| 175 | Search displaced hierarchy as the organizing model | L. M. Sacasas, "A World Ordered Only By Search" — information is no longer ordered spatially, so "where is this file" is an unfamiliar question rather than a forgotten skill. | https://theconvivialsociety.substack.com/p/a-world-ordered-only-by-search | A5 |
| 176 | Students don't know where files are saved *(see Ungrounded — mirror-corroborated only)* | "Not only did they not know where their files were saved — they didn't understand the question." · "the concept of file folders and directories, essential to previous generations' understanding of computers, is gibberish to many modern students." · "In an age where every conceivable user interface includes a search function, young people have never needed folders or directories." — Monica Chin, *File Not Found*, The Verge, 22 Sept 2021 | https://www.theverge.com/22684730/students-file-folder-directory-structure-education-gen-z | A5 |
| 177 | MIT's Missing Semester targets CS undergrads, not beginners | Assumes "a traditional Computer Science education"; the 2026 lecture list contains no networking, HTTP, or web-server lecture. | https://missing.csail.mit.edu/ | A5 |
| 178 | CS50 deliberately removes the learner's own machine | cs50.dev lets students "start programming with just a browser, without needing to install or configure anything locally on their own computer" | https://cs50.readthedocs.io/cs50.dev/ | A5 |
| 179 | **The closest prior art is gated behind the knowledge it should build** | MDN, *Set up a local testing server*: "You need to first know how the Internet works, and what a Web server is." It also contains no instructions for reaching the server from another device. | https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Tools_and_setup/set_up_a_local_testing_server | A5 |
| 180 | Codecademy teaches the CLI as vocabulary inside a browser sandbox | 4 lessons (Navigating / Viewing & Changing the File System, Redirection, Environment); no networking, ports, HTTP, or servers; exercises run in an in-browser terminal. | https://www.codecademy.com/learn/learn-the-command-line | A5 |
| 181 | Google IT Cert sequences networking before filesystem and never joins them | Course 2 covers IP, subnetting, ports/sockets, DNS bottom-up from the physical layer; the filesystem appears only in Course 3. | https://www.coursera.org/learn/computer-networking | A5 |
| 182 | The Odin Project teaches web mechanics passively | "How Does the Web Work?" is reading plus embedded videos with no hands-on component. | https://www.theodinproject.com/lessons/foundations-how-does-the-web-work | A5 |

---

## Ungrounded

Claims that could not be verified, and what was done about them.

- **The Verge, *File Not Found* (row 176) — primary source unreachable.** `theverge.com` is blocked from
  this research environment; two independent attempts failed. The three quotes used were corroborated
  across multiple independent mirrors (The Convivial Society, sarahrbarrett.com, futurism.com,
  danisch.de). **Resolution: flagged.** Row 176 is used only in the course `about` section and only for
  quotes that appear identically across every mirror. The primary-fetched ACRLog and Barrett sources
  (rows 173–174) carry the same point and do the load-bearing work.
- **The "an item lives in a particular folder" quote — disputed attribution.** Secondary sources split
  between Catherine Garland and Nicolás Guarín-Zapata. **Resolution: cut.** Not used anywhere.
- **WSL phone-reachability, end to end.** Every individual step (rows 140–150) is documented by
  Microsoft, but the *combination* — mirrored mode + `New-NetFirewallHyperVRule` on port 8000 + a phone
  on Wi-Fi — is not shown as a worked example anywhere in MS docs, and microsoft/WSL issue #10769 is
  still open on precisely this friction. No Windows machine was available to test it.
  **Resolution: flagged in Topic 21**, which tells WSL learners plainly that this path is documented but
  not verified end to end by the course, and gives the diagnostic sequence rather than promising success.
- **Whether the macOS Application Firewall is off by default.** Apple documents the configuration UI and
  the alert dialog but makes no statement of default state. **Resolution: taught as method** — Topic 20
  has learners check their own firewall state rather than asserting a default.
- **Whether `nano` and `less` still ship on current macOS.** `nano.1` and `less.1` return 404 on the
  current Xcode man-page mirror, while `pico.1` is present; the mirror's coverage is demonstrably
  incomplete. **Resolution: taught as method** — Topic 8 has learners run `which nano` before relying on
  it, and teaches `vi`'s escape hatch regardless.
- **A real LAN IPv4 address, default gateway, `ping` round-trip output, and a live `dig` answer.** The
  research container had only a loopback interface, and raw sockets and DNS were blocked. No fabricated
  output was substituted. **Resolution: taught as method** — Topics 11, 12, and 14 teach the commands and
  how to read their output shape, and every worked example uses either the real loopback capture (row 51)
  or a documented-example address, never an invented one.
- **macOS/BSD privileged-port behaviour.** Row 55 grounds the rule on Linux only. macOS has no
  `net.ipv4.ip_unprivileged_port_start`. **Resolution: flagged** — Topic 20 states the rule as a
  Unix convention and cites the Linux source, without claiming the sysctl is cross-platform.
- **Exact `curl` version shipped with current macOS.** Apple does not publish component versions.
  **Resolution: cut** — no curl version number appears in the course.
