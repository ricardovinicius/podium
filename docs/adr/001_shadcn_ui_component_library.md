# ADR 001 — Adopt shadcn/ui as the Web Frontend Component Library

## Status
Accepted

## Context
The web frontend (`apps/web`) is built with Next.js and TypeScript. As we begin implementing the tournament UI (bracket visualization, admin flows, judge actions), we need a component library that provides:

- Accessible, production-quality primitives (buttons, dialogs, tables, forms, dropdowns).
- Full styling control — the design needs to feel premium and match the project's visual identity.
- Compatibility with Next.js App Router and React Server Components.
- Low lock-in — components should be ownable and modifiable without waiting on upstream changes.

The project also requires MetaMask/wallet integration, bracket tree visualization, and real-time event updates, so the component library must not impose rigid abstractions that conflict with custom interactive elements.

## Decision
Use **shadcn/ui** as the component library for `apps/web`.

shadcn/ui is not a traditional npm dependency — it is a CLI-based collection of copy-paste components built on top of Radix UI primitives and styled with Tailwind CSS. Components are added to the project source and owned entirely by the team.

This means:
- Components live in `apps/web/components/ui/` as first-party source code.
- Tailwind CSS is adopted as the styling solution for the web frontend.
- Radix UI is the underlying accessibility/primitive layer (installed as a dependency).

## Alternatives Considered
- **Material UI (MUI)**: Mature and feature-rich, but heavily opinionated styling system (Emotion/styled-components). Difficult to customize beyond its design language without fighting the framework. Large bundle size.
- **Chakra UI**: Good DX and accessible, but runtime CSS-in-JS adds overhead. Less aligned with Tailwind-based workflows and Next.js RSC support is limited.
- **Radix UI + custom styles (no shadcn)**: Maximum control, but requires building every component from scratch. shadcn/ui provides exactly this with sensible defaults already applied, saving significant effort.
- **Ant Design**: Enterprise-focused, heavy, opinionated. Visual language doesn't match the project's identity. Poor tree-shaking.
- **Headless UI (Tailwind Labs)**: Fewer primitives than Radix, smaller ecosystem. shadcn/ui already wraps Radix which is more comprehensive.

## Consequences
### Positive
- Full ownership of component source — no black-box abstractions to work around.
- Built on Radix UI, so all components are accessible (WAI-ARIA) out of the box.
- Tailwind CSS integration gives fine-grained styling control and excellent Next.js support.
- Compatible with React Server Components and Next.js App Router.
- Active ecosystem with frequent community contributions and new components.
- Easy to extend — adding custom variants or modifying behavior is editing local files.

### Negative
- Tailwind CSS is now a required dependency for the web frontend (adds build tooling).
- Components are copy-pasted source, so upstream improvements must be manually pulled (no automatic npm updates).
- Team must maintain component code if bugs are found in primitives.

### Neutral
- The project adopts Tailwind CSS conventions for the web frontend. This does not affect the API or on-chain packages.
- Developers unfamiliar with Tailwind will need to learn its utility-class approach.

## References
- [shadcn/ui documentation](https://ui.shadcn.com)
- [Radix UI primitives](https://www.radix-ui.com)
- [Spec 002 — Traversal Prototype](../../specs/002_traversal_prototype.md)
