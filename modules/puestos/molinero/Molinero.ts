import { Router } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { getDBClient } from "../../../utils/db.ts";

const Molinero = new Router();

// POST /login para autenticar un usuario
Molinero.get("/molinero", async (ctx) => {
    ctx.response.body = "Hello World!";
    ctx.response.status = 200;
});

Molinero.post("/molinero/cocer", async (ctx) => {
 
    const { name } = await ctx.request.body().value;
    console.log('Nombre: '+name);
    

    //contestart conm un 200
    ctx.response.status =200;
});




export default Molinero;
