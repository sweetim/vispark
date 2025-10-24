# Coding Rules

- Use `type` instead of `interface` when defining TypeScript types to ensure consistency and avoid unintended interface merging.
- Prefer [`ts-pattern`](https://github.com/gvergnaud/ts-pattern) for pattern matching and exhaustive type handling whenever possible.
- Use `swr` for any HTTP request.
- Don't use abbreviations, always use full names.
- For nested navigation, use this folder structure:
  - route-A
    - Layout.tsx
    - APage.tsx
    - BPage.tsx
    - components
      - ComponentA.tsx
    - index.ts
- Naming of component arguments/props:
  - Always use full name with the component name
  - Example:
    - ComponentA
    - ComponentAProps
