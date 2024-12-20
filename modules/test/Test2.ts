import { Router } from "https://deno.land/x/oak@v12.6.0/mod.ts";

const Prueba2 = new Router();

// function flecha para sumar dos números
const suma = (a: number, b: number) => {
    return a + b;
};

// POST /login para autenticar un usuario
Prueba2.post("/Prueba2/test", async (ctx) => {
    const body = await ctx.request.body(); // Obtiene el cuerpo de la solicitud
    const data = await body.value;   
    const { num1, num2 } = data;
    const resultado = suma(num1, num2);
    ctx.response.body = "La suma de " + num1 + " + " + num2 + " es: " + resultado;
    ctx.response.status = 200;
});


export default Prueba2;
