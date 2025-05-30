import Link from "next/link";

function Home() {
  return (
    <>
      <h1>Novo projeto teste.</h1>
      <h3>
        <Link href="/api/v1/status">{" => STATUS <="}</Link>
      </h3>
    </>
  );
}

export default Home;
