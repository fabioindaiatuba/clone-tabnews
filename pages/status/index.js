import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <h1>Database</h1>
      <DatabaseStatus />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });
  let updatedAtText = "Carregando...";
  if (!isLoading && data) {
    console.log(data);
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }

  return <div>Ultima atualização: {updatedAtText}</div>;
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });
  let databaseStatus = "Carregando...";
  if (!isLoading && data) {
    console.log(data);
    databaseStatus = data.dependencies.database;
  }
  return (
    <>
      <div>Versão: {databaseStatus.version}</div>
      <div>Conexões abertas: {databaseStatus.opened_connections}</div>
      <div>Conexões máximas: {databaseStatus.max_connections}</div>
    </>
  );
}
