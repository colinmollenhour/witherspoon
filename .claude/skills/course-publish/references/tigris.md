# Tigris publishing contract

Use Tigris as a direct object-storage host. Current official references:

- Remote MCP and OAuth setup: <https://www.tigrisdata.com/docs/mcp/remote/>
- CLI authentication/configuration: <https://www.tigrisdata.com/docs/cli/configure/>
- CLI quickstart: <https://www.tigrisdata.com/docs/ai-agents/tigris-cli-quickstart/>
- Public buckets and static-site behavior: <https://www.tigrisdata.com/docs/buckets/public-bucket/>
- Custom domains: <https://www.tigrisdata.com/docs/buckets/custom-domain/>

## Choose MCP or CLI

Prefer a Tigris MCP connector that is **already connected and capable**. Otherwise use the CLI; a
fresh MCP setup is not simpler when the current client must restart or when its tools cannot perform
a correct site upload.

The MCP route is capable only if its exposed tools can:

1. list buckets and objects;
2. create a bucket with public-read access;
3. upload every file beneath `dist/` with the same relative key;
4. preserve binary bytes; and
5. set or correctly infer `Content-Type` for HTML, CSS, JavaScript, JSON, SVG, fonts, and images.

Probe the actual exposed tool schemas. Do not assume names from documentation. The commonly exposed
`tigris_create_bucket` supports `isPublic`, but the local MCP server's
`tigris_put_object_from_path` uploads one file without a `ContentType` argument. That tool by itself
is not a correct course-site uploader. If the connected remote server has the same limitation, use
the CLI instead of publishing files that browsers download or reject.

When a remote connector is wanted and the current client supports adding it without losing the
session, use `https://mcp.storage.dev/mcp` with OAuth. Official examples include:

```text
Claude Code: claude mcp add --scope user --transport http tigris https://mcp.storage.dev/mcp
Codex:       codex mcp add --url https://mcp.storage.dev/mcp tigris
```

The user completes the provider's OAuth page. Never ask them to paste OAuth tokens into chat.

## CLI setup and authentication

Prefer an installed `tigris`; `t3` is its equivalent alias. If neither exists, use the first
available official package path:

```bash
# Node/npm
npm install -g @tigrisdata/cli

# Homebrew
brew install tigrisdata/tap/tigris
```

Do not pipe a remote install script from GitHub. If neither package manager exists, use a capable
connected remote MCP server. If neither MCP nor a supported package manager is available, ask the
user to choose between installing Node/Homebrew and switching to another direct-upload host; there
is no hidden credential or partial-upload fallback.

Then authenticate through the browser and verify the session:

```bash
tigris login oauth
tigris whoami
```

If browser OAuth is unavailable, `tigris configure` can securely save an access-key pair to the
user's local Tigris config. Let the command prompt for secrets; never put a secret in a command shown
in chat, shell history, a course file, or `.course-publish.json`.

Organizations created after May 18, 2026—which includes new Tigris users—must add a verified
payment method before they can create a public bucket. Tell the user before starting authentication:
“Tigris requires a verified payment method for public buckets. Adding one is a short, straightforward
Link flow.” The user enters payment details directly in Link, never in chat. If Tigris reports the
requirement during publishing, send the user to that account flow, wait for completion, and retry the
same operation. Do not collect payment details.

## Destination and public access

Derive a new bucket name from the course slug:

- lowercase ASCII letters, digits, and hyphens;
- no dots, because Tigris-managed wildcard TLS domains do not support dotted bucket names;
- trim repeated/leading/trailing hyphens;
- if the name is already owned by someone else, add a short stable suffix.

Reuse the destination in `.course-publish.json` on later publishes. A same-named bucket without that
manifest is a collision, not permission to upload.

Create a new public bucket with the CLI:

```bash
tigris mk t3://COURSE_BUCKET --public
```

With a capable MCP connector, create the bucket with public access (`isPublic: true` when that is the
exposed schema). If reusing a manifest-owned private bucket, make it public with the current bucket
settings tool or CLI before upload:

```bash
tigris buckets set COURSE_BUCKET --access public
```

Do not enable anonymous directory listing. It is unnecessary for a website and reveals the complete
object inventory.

## Upload

Upload the contents of `dist/` to the bucket root. The trailing slashes are intentional:

```bash
tigris cp /absolute/path/to/course/dist/ t3://COURSE_BUCKET/ --recursive
```

Do not upload to `t3://COURSE_BUCKET/dist/`. Do not add `--access private`; objects must inherit the
public bucket's read access.

For a repeat publish, obtain the remote inventory before upload:

```bash
tigris ls t3://COURSE_BUCKET
```

Overwrite matching keys. If and only if `.course-publish.json` identifies this bucket as dedicated
to the course **and the listing is complete**, compare its object keys with the local relative-file
inventory and remove each remote-only key individually:

```bash
tigris rm t3://COURSE_BUCKET/EXACT_STALE_KEY --force
```

If the CLI output is truncated, grouped ambiguously, or otherwise cannot prove a complete inventory,
use a connected MCP/API paginator that returns exact keys. If none is available, skip stale cleanup
and say so; current keys are still overwritten, and leaving an obsolete object is safer than a broad
delete. Never delete the bare bucket path or use a broad wildcard.

The managed entry URL is:

```text
https://COURSE_BUCKET.t3.tigrisfiles.io/index.html
```

The equivalent `t3.tigrisbucket.io` and `t3.tigrisblob.io` public content domains work too, but pick
one and keep it stable in the manifest. Use `t3.tigrisfiles.io` for the displayed provider URL.
`https://t3.storage.dev` is the authenticated API endpoint, not a public website origin.

## Required static-site caveat

Tigris serves exact object keys. It does **not** map `/` to `/index.html`, and it does not map a
subpath ending in `/` to a nested `index.html`. Therefore:

- publish and share the exact `/index.html` entry URL;
- expect the bare bucket root to return `403` while directory listing remains disabled;
- retain Astro's file-style routes such as `/unit-1/topic-1.html`;
- never claim the bare custom hostname is the working site URL; and
- do not add a client-side redirect at `/`—Tigris never serves an object for that request.

A provider with default-index or edge-rewrite support is a better choice if the user's hard
requirement is a bare-root URL. State that tradeoff and let the user switch providers; do not add an
edge layer while calling the result the simplest Tigris flow.

## MIME and browser verification

After upload, fetch `/index.html` and require `Content-Type: text/html`. Parse its asset references,
then fetch representative CSS, JavaScript, SVG/font, and raster-image objects that exist in the
build. Require correct browser MIME types and successful responses.

If an MCP upload omitted metadata, re-upload through the CLI. If the CLI upload still returns an
incorrect MIME type, inspect the current CLI help/provider docs and set explicit object metadata via
the S3-compatible API. Do not accept `application/octet-stream` for HTML, CSS, or JavaScript.

Finally open the exact `/index.html` URL in a browser and follow a relative internal link. This
catches the two common bad deployments: `dist/` accidentally becoming a remote prefix and assets
being uploaded with unusable MIME metadata.

## Custom hostname

Custom domains do not require moving DNS hosting to Tigris.

1. First verify the managed `/index.html` URL.
2. At the user's existing DNS provider, create a CNAME:

   ```text
   NAME:   requested course subdomain
   TARGET: COURSE_BUCKET.t3.tigrisbucket.io
   MODE:   DNS-only / unproxied
   ```

3. Keep that CNAME in place; Tigris uses it for TLS issuance and renewal.
4. In the Tigris Dashboard, open the bucket, choose **Settings**, find **Custom Domains**, enter the
   exact hostname, and save.
5. Wait for DNS and certificate issuance, then verify:

   ```text
   https://CUSTOM_HOSTNAME/index.html
   ```

A TLS-terminating proxy such as Cloudflare's proxied/orange-cloud mode prevents Tigris certificate
validation; use DNS-only mode. Prefer a subdomain because many DNS providers do not permit a CNAME at
the zone apex.

The `/index.html` limitation remains on the custom hostname. If the user wants a polished bare-root
custom-domain URL, recommend a direct-deploy static host with default-index handling instead of
quietly adding another proxy/CDN layer.
