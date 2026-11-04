# React Patterns

Read when writing or modifying React components.

- For components with children, define an interface with only component-specific props. Apply `PropsWithChildren` at the component type level:

```typescript
interface UserProviderProps {
  user?: User | null;
}
export const UserProvider: FC<PropsWithChildren<UserProviderProps>> = ({ user, children }) => { ... };
```

- Never add `children?: ReactNode` to the props interface; use the `PropsWithChildren` wrapper instead.
- Never use type aliases for props; always use interfaces.
