import controller from "infra/controller.js";
import session from "models/session";
import user from "models/user";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
//router.post(controller.canRequest("read:session"), getHandler);
router.get(getHandler);

export default router.handler(controller.errorHandler);

async function getHandler(request, response) {
	const sessionToken = request.cookies.session_id;

	const sessionObject = await session.findOneValidByToken(sessionToken);

	const renewedSession = await session.renew(sessionObject.id);
	controller.setSessionCookie(renewedSession.token, response);

	const userFound = await user.findOneById(sessionObject.user_id);

	response.setHeader(
		"Cache-Control",
		"no-store, no-cache, max-age=0, must-revalidate",
	);
	return response.status(200).json(userFound);
}
