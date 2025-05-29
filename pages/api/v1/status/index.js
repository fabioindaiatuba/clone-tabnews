import { createRouter } from "next-connect";

import database from "infra/database";
import controller from "infra/controller";

const router = createRouter();

router.get(status);

export default router.handler(controller.errorHandler);

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const databaseVersionResult = await database.query("SHOW server_version;");
  const databaseVersionValue = databaseVersionResult.rows[0].server_version;

  const databaseMaxConnectionResult = await database.query(
    "SHOW max_connections;",
  );
  const databaseMaxConnectionValue = Number.parseInt(
    databaseMaxConnectionResult.rows[0].max_connections,
  );

  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenedConnectionResult = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });

  const databaseOpenedConnectionValue =
    databaseOpenedConnectionResult.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        name: process.env.POSTGRES_DB,
        version: databaseVersionValue,
        max_connections: databaseMaxConnectionValue,
        opened_connections: databaseOpenedConnectionValue,
      },
    },
  });
}
