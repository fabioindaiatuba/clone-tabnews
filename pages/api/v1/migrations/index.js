import database from "infra/database";
import migrationRunner from 'node-pg-migrate';
import { join } from 'node:path';

export default async function migrations(request, response) {
  const allowedMethods = [ "GET", "POST"];
  if(!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      error: `Method ${request.method} not alloewd`,
    });
  }

  let dbClient;
  try {
    dbClient = await database.getNewClient();
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
      return response.status(200).json(pendingMigrations);
    }
    
    if(request.method === 'POST') {
      const migretedMigrations = await migrationRunner({
        ...defaultMigrationsOptions,
        dryRun: false
      })
      if(migretedMigrations.length > 0){
        return response.status(201).json(migretedMigrations);
      }
      return response.status(200).json(migretedMigrations);
    }
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    await dbClient.end();
  }
  
}

