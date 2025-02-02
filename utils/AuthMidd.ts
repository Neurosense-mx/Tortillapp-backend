import { Payload, verify } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";

const encoder = new TextEncoder();
const env = config(); // Carga el archivo .env

const JWT_SECRET_ENCODE = await crypto.subtle.importKey(
  "raw",
  encoder.encode(env.JWT_SECRET), // Reemplaza con una clave segura en producción
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"]
);

async function authMiddleware(ctx: { request: { headers: any; }; response: { status: number; body: { error: string; }; }; state: { user: Payload; }; }, next: () => any) {
  const headers = ctx.request.headers;
  const authHeader = headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Acceso no autorizado." };
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = await verify(token, JWT_SECRET_ENCODE);
    ctx.state.user = payload; // Guardar datos del usuario en `ctx.state`
    await next();
  } catch (error) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Token inválido o expirado." };
  }
}

export { authMiddleware };
