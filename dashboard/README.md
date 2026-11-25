# Dev dashboard

A local status page for the development process: CI gates, lint rules,
tickets and conventions, with buttons that run the gates and stream their
output into the page.

```bash
node dashboard/server.mjs            # http://localhost:4317
node dashboard/server.mjs --port 5000
```

No dependencies and no build step: Node's `http` module, a vanilla-JS page.

## What it shows

| Tab | Source of truth | Run buttons |
|---|---|---|
| Overview | everything below | tile per CI step |
| Gates | `.github/workflows/ci.yml` (every `run:` step, grouped by job), plus checks `bin/checks.json` marks `kind: "ticket"` (failing, not in CI) | each step, each job, all |
| Lint rules | `lint/rules/<name>/README.md`, fixture counts, the `CONVENTIONS.md` IDs whose enforcer is `lint:<name>` | fixture tests (`node --test lint/rules/<name>/test.cjs`), whole corpus (`lint/verify-corpus.cjs --rule <name>`) |
| Tickets | `tickets/NNNN-*.md` | none (read-only) |
| Conventions | the rule tables in `CONVENTIONS.md` | none |

Nothing is copied or cached: every request re-reads the files, and the server
watches them, so the page refreshes when a ticket, rule, workflow or
convention changes.

## Observational by design

- The server runs only commands that ci.yml, `bin/checks.json` or `lint/rules`
  define, looked up by id. The page never sends a command string.
- Steps that would write tracked files or install things are listed but not
  runnable (`npm ci`/`pack`, `bin/gen-exports.js`, `git` state changes,
  `--fix`); see `UNSAFE` in `lib/sources.mjs`. Every runnable gate writes only
  to gitignored caches (`.cache/`, `.bench-smoke/`, `coverage/`,
  `test/.validation-ledger/`) or the OS temp dir.
- The only files it writes are its own: `dashboard/.state/results.json` (last
  result per gate, so results survive a restart; gitignored).
- It listens on 127.0.0.1 only, rejects foreign `Host` headers, and requires a
  custom header on POST, so another web page cannot trigger runs.

Runs use `bash -e -o pipefail` in the repo root, as Actions does. At most two
run at once (`DASH_CONCURRENCY=n` to change); the rest queue.

## Files

```
server.mjs        HTTP + server-sent events
lib/sources.mjs   read-only parsers (ci.yml, checks.json, lint/rules, tickets, CONVENTIONS.md, git)
lib/runner.mjs    run queue, output streaming, last-result store
public/           the page (index.html, app.js, style.css)
```
