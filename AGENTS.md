# AGENTS.md

How to work with me on this project. This file governs agent behavior.
Learn the project from relevant code and existing docs. Do not create docs to
explain your work unless I explicitly ask.

## How to work

| Rule | Meaning |
| --- | --- |
| Understand first | Read the relevant code and any existing design guidance before proposing changes. |
| Quality over what exists | Do not preserve a poor design just because it exists. Propose a cleaner replacement. |
| Early phase | No backward compatibility, migrations or legacy support unless I ask. |
| Suggest, do not act | If you see a better approach outside the approved request, state the problem and recommendation in one line each. Wait for my yes before implementing it. An approved request already authorizes the requested work. |
| Show big changes first | Show proposed structure, file moves and renames before making them. |
| One decision at a time | Ask one clear question and recommend an answer. Do not stack options. |
| Small, separate steps | Each step does one thing, builds, passes tests and can be committed independently. Do not mix unrelated changes. |
| Discuss means discuss | When I ask to discuss, do not edit files, install anything, or change application state. Read relevant code if needed. |
| Done means checked | Run the build and relevant tests before saying done. State what could not be checked, including browser appearance. Documentation-only changes need a content and diff review, not a build. |
| Honest reports | Report failures with the relevant error output. Name skipped checks and remaining work. Do not claim a visual match without checking it. |
| Respect my workspace | Preserve my edits and deletions. Do not recreate deleted preview images. If I am running the dev server, use it and do not start, stop or restart it without asking. |

## Engineering principles

Production quality, organized code, and the simplest design that meets the task.

| Principle | Meaning |
| --- | --- |
| Keep it simple | A new reader should follow a file in one pass. |
| Only what is needed | Build for the current request. No speculative systems, flags or layers for later. |
| One fact, one place | Keep anatomy, proportions, defaults and units in their owning library modules. Interfaces consume them. Do not create shared abstractions for incidental similarity before a real repeated need exists. |
| One job | Keep responsibilities focused. Separate unrelated work instead of dumping it into a large file. |
| Data when appropriate | Add a variant as data or a focused module when the existing contract supports it. Do not invent a framework just to avoid editing shared code. |
| Small contracts | Depend on small interfaces rather than large objects or concrete implementations. |
| Composition | Build from small parts. Avoid deep inheritance. |
| Defaults inside | The library owns sensible defaults. Callers supply optional overrides only when they want a difference. Do not make every interface rebuild the defaults. |
| Separate concerns | Keep geometry, appearance and interface behavior separate. A visual region is not necessarily an animation joint. |
| Named numbers | Meaningful constants have names and one source. Keep voxel units, scale and counts explicit. |
| No shared mutable state | Pass dependencies explicitly. Immutable shared constants are fine. |
| Patterns need a reason | Use a pattern for a current problem and explain that problem briefly. |
| Measure first | Optimize only what measurements show is slow. |

When principles clash, simplicity and current requirements win.

## Never without being asked

- Commit or push.
- Add features, visual polish or interfaces outside the approved scope.
- Create or update documentation, README files, architecture notes, reports or
  other Markdown files. This explicitly requested AGENTS.md is an exception for
  its creation, not blanket permission for future documentation changes.
- Add dependencies or outside assets, including code, models, textures, sounds
  and fonts. Assets must be made by us or clearly licensed for our use.
- Generate or save preview screenshots as project files unless I request them.

## Commits

I commit unless I explicitly ask you to commit. When a code step is ready, give
one suggested commit message and the command that stages only that step. Account
for pre-existing uncommitted changes; use selective staging when necessary.
Explain briefly what the command stages. Do not run it on my behalf unless asked.

Format: `type(scope): message`, for example
`feat(characters): add region appearance overrides`.

| Part | Rule |
| --- | --- |
| type | Use one of the types below. |
| scope | The area touched, in lowercase. Omit only if there is no single area. |
| message | Lowercase, imperative verb, no final period, at most 60 characters. |
| body | Optional. Explain why, not what. |

| Type | Use for |
| --- | --- |
| feat | A new character-system capability or user-facing behavior. |
| fix | A bug fix. |
| art | Appearance changes with no new behavior. |
| refactor | Code reshaped with the same intended result. |
| perf | Faster or lighter with the same result. |
| test | Tests only. |
| docs | Explicitly requested documentation or comment-only changes. |
| chore | Setup, configuration or dependencies. |

Never add `Co-Authored-By`, "Generated with", or other AI attribution to commit
messages or pull requests.

## How to talk to me

I read fast and want short, simple answers.

| Rule | Meaning |
| --- | --- |
| Answer first | Start with the answer or decision I need to make. |
| Plain words | Use little jargon. Explain a necessary term once. |
| Problem in one line | State what is wrong plainly. |
| Short plans | At most 3 or 4 steps, one line each. Say who acts and whether it reads or changes things. |
| Short pieces | Use compact bullets or tables when they help. Say only what is needed. |
| Commands explained | Explain what each command does. |
| When I am confused | Restart from the problem in plain words instead of adding detail. |
| No em dashes | Use commas or periods. |
