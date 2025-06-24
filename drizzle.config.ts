import type { Config } from "drizzle-kit";

export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: "ep-small-hill-a6ng8akv.us-west-2.aws.neon.tech",
    user: "neondb_owner",
    password: "npg_7nwBviZQqC0p",
    database: "neondb",
    ssl: true
  }
} satisfies Config; 