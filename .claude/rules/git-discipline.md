# Git Discipline

- Work on `main` locally for now; switch to feature branches once the app scaffold lands.
- Small, atomic commits — one logical change per commit.
- Conventional commit messages: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`.
- Never force-push `main`. Never rewrite published history.
- Push to `origin` (https://github.com/froyonator/Card-Maker) occasionally — local-first workflow; the remote is backup + publication, not the workspace.
- Never commit secrets, tokens, or `.env` files. `.claude/state/` is personal memory and stays untracked.
- Record significant decisions in `.claude/knowledge/decisions.md` in the same commit as the change they explain.
- Maintain `CHANGELOG.md` (Keep a Changelog format): add entries under `[Unreleased]` as work lands. At the end of every working session that shipped meaningful changes, roll `[Unreleased]` into a new dated version (0.x: minor = features, patch = fixes/docs), and commit it. Once a `package.json` exists, keep its `version` in sync.
