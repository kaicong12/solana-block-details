export async function getServerConfig() {
  return {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  };
}
