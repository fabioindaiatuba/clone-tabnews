import database from "infra/database";
import email from "infra/email";
import { ForbiddenError, NotFoundError } from "infra/errors";
import webserver from "infra/webserver";
import user from "./user";
import authorization from "./authorization";

const EXPIRATION_IN_MILLISECONDS = 15 * 60 * 1000; // 15 minutes

async function findOneValidById(activationToken) {
	const activationTokenFound = await runSelectQuery(activationToken);
	return activationTokenFound;

	async function runSelectQuery(sessionToken) {
		const results = await database.query({
			text: `
        SELECT
          *
        FROM
          user_activation_tokens
        WHERE 
          id = $1
          AND expires_at > NOW()
          AND used_at IS NULL
        LIMIT 
          1
      ;`,
			values: [sessionToken],
		});
		if (results.rowCount === 0) {
			throw new NotFoundError({
				message:
					"O token de ativação utilizado não foi encontrado no sistema ou expirou.",
				action: "Faça um novo cadastro.",
			});
		}

		return results.rows[0];
	}
}

async function create(userId) {
	const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
	const newToken = await runInsertQuery(userId, expiresAt);
	return newToken;

	async function runInsertQuery(userId, expiresAt) {
		const results = await database.query({
			text: `
      INSERT INTO 
        user_activation_tokens (user_id, expires_at) 
      VALUES 
        ($1, $2)
      RETURNING
        *
      ;`,
			values: [userId, expiresAt],
		});

		return results.rows[0];
	}
}

async function activateUserByUserId(userId) {
	// const userToActivate = await user.findOneById(userId);

	// if (!authorization.can(userToActivate, "read:activation_token")) {
	// 	throw new ForbiddenError({
	// 		message: "Você não pode mais utilizar tokens de ativação.",
	// 		action: "Entre em contato com o suporte.",
	// 	});
	// }

	const activatedUser = await user.setFeatures(userId, [
		"create:session",
		"read:session",
	]);
	return activatedUser;
}

async function markTokenAsUsed(activationToken) {
	const userActivationToken = await runUpdateQuery(activationToken.id);
	await user.setFeatures(activationToken.user_id, ["create:session"]);
	return userActivationToken;

	async function runUpdateQuery(activationTokenId) {
		const results = await database.query({
			text: `
      UPDATE
        user_activation_tokens 
      SET
        used_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
      WHERE 
        id = $1
      RETURNING
        *
      ;`,
			values: [activationTokenId],
		});

		return results.rows[0];
	}
}

async function sendEmailToUser(user, activationToken) {
	await email.send({
		from: "Contato - TabNewsClone <contato@curso.dev>",
		to: user.email,
		subject: "Ative seu cadastro no TabNewsClone!",
		text: `${user.username}, clique no link abaixo para ativar seu cadastro no TabNewsClone:
    
${webserver.origin}/cadastro/ativar/${activationToken.id}

Atenciosamente

Equipe TabNewsClone
    `,
	});
}

const activation = {
	findOneValidById,
	create,
	markTokenAsUsed,
	activateUserByUserId,
	sendEmailToUser,
};

export default activation;
