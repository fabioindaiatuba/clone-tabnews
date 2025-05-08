const { exec } = require("node:child_process");

function checkPostgres() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  function handleReturn(error, stdout) {
    if (!stdout.includes("accepting connections")) {
      process.stdout.write(".");
      checkPostgres();
      return;
    }

    console.log("\n🟢 Postgres está pronto e aceitando conexões!\n");
    return;
  }
}

process.stdout.write("\n\n🟡 Aguardando Postgres aceitar conexões ");
checkPostgres();
