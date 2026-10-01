function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable ${name}. Copy .env.example to .env and set it.`);
  }
  return value;
}

export const env = {
  baseUrl: process.env.BOOKER_BASE_URL?.trim() || "https://restful-booker.herokuapp.com",
  username: requiredEnv("BOOKER_USERNAME"),
  password: requiredEnv("BOOKER_PASSWORD"),
};