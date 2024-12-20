import { Router } from "https://deno.land/x/oak@v12.6.0/mod.ts";

const Prueba = new Router();

// POST /login para autenticar un usuario
Prueba.get("/", async (ctx) => {
    ctx.response.body = "Hello World!";
    ctx.response.status = 200;
});

Prueba.post("/Prueba/saludo", async (ctx) => {
//Function para imprimir un saludo
//---------------------- INSTRUCCIONES ----------------------
// Recibe el json
const body = await ctx.request.body(); // Obtiene el cuerpo de la solicitud
const data = await body.value;         // Analiza el cuerpo si es JSON

// Extraer valores específicos
const { name, edad, code} = data;

//-------------------------ejecutas
//imprimir name, edad, code
const saludo = `Hola ${name}, tienes ${edad} años y tu código es ${code}`;
console.log(saludo);

//respondes
ctx.response.body = saludo;
ctx.response.status = 200;
});

Prueba.get("/", async (ctx) => {
ctx.response.body = "Suma";
});

export default Prueba;
