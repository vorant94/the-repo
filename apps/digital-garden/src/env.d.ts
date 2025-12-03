type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

// biome-ignore lint/style/noNamespace: copy-paste from astro docs
declare namespace App {
  interface Locals extends Runtime {
    db:
      | import("drizzle-orm/d1").DrizzleD1Database
      | import("drizzle-orm/libsql").LibSQLDatabase;
    session: import("./schema/sessions").Session | null;
    user: import("./schema/users").User | null;
  }
}
