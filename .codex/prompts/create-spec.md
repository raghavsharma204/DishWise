---
description: Create a spec file and feature branch for the next DishWise milestone
argument-hint: "Milestone number and feature name e.g. 2 onboarding"
---

You are a senior developer spinning up a new milestone for the
DishWise personalized food recommendation app. Always follow the
rules in AGENTS.md.

User input: $ARGUMENTS

## Step 1 — Check working directory is clean
Run `git status` and check for uncommitted, unstaged, or
untracked files. If any exist, stop immediately and tell
the user to commit or stash changes before proceeding.
DO NOT CONTINUE until the working directory is clean.

## Step 2 — Parse the arguments
From $ARGUMENTS extract:

1. `milestone_number` — zero-padded to 2 digits: 2 → 02, 11 → 11
2. `feature_title` — human readable title in Title Case
3. `feature_slug` — lowercase kebab-case, only a-z, 0-9 and -, max 40 chars
4. `branch_name` — `feature/<feature_slug>`

If you cannot infer these from $ARGUMENTS, ask the user to clarify.

Treat the requested milestone as a single spec by default.
Do NOT split one milestone into multiple specs unless the user explicitly
asks for that or the milestone is too large to implement, test, and review
as one coherent unit.

## Step 3 — Check branch name is not taken
Run `git branch`.
If `branch_name` is already taken, append a number:
`feature/onboarding-01`, `feature/onboarding-02`, etc.

## Step 4 — Switch to master and pull latest
Run:
```bash
git checkout master
git pull origin master
```

If there is no `origin` remote or pulling fails, stop and report the issue.

## Step 5 — Create and switch to the feature branch
Run:
```bash
git checkout -b <branch_name>
```

## Step 6 — Research the codebase
Before writing the spec, inspect:
- `AGENTS.md`
- `README.md`, if present
- frontend structure
- backend/API structure
- database/schema/migrations
- authentication
- recommendation/personalization code
- tests
- all files in `.codex/specs/`

Use `find`, `rg`, `git ls-files`, etc. Do not assume paths exist.

If the requested milestone is already complete or implemented, warn the user
and stop.

## Step 7 — Write the spec
Generate a spec with this exact structure:

---
# Spec: <feature_title>

## Overview
One paragraph describing what this milestone does, why it exists at this
stage of the DishWise roadmap, and what user problem it solves.

## Depends on
Which previous milestones or existing functionality are required.

## User flow
Describe the user-visible flow step by step.
If none: state that explicitly.

## Routes / API endpoints
Every new or changed route:
- `METHOD /path` — description — access level

If none: state "No new routes or API endpoints".

## Database changes
Any new tables, columns, indexes, relationships, constraints, or migrations.
Verify against the existing schema first.
If none: state "No database changes".

## UI / Components
- **Create:** new pages/components with paths
- **Modify:** existing pages/components and changes

If none: state "No UI changes".

## Recommendation / personalization changes
Describe effects on:
- taste profile
- likes/dislikes/saves
- craving parsing
- scoring/ranking
- explanations
- cross-session learning

If none: state "No recommendation or personalization changes".

## Data sources
List any internal/external data sources.

DishWise V1 constraints:
- Must remain 100% free to build, run, and deploy.
- No paid APIs or paid services for core functionality.
- Prefer OpenStreetMap / Overpass for restaurant/location data.
- Public restaurant menu data only when permitted by terms and robots.txt.
- Avoid Google Maps, Yelp, OpenAI API, or other paid dependencies for core functionality.

If none: state "No new data sources".

## Files to change
Every existing file to modify.

## Files to create
Every new file to create.

## New dependencies
List any new package/service, why it is needed, and confirm it is free/open-source
or within a suitable free tier.
If none: state "No new dependencies".

## Rules for implementation
Always include:
- Follow `AGENTS.md`.
- V1 must remain deployable and usable at $0/month.
- No paid APIs/services for core functionality.
- Desktop web only for V1.
- Initial launch region: Indianapolis, Indiana.
- Dish recommendations are primary; restaurants are where users obtain them.
- Core MVP flow: craving + location → 3–5 dish recommendations → user feedback.
- Like, Dislike, and Save where relevant.
- Persist personalization across sessions when applicable.
- Prefer transparent rules/scoring over unnecessary AI/LLM complexity.
- Explanations should be human-readable; no fake probability percentages.
- Do not introduce an ORM unless already used.
- Use parameterized DB queries or the existing safe DB client.
- Never hardcode secrets.
- Keep secrets in environment variables.
- Validate user/external input at API boundaries.
- Reuse existing abstractions.
- Do not refactor unrelated code.
- Add/update tests for new behavior.

## Definition of done
A testable checklist including:
- happy path
- error/empty states
- persistence, if applicable
- tests passing
- lint/type-check/build passing where configured
- no paid service required
- no secrets committed
---

## Step 8 — Save the spec
Save to:
`.codex/specs/<milestone_number>-<feature_slug>.md`

Create `.codex/specs/` if needed.

## Step 9 — Validate the spec
Before reporting completion:
1. Re-read the spec.
2. Verify referenced files exist unless listed under "Files to create".
3. Verify DB changes do not duplicate the existing schema.
4. Verify DishWise V1 constraints are respected.
5. Run `git status` and confirm the only intentional change is the new spec file.

Do not implement the milestone. This command creates the branch and spec only.

## Step 10 — Report to the user
Print:
```text
Branch:    <branch_name>
Spec file: .codex/specs/<milestone_number>-<feature_slug>.md
Title:     <feature_title>
```

Then tell the user:

"Review the spec at `.codex/specs/<milestone_number>-<feature_slug>.md`,
then use Codex Plan mode (`/plan`) to review the implementation plan
before asking Codex to implement it."

Do not print the full spec unless explicitly asked.
