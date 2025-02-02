import { Router } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { getDBClient } from "../../utils/db.ts";
import { hashPassword,comparePassword } from "../../utils/Hash.ts";
import { create } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import { encoder } from "https://deno.land/x/djwt@v3.0.2/util.ts";
import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";

const Login = new Router();
const env = config(); // Carga el archivo .env

const JWT_SECRET_ENCODE = await crypto.subtle.importKey(
    "raw",
    encoder.encode(env.JWT_SECRET), // Reemplaza con una clave segura en producción
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  
//Enpoint para loguear un usuario
Login.post("/login", async (ctx) => {
    try {
      const { email, password } = await ctx.request.body().value;
  
      if (!email || !password) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Faltan campos obligatorios." };
        return;
      }
  
      const db = getDBClient();
      const user = await db.query(
        "SELECT id, correo, contraseña, nombre, id_rol, activated FROM cuenta WHERE correo = ?",
        [email]
      );
  
      if (user.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Correo no registrado." };
        return;
      }
  
      const { id, contraseña: passwordHashed, nombre, id_rol, activated } = user[0];
  
      if (!activated) {
        ctx.response.status = 403;
        ctx.response.body = { error: "Cuenta no activada." };
        return;
      }
  
      const isValidPassword = await comparePassword(password, passwordHashed);
      if (!isValidPassword) {
        ctx.response.status = 401;
        ctx.response.body = { error: "Credenciales incorrectas." };
        return;
      }
  
      // 🔹 Generar token JWT
      const payload = {
        id,
        email,
        nombre,
        id_rol,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // Expira en 1 día
      };
  
      const token = await create({ alg: "HS256", typ: "JWT" }, payload, JWT_SECRET_ENCODE);
  
      ctx.response.status = 200;
      ctx.response.body = {
        token,
        user: { id, email, nombre, id_rol },
      };
    } catch (error) {
      console.error("Error en login:", error);
      ctx.response.status = 500;
      ctx.response.body = { error: "Error en el servidor." };
    }
    /**
     {
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsImVtYWlsIjoidGVzdEBuZXVyb3NlbnNlLm14Iiwibm9tYnJlIjoiIiwiaWRfcm9sIjoxLCJleHAiOjE3Mzg2MTkzMTR9.BhrKBGKgIJ9g8W_BDW-IKEQyzsUgnGoOaXyCMzXIHFU",
  "user": {
    "id": 12,
    "email": "test@neurosense.mx",
    "nombre": "",
    "id_rol": 1
  }
}

{
  "error": "Credenciales incorrectas."
}
     */
  });

//Endpoint para obtener info de un usuario empleado(id_account, id_role, id_negocio, id_sucursal, id_user_Admin)
Login.get("/login/empleado/:id_account", async (ctx) => {
  
});

//Endpoint para obtener info de un usuario administador(id_account, id_role, id_negocio)
Login.get("/login/admin/:id_account", async (ctx) => {

});
export default Login;