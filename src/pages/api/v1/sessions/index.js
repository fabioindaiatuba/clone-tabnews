import * as cookie from "cookie";
import controller from "infra/controller.js";
import authentication from "models/authentication";
import session from "models/session";
import { createRouter } from "next-connect";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandler);

async function postHandler(request, response) {
  const userInputValues = request.body;

  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );

  const newSession = await session.create(authenticatedUser.id);

  const setCookie = cookie.serialize("session_id", newSession.token, {
    path: "/", // Caminho nde o cookie ficara disponivel
    // no navegador / seria en todo o nosso site
    // expires: new Date(newSession.expires_at), // Data de expiracao mas nao usado pois usa o MaxAge
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000, // mas em caso de data errada no navegador
    // usa o max-age para em segundos a partir da data do navegador
    secure: process.env.NODE_ENV === "production", // Grava o cookie porem o retorno so é feito se for https quando true
    httpOnly: true, // Fica acessivel somente no navegador em comando javascript nao funciona.
  });
  response.setHeader("Set-Cookie", setCookie);

  return response.status(201).json(newSession);
}
