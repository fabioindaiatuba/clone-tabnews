import * as cookie from "cookie";
import session from "models/session";
import {
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "./errors";

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(error, request, response) {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof UnauthorizedError
  ) {
    return response.status(error.statusCode).json(error);
  }

  const publicErrorObject = new InternalServerError({
    cause: error,
  });
  console.error(publicErrorObject);
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function setSessionCookie(sessionToken, response) {
  const setCookie = cookie.serialize("session_id", sessionToken, {
    path: "/", // Caminho nde o cookie ficara disponivel
    // no navegador / seria en todo o nosso site
    // expires: new Date(newSession.expires_at), // Data de expiracao mas nao usado pois usa o MaxAge
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000, // mas em caso de data errada no navegador
    // usa o max-age para em segundos a partir da data do navegador
    secure: process.env.NODE_ENV === "production", // Grava o cookie porem o retorno so é feito se for https quando true
    httpOnly: true, // Fica acessivel somente no navegador em comando javascript nao funciona.
  });
  response.setHeader("Set-Cookie", setCookie);
}

const controller = {
  errorHandler: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
  setSessionCookie,
};

export default controller;
