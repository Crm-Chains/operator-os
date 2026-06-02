# operators/<slug>/ — your operator imprint

This directory is **yours**. It lives inside your private clone of operator-os and is
never committed to the public upstream repo.

## What this directory contains

| File | Purpose |
|------|---------|
| `IMPRINT.md` | The canonical record of who you are and which chassis pieces you have activated — the Four Cs in manifest form |
| _(anything else you add)_ | Operator-specific docs, local overrides, scratch notes |

## What IMPRINT.md is

`IMPRINT.md` is the machine-readable manifest that ties your identity, knowledge domains,
external connections, active capabilities, and cadence rhythms together in one place.

- `/audit` reads it to measure Four-Cs completeness and detect drift.
- `/level-up` reads it to propose the next capability improvements.
- It replaces the need to re-explain your context at the start of each session.

Think of it as the persistent "brain snapshot" of this operator instance.

## How to create yours

Run `/onboard` from the repo root. The command will:

1. Ask a small set of guided questions — one per Four-Cs layer.
2. Write `operators/<your-slug>/IMPRINT.md` filled in with your answers.
3. Scaffold any first swarm or skill stubs you named.
4. Wire the chassis to your declared connections and cadence.

Run `/onboard --deep` for a more thorough, adversarial intake that produces a sharper imprint.

Run `/onboard` again any time your domain, connections, or capability set changes
materially.

## The template

`operators/_template/IMPRINT.md` is the blank form `/onboard` starts from. You can
read it to understand the shape before running the command, but do not fill it in by hand
in this directory — let `/onboard` do the work and write directly to `operators/<your-slug>/`.

## Private-clone discipline

- Keep your `operators/<slug>/` directory out of any public fork or PR.
- Add your slug directory to `.gitignore` if you fork the public repo and want to push
  upstream contributions without exposing your imprint.
- Never put secrets in `IMPRINT.md`. Connection entries are variable NAMES only;
  real values go in `.env.local` (gitignored by default).
