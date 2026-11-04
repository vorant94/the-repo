# Zustand Patterns

Read when writing or modifying Zustand stores or their consumers.

- Use `immer` middleware (`zustand/middleware/immer`) for mutable update syntax in `set()` callbacks: `create<Store>()(immer((set) => ({ ... })))`.
- Call actions via `store.getState().action()` in event handlers. Never select actions with `useStore((s) => s.action)`; selectors are for state values only.
- Compute derived state inline in `useStore((s) => ...)` selectors. Do not store computed selectors as functions in the store; calling them outside a selector skips subscription.
- Wrap array/object-returning selectors with `useShallow` from `zustand/react/shallow` to prevent infinite re-renders: `useStore(useShallow((s) => s.items.filter(...)))`. Without it, a new reference on every selector call triggers `useSyncExternalStore` to loop.
