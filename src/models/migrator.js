import { resolve } from "node:path";
import migrationRunner from "node-pg-migrate";
import database from "infra/database";

const defaultMigrationsOptions = {
  dryRun: true,
  dir: resolve(process.cwd(), "src", "infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

let dbClient;

async function listPendingMigrations() {
  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dbClient,
    });
    return pendingMigrations;
  } finally {
    await dbClient.end();
  }
}

async function runPendingMigrations() {
  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dbClient,
      dryRun: false,
    });

    return migratedMigrations;
  } finally {
    await dbClient.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
