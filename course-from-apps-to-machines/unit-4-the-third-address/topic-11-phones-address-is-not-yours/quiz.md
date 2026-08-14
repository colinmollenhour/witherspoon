# Quiz — The phone's address is not yours

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** TRUE_FALSE

`http://localhost:8000` on the phone loads the laptop's page, because the banner already says `0.0.0.0`.

**Correct answer:** false

**Explanation:**

The banner's `0.0.0.0` means the server is willing to answer on all interfaces. It does not change what `localhost` means on the phone. The phone still asks itself. Type the LAN IP you wrote down, not `localhost` (objectives 1, 2).

## Question 2

**Type:** SHORT_ANSWER

Why did `http://localhost:8000` work on the laptop and fail on the phone, and what do you type on the phone instead?

**Sample answer:**

`localhost` is the machine that is asking. On the laptop that is the laptop, where the server runs. On the phone that is the phone, so the request never reaches the laptop. Type `http://` plus the LAN IP you wrote down plus `:8000`, on the same Wi-Fi. The access log's first field then shows the phone, not `127.0.0.1`.

**A full-credit answer shows:**

A strong answer covers (1) that `localhost` / `127.0.0.1` names the machine that is asking, so the phone asked itself, and (2) that the phone must open `http://192.168.x.x:8000` — the number written down in Unit 3 — on the same Wi-Fi.

**Explanation:**

`localhost` means this machine only. The laptop asked itself and hit the server. The phone asked itself and missed it. The fix is the LAN URL on the same Wi-Fi, not another loopback spelling. An answer that tells the phone to type `localhost`, `127.0.0.1`, or `0.0.0.0` has mixed up the bind with the host (objectives 1, 3).

## Question 3

**Type:** MULTIPLE_CHOICE

You type `http://localhost:8000` on the phone. Who does `localhost` name?

- The phone — the machine that is asking.
- The laptop, because that is where the server is running.
- Every device on the same Wi-Fi.
- `0.0.0.0`, the address in the server banner.

**Correct option index:** 0

**Explanation:**

`localhost` is the machine that is asking, so on the phone it names the phone. The laptop is where the server runs, but that is not what the word means on a different device. It is not a shared name for the LAN, and it is not `0.0.0.0` — that is a bind address, not a host the phone types (objective 1).
