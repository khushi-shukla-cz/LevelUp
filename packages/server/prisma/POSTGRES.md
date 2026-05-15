# Switch to PostgreSQL (Prisma)

This project ships with SQLite for local development. To switch to PostgreSQL for production:

1. Set `DATABASE_URL` in your environment or `.env`:

   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/levelup
   ```

2. Update `packages/server/prisma/schema.prisma` datasource to use `provider = "postgresql"`.
   You can replace the `datasource db { ... }` block, or use the provided commented example in the file.

3. Create and apply migrations locally (interactive):

   ```bash
   cd packages/server
   npm run db:migrate:postgres
   ```

4. Seed the database (if needed):

   ```bash
   npm run db:seed
   ```

5. In CI / production, apply migrations non-interactively:

   ```bash
   npm run db:deploy:postgres
   ```

Notes
- Ensure your Postgres user has permissions to create schemas and run migrations.
- For Docker-based deployments, set `DATABASE_URL` in your container environment or Docker secrets.
- If you keep SQLite for local dev, consider maintaining separate `.env` files or use `DATABASE_URL` overrides in your CI pipeline.
