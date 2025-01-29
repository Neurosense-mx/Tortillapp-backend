
import Molinero from "./modules/puestos/molinero/Molinero.ts";
import { Application } from "https://deno.land/x/oak@v12.6.0/mod.ts"; // Framework Oak para servidores HTTP
import Prueba from "./modules/test/test.ts"; // Importar rutas del módulo Prueba
import { oakCors } from "https://deno.land/x/cors/mod.ts"; // Middleware de CORS
import { dbConnectionMiddleware } from "./utils/Middleware.ts"; // Middleware de conexión a la DB


//-----------------------------------------------------------------------------------IMPORTS DE LOS MÓDULOS A USAR
import Register from "./modules/Register/Register.ts";
import Login from "./modules/Login/Login.ts";

// Crear la aplicación
const app = new Application();

// Middleware CORS para permitir peticiones desde cualquier origen
app.use(
  oakCors({
    origin: "*", // Puedes restringir a ciertos dominios aquí si lo prefieres
    methods: ["GET", "POST", "PUT", "DELETE"], // Métodos permitidos
    allowedHeaders: ["Content-Type", "Authorization"], // Encabezados permitidos
    optionsSuccessStatus: 200, // Para navegadores antiguos
  })
);

// Middleware para establecer la conexión a la base de datos
app.use(dbConnectionMiddleware);

// Usar las rutas del módulo Prueba
app.use(Prueba.routes());
app.use(Prueba.allowedMethods());

//---------------------------------------- Usar las rutas de configuración (molinero.ts)
app.use(Molinero.routes());
app.use(Molinero.allowedMethods());
//-----------------------------------------------------------------------------------  ENDPOINTS DE LOS MÓDULOS A USAR
app.use(Register.routes());
app.use(Register.allowedMethods());
//login
app.use(Login.routes());
app.use(Login.allowedMethods());




// Iniciar el servidor en el puerto 8000
try {
  console.log("🚀 Servidor corriendo en http://localhost:8000");
  await app.listen({ port: 8000 });
} catch (err) {
  console.error("❌ Error al iniciar el servidor:", err);
}
