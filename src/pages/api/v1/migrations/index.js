import { createRouter } from "next-connect";
import controller from "infra/controller";
import migrator from "models/migrator";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandler);

async function getHandler(request, response) {
  const pendingMigrations = await migrator.listPendingMigrations();
  return response.status(200).json(pendingMigrations);
}

async function postHandler(request, response) {
  const migretedMigrations = await migrator.runPendingMigrations();
  if (migretedMigrations.length > 0) {
    return response.status(201).json(migretedMigrations);
  }
  return response.status(200).json(migretedMigrations);
}
