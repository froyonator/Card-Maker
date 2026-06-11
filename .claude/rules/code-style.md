# Code Style

(App code does not exist yet — these rules take effect with the first scaffold. Update when the stack is finalized.)

- TypeScript everywhere, `strict: true`. No `any` unless annotated with a reason.
- Prefer small, focused files: one component/module responsibility per file.
- Components: PascalCase files and exports. Utilities/hooks: camelCase, hooks prefixed `use`.
- No premature abstraction — duplicate twice before extracting (rule of three).
- Comments explain constraints and "why", never "what" the next line does.
- Match the formatting config in `.editorconfig`; formatter/linter config will be added with the scaffold.
