import controller from "infra/controller.js";
import activation from "models/activation";
import { createRouter } from "next-connect";

const router = createRouter();

router.patch(patchHandler);

export default router.handler(controller.errorHandler);

async function patchHandler(request, response) {
  const { activationTokenId } = request.query;
  const usedValidToken = await activation.findOneValidById(activationTokenId);
  const usedActivationToken = await activation.markTokenAsUsed(usedValidToken);

  return response.status(200).json(usedActivationToken);
}
