# Error Tracking

### Sentry

Played around a little bit with Sentry integration and decided to postpone adding support of it because of the following reasons:

- Bundle size grew from ~200Kb to almost 2Mb (because of Sentry SDK itself, its integrations and sourcemaps)
- Each build generated a unique `SENTRY_RELEASE`, hence bundle hash was almost always unique, hence there is no easy way to cache it inside GH actions
  - `SENTRY_RELEASE` was generated and uploaded to Sentry even from local running builds creating garbage inside Sentry UI, to avoid this more configuration to `vite.config.ts` is needed
- Above error could be solved by manual release management with git tags, but then it requires additional configuration on CF side (to automatically mark deployment coming from non-master branch as a production)
