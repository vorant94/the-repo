# Zod Preferences

Read when writing, modifying, or reviewing Zod schemas or validation in any package.

## Native APIs and Defaults

- Check Zod's built-in APIs before writing custom conversions, transforms, or validation helpers.
- Use `z.stringbool()` for string boolean values. Keep its defaults unless the domain or user requires different accepted values or case sensitivity. Do not manually convert an enum of `"true"` and `"false"` to a boolean.
- Use `z.coerce.number()` for numeric coercion instead of `.transform(Number)`. Add `.int()`, `.nonnegative()`, or other constraints when required by the field's meaning.
- Do not add digit-only regexes, string wrappers, or pipes merely to restrict built-in coercion. Add them only for an actual input-format requirement.
- Inline trivial field schemas such as `z.stringbool()` and `z.coerce.number().int().nonnegative()`. Do not create shared `booleanSchema` or `integerSchema` variables merely to name short expressions, even when several fields use them.
- Avoid unnecessary `.min(1)`: `z.string()` suffices for a required string argument. Require nonempty strings only when the domain needs it.

## Domain Semantics

- Choose coercion according to the input's meaning: `z.coerce.boolean()` uses JavaScript truthiness, so the string `"false"` becomes `true`. Use `z.stringbool()` when parsing boolean strings.
- `z.coerce.number()` converts an empty string to `0`. Keep explicit handling when the domain requires another result, such as converting an empty purchase price to `null`.
- Preserve domain requirements while simplifying schemas. Remove unnecessary restrictions and conversions without inventing new validation rules.

## Parsing and Types

- Always use `.parse()` by default and let validation errors throw. Never use `.safeParse()` unless the user explicitly asks for it.
- Define each domain schema once and infer its type. Export the schema and inferred type when other files need them.
- Declare and reuse named type aliases instead of repeating inline `z.infer` expressions at usage sites.

```typescript
export const chapterSchema = z.object({ title: z.string() });
export type Chapter = z.infer<typeof chapterSchema>;

// Use Array<Chapter>, not Array<z.infer<typeof chapterSchema>>.
```
