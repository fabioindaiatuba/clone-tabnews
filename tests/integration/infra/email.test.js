const { default: email } = require("infra/email");
const { default: orchestrator } = require("../../orchestrator");

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();
    await email.send({
      from: "CloneTabNews <teste@curso.dev>",
      to: "EmailDestinatario <detinatario@curso.dev>",
      subject: "Assunto do email teste",
      text: "Teste de corpo do email de teste.",
      //html: "<h1>Teste</h1>"
    });

    await email.send({
      from: "CloneTabNews <remetente@curso.dev>",
      to: "EmailDestinatario <detinatario@curso.dev>",
      subject: "Último email enviado",
      text: "Corpo do último email enviado.",
    });

    const lastEmail = await orchestrator.getLastEmail();
    expect(lastEmail.sender).toBe("<remetente@curso.dev>");
    expect(lastEmail.recipients[0]).toBe("<detinatario@curso.dev>");
    expect(lastEmail.subject).toBe("Último email enviado");
    expect(lastEmail.text).toBe("Corpo do último email enviado.\r\n");
  });
});
