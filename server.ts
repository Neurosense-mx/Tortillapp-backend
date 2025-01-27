// deno-lint-ignore-file
import { Application } from "https://deno.land/x/oak@v12.6.0/mod.ts"; // Importar la clase Application, para crear el server
import Prueba from "./modules/test/test.ts"; // Importar las rutas de configuración del modulo example
import Prueba2 from "./modules/test/Test2.ts"; // Importar las rutas de configuración del modulo example
import { oakCors } from "https://deno.land/x/cors/mod.ts"; // Importar el middleware de cors para permitir peticiones desde cualquier origen
import Molinero from "./modules/puestos/molinero/Molinero.ts";
// Crear la aplicación
const app = new Application();

//cors
app.use(
  oakCors({
    origin: "*", // Puedes restringir a ciertos dominios aquí si lo prefieres
    methods: ["GET", "POST", "PUT", "DELETE"], // Métodos permitidos
    allowedHeaders: ["Content-Type", "Authorization"], // Encabezados permitidos
    optionsSuccessStatus: 200, // Para navegadores antiguos
  })
);

// --------------------------------------- Usar las rutas de configuración (config-axiom.ts)
app.use(Prueba.routes());
app.use(Prueba.allowedMethods());

//---------------------------------------- Usar las rutas de configuración (test2.ts)
app.use(Prueba2.routes());
app.use(Prueba2.allowedMethods());

//---------------------------------------- Usar las rutas de configuración (molinero.ts)
app.use(Molinero.routes());
app.use(Molinero.allowedMethods());

// Iniciar el servidor
await app.listen({ port: 8000 }).catch((err) => {
  console.error("Error al iniciar el servidor", err);
});
