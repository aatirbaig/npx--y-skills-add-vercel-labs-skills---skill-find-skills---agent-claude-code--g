# Agent Skills

Nineteen skills installed globally (user-level, `~/.claude/skills/`) via the
[Skills CLI](https://skills.sh/). They were installed in an ephemeral container, so this file
exists to reproduce the set on a real machine.

Nothing here is vendored into the repo — `-g` installs to `~/.claude/skills/` and records the
set in `~/.agents/.skill-lock.json`.

## Install everything

```bash
# Skill discovery
npx -y skills add vercel-labs/skills --skill find-skills --agent claude-code -g

# Design & frontend
npx -y skills add anthropics/skills   --skill frontend-design              --agent claude-code -g
npx -y skills add vercel-labs/agent-skills --skill web-design-guidelines   --agent claude-code -g
npx -y skills add vercel-labs/agent-skills --skill vercel-react-best-practices --agent claude-code -g

# Browser & testing
npx -y skills add anthropics/skills   --skill webapp-testing               --agent claude-code -g
npx -y skills add vercel-labs/agent-browser --skill agent-browser          --agent claude-code -g
npx -y skills add obra/superpowers    --skill test-driven-development      --agent claude-code -g

# mattpocock engineering pipeline
npx -y skills add mattpocock/skills --skill wayfinder                      --agent claude-code -g
npx -y skills add mattpocock/skills --skill research                       --agent claude-code -g
npx -y skills add mattpocock/skills --skill prototype                      --agent claude-code -g
npx -y skills add mattpocock/skills --skill grilling                       --agent claude-code -g
npx -y skills add mattpocock/skills --skill grill-me                       --agent claude-code -g
npx -y skills add mattpocock/skills --skill codebase-design                --agent claude-code -g
npx -y skills add mattpocock/skills --skill domain-modeling                --agent claude-code -g
npx -y skills add mattpocock/skills --skill tdd                            --agent claude-code -g
npx -y skills add mattpocock/skills --skill code-review                    --agent claude-code -g
npx -y skills add mattpocock/skills --skill diagnosing-bugs                --agent claude-code -g
npx -y skills add mattpocock/skills --skill improve-codebase-architecture  --agent claude-code -g
npx -y skills add mattpocock/skills --skill setup-matt-pocock-skills       --agent claude-code -g
```

Verify with `ls ~/.claude/skills/` or by reading `~/.agents/.skill-lock.json`.

## The set

| Skill | Source | Notes |
| --- | --- | --- |
| `find-skills` | `vercel-labs/skills` | Searches skills.sh and installs what it finds |
| `frontend-design` | `anthropics/skills` | Visual direction; pushes against templated defaults |
| `web-design-guidelines` | `vercel-labs/agent-skills` | Audits UI against Vercel's Web Interface Guidelines |
| `vercel-react-best-practices` | `vercel-labs/agent-skills` | ~74 rule files; React/Next perf |
| `webapp-testing` | `anthropics/skills` | Playwright scripts + server lifecycle helper |
| `agent-browser` | `vercel-labs/agent-browser` | Discovery stub; needs the `agent-browser` npm CLI |
| `test-driven-development` | `obra/superpowers` | Strict red-green; deletes code written before its test |
| `wayfinder` | `mattpocock/skills` | Maps oversized work as decision tickets on an issue tracker |
| `research` | `mattpocock/skills` | Background agent, primary sources only |
| `prototype` | `mattpocock/skills` | Throwaway logic or UI prototype |
| `grilling` | `mattpocock/skills` | Relentless interview; design tree in rounds |
| `grill-me` | `mattpocock/skills` | User-facing entry point for `grilling` |
| `codebase-design` | `mattpocock/skills` | Deep-module vocabulary (module/interface/depth/seam) |
| `domain-modeling` | `mattpocock/skills` | Maintains `CONTEXT.md` and ADRs |
| `tdd` | `mattpocock/skills` | Seams-first TDD; confirm seams before testing |
| `code-review` | `mattpocock/skills` | Two-axis review (Standards + Spec) in parallel sub-agents |
| `diagnosing-bugs` | `mattpocock/skills` | Six-phase loop; feedback loop before hypothesis |
| `improve-codebase-architecture` | `mattpocock/skills` | Scans for shallow modules, renders an HTML report |
| `setup-matt-pocock-skills` | `mattpocock/skills` | Per-repo config for the pipeline; run once |

User-invocable only (`disable-model-invocation: true`, so they never fire on their own):
`grill-me`, `improve-codebase-architecture`, `wayfinder`, `setup-matt-pocock-skills`.

## Gotchas

**`react-best-practices` is not the skill name.** The directory is `react-best-practices`, but the
frontmatter declares `vercel-react-best-practices`, and the CLI matches the declared name. Using the
directory name fails with "No matching skills found".

**`grill-me` is inert without `grilling`.** Its entire body is "Run a `/grilling` session" — the
implementation is a separate skill. Install both.

**Two TDD skills disagree.** `obra/superpowers` applies TDD to refactoring and deletes implementation
code written before its test; `mattpocock/tdd` explicitly excludes refactoring from the loop and
requires confirming seams with the user before any test is written. Their triggers overlap almost
exactly. Pick one per task, or drop one.

**`code-review` collides with Claude Code's built-in `/code-review`.** Both claim the name and they do
different things — the built-in reviews the current diff for bugs, mattpocock's needs a fixed point
(commit/branch/tag) and reviews Standards vs Spec. Which one `/code-review` resolves to is untested.

**`agent-browser` needs its CLI**, which the skill file only mentions in passing:

```bash
npm i -g agent-browser && agent-browser install
```

**`setup-matt-pocock-skills` writes to the repo** — `docs/agents/*.md` plus an `## Agent skills`
block in `CLAUDE.md` or `AGENTS.md`. It asks which to create when neither exists.

## Restricted-network environments

Found while installing these in a sandboxed container. None apply on an unrestricted machine.

- **skills.sh is unreachable** → `npx skills find` reports "No skills found" for *every* query
  rather than a network error. `npx skills add` still works: it falls back to `git clone`.
  Discovery has to happen by cloning candidate repos and reading them.
- **`agent-browser install` fails** — it fetches Chrome from `googlechromelabs.github.io`. Point it at
  an existing browser instead:
  ```bash
  export AGENT_BROWSER_EXECUTABLE_PATH=/opt/pw-browsers/chromium
  export AGENT_BROWSER_ARGS="--no-sandbox,--disable-dev-shm-usage"
  ```
  Put these *above* the `[ -z "$PS1" ] && return` guard in `~/.bashrc`, or non-interactive shells
  skip them. External sites still fail (`ERR_TUNNEL_CONNECTION_FAILED`); `localhost` and `file://`
  work fully.
- **`improve-codebase-architecture` renders a broken report** — its HTML pulls Tailwind and Mermaid
  from CDNs, and opens the file with `xdg-open`. With CDNs blocked and no display, the output is
  unstyled and unreachable. Inline the CSS and hand the file over another way.
- **`research` is degraded** — web search works, but many primary sources (MDN, docs.python.org,
  react.dev) are blocked while secondary blogs remain fetchable. That inverts the skill's own rule,
  so name which sources were actually reachable.
- **`setup-matt-pocock-skills` assumes `gh`/`glab`.** Where neither exists, choose the local-markdown
  tracker (`.scratch/`) — the GitHub path emits `gh issue create` commands that will fail.
