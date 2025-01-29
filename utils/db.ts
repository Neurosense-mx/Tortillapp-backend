import { Client } from "https://deno.land/x/mysql/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

const env = config(); // Carga el archivo .env

// Configurar la conexión una sola vez
const client = await new Client().connect({
  hostname: env.DB_SERVER,
  username: env.DB_USER,
  db: env.DB_NAME,
  password: env.DB_PASSWORD,
  port: parseInt(env.DB_PORT),
});

console.log("✅ Base de datos conectada");

// Función para obtener la conexión
export function getDBClient() {
  return client;
}
