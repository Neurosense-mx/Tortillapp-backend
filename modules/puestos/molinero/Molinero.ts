import { Router } from "https://deno.land/x/oak@v12.6.0/mod.ts";

const Molinero = new Router();

// POST /login para autenticar un usuario
Molinero.get("/", async (ctx) => {
    ctx.response.body = "Hello World!";
    ctx.response.status = 200;
});
export default Molinero;
