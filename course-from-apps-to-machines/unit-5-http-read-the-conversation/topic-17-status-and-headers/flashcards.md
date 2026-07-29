# Flashcards — Status codes and headers

---

**Front:** Name the five status-code classes and their ranges.

**Back:** Informational `100`–`199`, Successful `200`–`299`, Redirection `300`–`399`, Client error
`400`–`499`, Server error `500`–`599`.

---

**Front:** `200`

**Back:** OK. "The 200 (OK) status code indicates that the request has succeeded. The content sent in
a 200 response depends on the request method."

---

**Front:** `301`

**Back:** Moved Permanently. The target resource "has been assigned a new permanent URI and any
future references to this resource ought to use one of the enclosed URIs" — the new address rides
along in the response.

---

**Front:** `304`

**Back:** Not Modified. Your conditional request "would have resulted in a 200 (OK) response if it
were not for the fact that the condition evaluated to false" — nothing changed, so use the copy you
already have.

---

**Front:** `404`

**Back:** Not Found. "The origin server did not find a current representation for the target resource
or is not willing to disclose that one exists."

---

**Front:** `500`

**Back:** Internal Server Error. "The server encountered an unexpected condition that prevented it
from fulfilling the request."

---

**Front:** A row in the Network panel reads `304` on a reload. What happened to the bytes?

**Back:** The head arrived; the body did not. A 304 carries no body, so the Size column collapses to
almost nothing and the page appears instantly from your existing copy.

---

**Front:** `4xx` versus `5xx` — who do you go and fix?

**Back:** `4xx` means the client's request was wrong, so you change your URL, method, or headers.
`5xx` means the server broke, so the fix is on the server. Both mean the server answered.

---

**Front:** `Content-Type`

**Back:** The header that "indicates the media type of the associated representation" — the server
declaring what kind of thing the body is, so the browser does not have to guess from the file's name.

---

**Front:** `Content-Length`

**Back:** The header that "indicates the associated representation's data length as a decimal
non-negative integer number of octets" — how many bytes of body are coming. An octet is a byte.

---

**Front:** The `OK` in `HTTP/1.0 200 OK` — what is it called, and what acts on it?

**Back:** The reason phrase. Nothing acts on it: it is "a brief, purely informational, text
description of the status to help a human understand the outcome of a request." Software reads the
number.
