# Unit Testing Preferences

Read when writing, modifying, or reviewing unit tests in any package.

- Test business logic directly with explicit domain-record fixtures. Construct parsed records directly rather than invoking parsers to build command inputs.
- Keep parser, formatter, and integration tests separate from command or domain unit tests. Do not call formatters to assert domain results or invoke subprocesses or filesystem operations in command unit tests.
- Test parsing and formatting independently in their own test files.
- Prefer explicit tests with inline fixtures and assertions over loops, generated test cases, or fixture-building helpers. Repetition is acceptable when it makes each case easier to read.
- Define a separate `expected` variable in every test. Use readable `dedent` blocks for multiline textual fixtures and expected output.
- When porting existing tests, preserve their names and order where applicable. Omit runtime-specific checks, such as manual memory ownership, that do not apply to the target runtime.
- When fixing a bug, add a regression test for the exact reported case.
