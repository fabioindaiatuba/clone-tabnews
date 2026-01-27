import { NotFoundError, UnauthorizedError } from "infra/errors";
import password from "./password";
import user from "./user";

async function getAuthenticatedUser(providerEmail, providerPassword) {
  try {
    const storedUser = await findUserByEmail(providerEmail);
    await validatePassword(providerPassword, storedUser.password);
    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
      });
    }

    throw error;
  }

  async function findUserByEmail(providerEmail) {
    let storedUser;
    try {
      storedUser = await user.findOneByEmail(providerEmail);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "Email não confere.",
          action: "Verifique se este dados esta correto.",
        });
      }

      throw error;
    }
    return storedUser;
  }

  async function validatePassword(providerPassword, storedPassword) {
    const correctPasswordMatch = await password.compare(
      providerPassword,
      storedPassword,
    );

    if (!correctPasswordMatch) {
      throw new UnauthorizedError({
        message: "Senha não confere.",
        action: "Verifique se este dados esta correto.",
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
