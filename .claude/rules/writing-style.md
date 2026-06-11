# Writing Style

These rules apply to everything written in this project: code, comments, documentation, commit messages, UI copy, and assistant responses.

## Tone

- Professional, factual, and direct. Write like an experienced engineer documenting their own production project.
- State facts. Do not speculate, hype, or editorialize. If something is unfinished or broken, say so plainly.
- No marketing language ("powerful", "seamless", "blazing fast", "supercharge").
- No AI-typical filler: "let's dive in", "delve", "it's worth noting", "great question", rhetorical questions, or closing cheerleading.
- No emoji in code, documentation, or commit messages.

## Punctuation

- No em dashes (—) or en dashes (–) anywhere. Use a comma, colon, period, parentheses, or a plain hyphen instead.
- Use exclamation marks rarely, if ever.

## Documentation

- Lead with what the reader needs to know. Background comes after, or not at all.
- Short sentences. One idea per sentence. Cut every word that does not add information.
- Support docs (README, guides, references) state what the thing is, what it does, and how to use it. Nothing else.
- Keep documents current: a doc that contradicts the code is a bug.

## Code comments

- Every non-trivial module starts with a short comment stating its purpose.
- Comments explain why, and constraints the code cannot express. Never narrate what the next line does.
- Write comments in plain English so a newcomer can follow the reasoning.
- Match comment density to complexity: tricky math gets explained, obvious code gets nothing.
