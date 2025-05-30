import { resolve } from "node:path";
import { createRouter } from "next-connect";
import migrationRunner from "node-pg-migrate";

import database from "infra/database";
import controller from "infra/controller";

let dbClient;

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandler);

const defaultMigrationsOptions = {
  dryRun: true,
  dir: resolve(process.cwd(), "src", "infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function getHandler(request, response) {
  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dbClient,
    });
    return response.status(200).json(pendingMigrations);
  } finally {
    await dbClient.end();
  }
}

async function postHandler(request, response) {
  try {
    dbClient = await database.getNewClient();

    const migretedMigrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dbClient,
      dryRun: false,
    });

    if (migretedMigrations.length > 0) {
      return response.status(201).json(migretedMigrations);
    }
    return response.status(200).json(migretedMigrations);
  } finally {
    await dbClient.end();
  }
}
