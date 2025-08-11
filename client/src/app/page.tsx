import { Suspense } from "react";
import BlockExplorer from "./BlockExplorer";
import { getServerConfig } from "./lib/serverConfig";

export default async function Home() {
  const config = await getServerConfig();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BlockExplorer apiUrl={config.apiUrl} />
    </Suspense>
  );
}
