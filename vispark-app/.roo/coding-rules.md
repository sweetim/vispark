# Coding Rules

- Use `type` instead of `interface` when defining TypeScript types to ensure consistency and avoid unintended interface merging.
- Prefer [`ts-pattern`](https://github.com/gvergnaud/ts-pattern) for pattern matching and exhaustive type handling whenever possible.
- `useswr` for any http request
- dont use abbreviation, always use full name
- for the nested navigation, use this folder structure
  - route-A
    - Layout.tsx
    - APage.tsx
    - BPage.tsx
    - components
      - ComponentA.tsx
    - index.ts
- naming of commponent arguments props
  - always use full name with the component name
  - example:
    - ComponentA
    - ComponentAProps
