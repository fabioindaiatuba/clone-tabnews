import database from "infra/database";
import migrationRunner from 'node-pg-migrate';
import { join } from 'node:path';

export default async function migrations(request, response) {
  const dbClient = await database.getNewClient();
  
  const defaultMigrationsOptions = {
    dbClient: dbClient,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations"
  };

  if(request.method === 'GET') {
    const pendingMigrations = await migrationRunner(defaultMigrationsOptions)
    await dbClient.end();
    return response.status(200).json(pendingMigrations);
  }
  
  if(request.method === 'POST') {
    const migretedMigrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dryRun: false
    })
    await dbClient.end();
    if(migretedMigrations.length > 0){
      return response.status(201).json(migretedMigrations);
    }
    return response.status(200).json(migretedMigrations);
  }
  return response.status(405).end()
}

