import { Router } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { getDBClient } from "../../utils/db.ts";
import { hashPassword } from "../../utils/Hash.ts";

const Login = new Router();

//Enpoint para loguear un usuario
Login.post("/login", async (ctx) => {
 
});

//Endpoint para obtener info de un usuario empleado(id_account, id_role, id_negocio, id_sucursal, id_user_Admin)
Login.get("/login/empleado/:id_account", async (ctx) => {
  
});

//Endpoint para obtener info de un usuario administador(id_account, id_role, id_negocio)
Login.get("/login/admin/:id_account", async (ctx) => {

});
export default Login;