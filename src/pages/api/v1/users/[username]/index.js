import controller from "infra/controller.js";
import user from "models/user";
import { createRouter } from "next-connect";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandler);

async function getHandler(request, response) {
  const { username } = request.query;
  const userFound = await user.findOneByUsername(username);
  return response.status(200).json(userFound);
}
