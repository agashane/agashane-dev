---
title: "UUID Primary Keys with AdonisJS, Lucid ORM and PostgreSQL"
slug: "uuid-primary-keys-adonisjs-lucid-postgresql"
excerpt: "Learn how to use UUIDs as primary keys in AdonisJS with Lucid ORM and PostgreSQL. Compare uuid vs string columns, generate UUIDs in Postgres 18, 17 and below, and add a beforeCreate model hook with the best TypeScript UUID libraries."
createdAt: 2026-11-15T13:15:19.537Z
updatedAt: 2026-11-15T13:15:19.537Z
publishedAt: 2026-11-15T13:15:19.537Z
categories: ["guide"]
tags: ["adonisjs", "lucid", "postgresql"]
locale: "en"
isDraft: false
---

## UUID for database primary keys

For years, auto-incrementing integers were the default choice for primary keys. Today, many teams prefer UUIDs (Universally Unique Identifiers), and for good reasons:

- **They are generated without the database.** Your application can create a record with its ID before any `INSERT`, which is useful for distributed systems, background jobs, and offline-first apps.
- **They do not leak information.** A sequential integer ID tells the world how many users or orders you have. A UUID does not.
- **They merge safely.** When you combine data from two databases, two UUIDs will never collide. Two auto-increment IDs will.

But UUIDs have a cost. A UUID is 16 bytes of raw data (36 characters as text) instead of 4 or 8 bytes for an integer, and a **random** UUID (version 4) scatters new rows across your B-tree index. This destroys insert locality and bloats your index.

This is why **UUIDv7** matters. UUIDv7 encodes a millisecond timestamp in its first bits, so identifiers are mostly sequential. You get the benefits of UUIDs with index behavior close to an auto-increment key. PostgreSQL 18 makes this easy with a native `uuidv7()` function, and TypeScript libraries can generate UUIDv7 in your AdonisJS code.

In this guide, we build UUID primary keys in an AdonisJS application with Lucid ORM and PostgreSQL, step by step.

## Before getting started

You need:

- **An AdonisJS project.** If you do not have one yet: `nub create adonisjs@latest my-app`.
- **PostgreSQL running** locally or remotely, with connection details in your `.env` file.

```env
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_DATABASE=
```

- **Lucid configured** with the Postgres dialect.

Install the PostgreSQL driver if it is missing:

```bash
node ace add @adonisjs/lucid
# choose "postgres" as the dialect
```

Update `config/database.ts` to use `pg` as default connection

```ts
import app from "@adonisjs/core/services/app";
import { defineConfig } from "@adonisjs/lucid";

const dbConfig = defineConfig({
  /**
   * Default connection used for all queries.
   */
  connection: "pg",

  connections: {
    /**
     * PostgreSQL connection.
     * Install package to switch: npm install pg
     */
    pg: {
      client: "pg",
      connection: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
      },
      migrations: {
        naturalSort: true,
        paths: ["database/migrations"],
      },
      schemaGeneration: {
        enabled: true,
        rulesPaths: ["./database/schema_rules.js"],
      },
      debug: app.inDev,
    },
  },
});

export default dbConfig;
```

Check your PostgreSQL version early, because it decides which UUID generation strategy you can use:

```sql
SELECT version();
```

## Using migrations, UUID generation directly in Postgresql

The cleanest setup lets PostgreSQL generate the UUID itself. You define the column once in a migration, and every `INSERT` gets an ID automatically, even inserts that bypass your AdonisJS models.

### Postgresql 18

PostgreSQL 18 added a native `uuidv7()` function. No extension needed. UUIDv7 is time-ordered, which is exactly what you want for a primary key.

Create the migration:

```bash
node ace make:migration posts

# OR create a model with its migration file
node ace make:model Post --migration
```

```ts
import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "posts";

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").notNullable().primary().defaultTo(this.raw(`uuidv7()`));
      // Some other rows
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
```

The key line is `table.uuid("id").primary().defaultTo(this.raw("uuidv7()"))`. PostgreSQL fills the `id` for you.

If you are on PostgreSQL 18 but prefer random UUIDs, use `gen_random_uuid()`, which is built in since PostgreSQL 13 and generates UUIDv4.

### Postgresql 17 and below

On PostgreSQL 17, 16, 15, 14, and 13, `gen_random_uuid()` is already built into the core. but generates UUIDv4. Use it the same way:

```ts
table.uuid("id").primary().defaultTo(this.raw(`gen_random_uuid()`));
```

Or if you're using `uuid_ossp` extension,

```ts
async up(){
	this.schema.raw(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
	this.schema.createTable(this.tableName, (table) => {
		table.uuid("id").primary().defaultTo(this.raw(`uuid_generate_v4()`));
	})
}
```

### The right column type `string` vs `uuid`

A common mistake is to declare the primary key as a string, because a UUID looks like text:

```ts
// ❌ works, but wasteful
table.string("id").primary();
```

This works, but it is the wrong choice. Here is why the native `uuid` type is better:

|                                                                                                                                                   | `uuid` column                      | `string` (varchar) column      |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------ |
| Storage                                                                                                                                           | 16 bytes, binary                   | 36 bytes minimum, text         |
| Validation                                                                                                                                        | PostgreSQL rejects malformed UUIDs | Any string is accepted         |
| Index size                                                                                                                                        | Smaller, faster comparisons        | Larger, string collation rules |
| Ordering                                                                                                                                          | Natural byte ordering              | Text ordering                  |
| In Lucid, a `uuid` column is generated as a TypeScript `string` in the `database/schema.ts` file, so your schema code looks identical either way. |

**Rule of thumb:** use `table.uuid()` in migrations and `string` as the TypeScript type in your schemas. Reserve `table.string()` for cases where the column must also accept non-UUID values, which is rare.

## UUID generation in code, use model hooks

When you want your AdonisJS application to control the ID, generate the UUID in code with a Lucid model hook.

### Some well-known Typescript libraries for UUIDs

- **`uuid`** — the de facto standard. Supports v1 to v7 in recent versions. `npm i uuid`, `npm i -D @types/uuid`
- **`crypto.randomUUID()`** — built into Node.js since v19 (and `crypto.webcrypto` earlier). Zero dependencies, generates UUIDv4.
- **`uuidv7`** — small package dedicated to time-ordered UUIDv7 generation. `npm i uuidv7`
- **`@paralleldrive/cuid2`** — not a UUID, but a popular collision-resistant ID alternative worth knowing. `npm i @paralleldrive/cuid2`
- `nanoid` — not a UUID but generates a secure URL-friendly unique string ID. `npm i nanoid`

Install the needed library :

```bash
npm i uuid
npm i -D @types/uuid # For Typescript support

# OR
npm i uuidv7
```

### `beforeCreate` model hook

Lucid hooks let you run code at a specific point of a model's lifecycle. `beforeCreate` runs just before the `INSERT` query, which is the perfect place to assign the ID.

```ts
import { PostSchema } from "#database/schema";

import { beforeCreate } from "@adonisjs/lucid/orm";
import { uuidv7 } from "uuidv7";

// If using `uuid`
// import { v7 as uuidv7 } from "uuid";
// import { v4 as uuidv4 } from "uuid";

// If using native `crypto.randomUUID` for UUID v4 generation
// import * as crypto from "node:crypto";

export default class Post extends PostSchema {
  static selfAssignPrimaryKey = true;

  @beforeCreate()
  static generateId(row: Post) {
    row.id = uuidv7();

    // Select one that fits your needs
    // row.id = uuidv4()
    // row.id = crypto.randomUUID()
  }
}
```

Two details matter here:

1. **`static selfAssignPrimaryKey = true`** tells Lucid that this model provides its own primary key. Without it, Lucid may expect the database to generate the ID.
2. The hook receives the model instance and mutates it before insert.

### Which approach should you choose ?

- **PostgreSQL generates the UUID** (`defaultTo` in the migration): safest for data integrity, works for any insert path,.
- **Lucid hook generates the UUID**: the ID is available in code before saving, and you can choose UUIDv7. This is the most common setup in AdonisJS projects.
- **Both**: add a default in the database as a safety net and a hook in the model for convenience. Rows never lack an ID, whichever path inserts them.

## Further reading

- [PostgreSQL documentation: UUID functions](https://www.postgresql.org/docs/current/functions-uuid.html) — official reference for `gen_random_uuid()` and `uuidv7()`.
- [RFC 9562: UUID specification](https://datatracker.ietf.org/doc/html/rfc9562) — the standard that defines UUID versions, including v7.
- [AdonisJS Lucid documentation](https://docs.adonisjs.com/guides/database/lucid) — models, columns, and hooks in AdonisJS v7.
- [AdonisJS discussion: using UUID in tables](https://github.com/adonisjs/core/discussions/1416) — community thread with full UUID model examples.
- [AdonisJS discussion: UUID v7 in Adonis](https://github.com/orgs/adonisjs/discussions/4985) — patterns for UUIDv7, including mixins to keep hooks DRY.
- [The `uuid` package on npm](https://www.npmjs.com/package/uuid) — RFC-compliant UUID generation for TypeScript, v4 and v7 included.
- [The `uuidv7` package on npm](https://www.npmjs.com/package/uuidv7) — RFC-compliant UUIDv7 generation for TypeScript.
- [Use Postgres for UUID primary keys: proven performance](https://fabwaseem.com/blog/uuidv7-postgres) — benchmarks comparing `uuidv7()` and `gen_random_uuid()`.
