import { Router } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { getDBClient } from "../../utils/db.ts";
import { hashPassword } from "../../utils/Hash.ts";

const Admin = new Router();

Admin.get("/admin/puestos", async (ctx) => {
  console.log("Obteniendo los puestos...");
  try {
    const dbClient = getDBClient();
    const puestos = await dbClient.query("SELECT * FROM roles");
    //console.log(puestos);
    ctx.response.status = 200;
    ctx.response.body = { puestos };
  } catch (error) {
    console.error("Error al obtener los puestos:", error);
    ctx.response.status = 500;
    ctx.response.body = { message: "Error interno al obtener los puestos." };
  }
});

//----------------------------------------------- Sin registro previo -----------------------------------------------
//Endpoint para registrar el nombre del ususario
Admin.post("/admin/user/name", async (ctx) => {
  try {
    // Extraer los datos del cuerpo de la solicitud
    const {
      nombre,
      token,
      id_admin,
    } = await ctx.request.body().value;

    // Validar que todos los campos sean proporcionados
    if (!nombre || !token || !id_admin) {
      ctx.response.status = 400;
      ctx.response.body = {
        message: "Todos los campos son requeridos: nombre, token, id_admin.",
      };
      return;
    }

    // Insertar el nuevo usuario en la base de datos
    const dbClient = getDBClient();

    ctx.response.status = 201;
    ctx.response.body = { message: "Usuario registrado correctamente." };
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    ctx.response.status = 500;
    ctx.response.body = { message: "Error interno al registrar el usuario." };
  }
  /* ------------------------- PETICIÓN DE PRUEBA
    {
        "nombre": "Javier Gutierrez",
        "token": "",
        "id_admin": 1
    }
    ----------------------------*/
});

//Endpoint para registrar el nombre del negocio
Admin.post("/admin/business", async (ctx) => {
  try {
    // Extraer los datos del cuerpo de la solicitud
    const { nombre, dominio, id_cuenta } = await ctx.request.body().value;

    // Validar que todos los campos sean proporcionados
    if (!nombre || !dominio || !id_cuenta) {
      ctx.response.status = 400;
      ctx.response.body = {
        message: "Todos los campos son requeridos: nombre, dominio, id_cuenta.",
      };
      return;
    }

    // Verificar si la cuenta existe
    const dbClient = getDBClient();
    const accountExists = await dbClient.query(
      "SELECT 1 FROM cuenta WHERE id = ?",
      [id_cuenta],
    );

    if (accountExists.length === 0) {
      ctx.response.status = 400;
      ctx.response.body = { message: "La cuenta no existe." };
      return;
    }

    // Insertar el negocio en la tabla negocio
    await dbClient.execute(
      "INSERT INTO negocio (nombre, dominio, id_cuenta) VALUES (?, ?, ?)",
      [nombre, dominio, id_cuenta],
    );

    ctx.response.status = 201;
    ctx.response.body = { message: "Negocio registrado correctamente." };
  } catch (error) {
    console.error("Error al registrar el negocio:", error);
    ctx.response.status = 500;
    ctx.response.body = { message: "Error interno al registrar el negocio." };
  }
  /* ------------------------- PETICIÓN DE PRUEBA
      {
          "nombre": "Mi Negocio",
          "dominio": "mi-negocio.com",
          "id_cuenta": 1
      }
      ----------------------------*/
});

//Endpoint para agregar sucursales al negocio
Admin.post("/admin/sucursal", async (ctx) => {
  try {
    // Extraer los datos del cuerpo de la solicitud
    const { nombre, longitude, latitude, id_negocio } = await ctx.request.body()
      .value;

    // Validar que todos los campos sean proporcionados
    if (!nombre || !longitude || !latitude || !id_negocio) {
      ctx.response.status = 400;
      ctx.response.body = {
        message:
          "Todos los campos son requeridos: nombre, longitude, latitude, id_negocio.",
      };
      return;
    }

    // Verificar si el negocio (id_negocio) existe
    const dbClient = getDBClient();
    const businessExists = await dbClient.query(
      "SELECT 1 FROM negocio WHERE id = ?",
      [id_negocio],
    );

    if (businessExists.length === 0) {
      ctx.response.status = 400;
      ctx.response.body = { message: "El negocio no existe." };
      return;
    }

    // Insertar la nueva sucursal en la tabla sucursales
    await dbClient.execute(
      "INSERT INTO sucursales (nombre, longitude, latitude, id_negocio) VALUES (?, ?, ?, ?)",
      [nombre, longitude, latitude, id_negocio],
    );

    ctx.response.status = 201;
    ctx.response.body = { message: "Sucursal registrada correctamente." };
  } catch (error) {
    console.error("Error al registrar la sucursal:", error);
    ctx.response.status = 500;
    ctx.response.body = { message: "Error interno al registrar la sucursal." };
  }
  /* ------------------------- PETICIÓN DE PRUEBA
        {
          "nombre": "Sucursal Tortilleria Raúl",
          "longitude": -99.1332,
          "latitude": 19.4326,
          "id_negocio": 1
        }
      ----------------------------*/
});

//Endpoint para agregar usuarios a la sucursal(username@dominio-negocio.com)
// Endpoint para registrar un nuevo usuario y asociarlo a una sucursal y un negocio
Admin.post("/admin/adduser/sucursal/negocio", async (ctx) => {
  try {
    const {
      email,
      password,
      id_role,
      id_sucursal,
      id_negocio,
      nombre,
      id_admin,
    } = await ctx.request.body().value; // Extraer los datos del cuerpo de la solicitud

    // Validar que todos los campos sean proporcionados
    if (
      !email || !password || !id_role || !id_sucursal || !id_negocio ||
      !nombre || !id_admin
    ) {
      ctx.response.status = 400;
      ctx.response.body = {
        message:
          "Todos los campos son requeridos: email, password, id_role, id_sucursal, id_negocio, nombre.",
      };
      return;
    }

    // Verificar si el correo ya está registrado
    const dbClient = getDBClient();
    const existingUser = await dbClient.query(
      "SELECT * FROM cuenta WHERE correo = ?",
      [email],
    );

    if (existingUser.length > 0) {
      ctx.response.status = 400;
      ctx.response.body = { message: "El correo ya está registrado." };
      return;
    }

    // Verificar si la sucursal existe
    const existingSucursal = await dbClient.query(
      "SELECT * FROM sucursales WHERE id = ?",
      [id_sucursal],
    );

    if (existingSucursal.length === 0) {
      ctx.response.status = 400;
      ctx.response.body = { message: "La sucursal no existe." };
      return;
    }

    // Verificar si el negocio existe
    const existingNegocio = await dbClient.query(
      "SELECT * FROM negocio WHERE id = ?",
      [id_negocio],
    );

    if (existingNegocio.length === 0) {
      ctx.response.status = 400;
      ctx.response.body = { message: "El negocio no existe." };
      return;
    }

    // Hashear la contraseña
    const hashedPassword = await hashPassword(password);

    // Insertar el nuevo usuario en la base de datos
    const result = await dbClient.execute(
      "INSERT INTO cuenta (correo, contraseña, id_rol, nombre, activated) VALUES (?, ?, ?, ?, ?)",
      [email, hashedPassword, id_role, nombre, true], // Usamos el correo como nombre por ahora y 'false' para 'activated'
    );

    const userId = result.lastInsertId; // Obtener el ID del usuario recién insertado

    // Insertar la relación entre el usuario, la sucursal y el negocio
    await dbClient.execute(
      "INSERT INTO cuenta_sucursal (id_cuenta, id_sucursal, id_negocio, id_admin) VALUES (?, ?, ?, ?)",
      [userId, id_sucursal, id_negocio, id_admin],
    );

    // No es necesario almacenar el código de validación ni enviar el correo
    // Solo devolvemos un mensaje de éxito
    ctx.response.status = 201;
    ctx.response.body = { message: "Usuario registrado correctamente." };
  } catch (error) {
    console.error("Error en el registro de usuario:", error);
    ctx.response.status = 500;
    ctx.response.body = { message: "Error interno al registrar el usuario." };
  }
  /* ------------------------- PETICIÓN DE PRUEBA
    {
        "email": "luis@onix.com",
        "password": "Javier117",
        "id_role": 3,
        "id_sucursal": 1,
        "id_negocio": 1,
        "nombre": "Javier Gutierrez",
        "id_admin": 7
    }
    ----------------------------*/
});

//Endpoints para primeros pasos
Admin.post("/admin/firststeps", async (ctx) => {
  const data = await ctx.request.body().value;
  console.log(data);
  //obtener el id de la cuenta
  const idCuenta = data.idCuenta;
  //obtener el nombre del usuario
  const nombreUsuario = data.nombre;
  //obtener el nombre del negocio
  const nombreNegocio = data.nombreNegocio;
  //obtener el nombre del dominio
  const nombreDominio = data.nombreDominio;
  //obtener el nombre de la sucursal
  const nombreSucursal = data.nombreSucursal;
  //obtener la latitud
  const latitud = data.latitud;
  //obtener la longitud
  const longitud = data.longitud;
  //obtener el precio publico
  const precio_publico = data.precio_publico;
  //obtener el precio tienda
  const precio_tienda = data.precio_tienda;
  //obtener los productos
  const productos = data.productos;
  //obtener los gastos
  const gastos = data.gastos;
  //obtener los empleados
  const empleados = data.empleados;

  // crear el cliente de la base de datos
  const dbClient = getDBClient();
  try {
    // 1------------------------------------------------------------ Insertar el nombre del usuario en la tabla cuenta
    await dbClient.execute(
      "UPDATE cuenta SET nombre = ? WHERE id = ?",
      [nombreUsuario, idCuenta],
    );

    //2- ----------------------------------------------------------- CREAR EL NEGOCIO
    // Insertar el negocio en la tabla negocio
    const result_id_negocio = await dbClient.execute(
      "INSERT INTO negocio (nombre, dominio, id_cuenta) VALUES (?, ?, ?)",
      [nombreNegocio, nombreDominio, idCuenta],
    );
    //definir el id del negocio
    const id_negocio = result_id_negocio.lastInsertId;

    //3- ----------------------------------------------------------- CREAR LA SUCURSAL
    // Insertar la nueva sucursal en la tabla sucursales
    const result_id_sucursal = await dbClient.execute(
      "INSERT INTO sucursales (nombre, longitude, latitude, id_negocio) VALUES (?, ?, ?, ?)",
      [nombreSucursal, longitud, latitud, id_negocio],
    );
    //definir el id de la sucursal
    const id_sucursal = result_id_sucursal.lastInsertId;
    //insertar la relacion en la tabla cuenta_sucursal
    await dbClient.execute(
      "INSERT INTO cuenta_sucursal (id_cuenta, id_sucursal, id_negocio, id_admin) VALUES (?, ?, ?, ?)",
      [idCuenta, id_sucursal, id_negocio, idCuenta],
    );

    //4- ----------------------------------------------------------- CREAR el precio de la tortilla
    await dbClient.execute(
      "INSERT INTO precio_kilo_tortilla (precio_publico, precio_cliente, id_sucursal) VALUES (?, ?, ?)",
      [precio_publico, precio_tienda, id_sucursal],
    );
    //5- ----------------------------------------------------------- CREAR LOS PRODUCTOS
    //si productos es un arreglo vacio no se ejecuta
    if (productos.length > 0) {

    for (const producto of productos) {
      await dbClient.execute(
        "INSERT INTO productos (nombre, precio, id_sucursal) VALUES (?, ?, ?)",
        [producto.nombre, producto.precio, id_sucursal],
      );
    }
  }
    //6- ----------------------------------------------------------- CREAR LOS GASTOS
    //si gastos es un arreglo vacio no se ejecuta
    if (gastos.length > 0) {
    for (const gasto of gastos) {
      await dbClient.execute(
        "INSERT INTO gastos_personalizados (nombre, tipo_gasto, descripcion, id_negocio, id_cuenta) VALUES (?, ?, ?, ?, ?)",
        [gasto.nombre, gasto.tipo_gasto, gasto.descripcion, id_negocio, idCuenta],
      );
    }
  }
    //7- ----------------------------------------------------------- CREAR LOS EMPLEADOS
    //si empleados es un arreglo vacio no se ejecuta
    if (empleados.length > 0) {
    for (const empleado of empleados) {
      // Hashear la contraseña
      const hashedPassword = await hashPassword(empleado.password);
      // Insertar el nuevo usuario en la base de datos
      const result = await dbClient.execute(
        "INSERT INTO cuenta (correo, contraseña, nombre, activated, id_rol) VALUES (?, ?, ?, ?, ?)",
        [empleado.email, hashedPassword, empleado.name, 1, empleado.puesto_id], // Usamos el correo como nombre por ahora y 'false' para 'activated'
      );
      const userId = result.lastInsertId; // Obtener el ID del usuario recién insertado
      // Insertar la relación entre el usuario, la sucursal y el negocio
      await dbClient.execute(
        "INSERT INTO cuenta_sucursal (id_cuenta, id_sucursal, id_negocio, id_admin) VALUES (?, ?, ?, ?)",
        [userId, id_sucursal, id_negocio, idCuenta],
      );
    }
  }

    //8- ----------------------------------------------------------- Actualuzar el estado de la cuenta en adminconfig

//setear en  1 todos los campos
    await dbClient.execute(
      "UPDATE adminConfig SET negocio = ?, sucursal = ?, precio = ?, productos = ?, gastos = ?, empleados = ? WHERE id_admin = ?", [1, 1, 1, 1, 1, 1, idCuenta],
    );

    //construir un json para responder
    const respuesta = {
      "idCuenta": idCuenta,
      "idNegocio": id_negocio,
      
    }
console.log("finalizo el registro de los primeros pasos");

    ctx.response.status = 200;
    ctx.response.body =  respuesta;
    }
  catch (error) {
    console.error("Error al registrar los primeros pasos:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      message: "Error interno al registrar los primeros pasos.",
    };
  }
});

// enpoitn para  mostrar los puestos
/*
{
  "idCuenta": 1,
  "nombre": "Javier",
  "nombreNegocio": "Valle de leon",
  "nombreDominio": "valledeleon",
  "nombreSucursal": "valle",
  "latitud": 21.1557183,
  "longitud": -101.6690788,
  "precio_publico": 23,
  "precio_tienda": 25,
  "productos": [
    {
      "id": 1739054259199,
      "nombre": "salsa",
      "precio": 23
    }
  ],
  "gastos": [
    {
      "id": 1739054289693,
      "nombre": "gasolina",
      "tipo_gasto": 1,
      "descripcion": "hshhdhd"
    }
  ],
  "empleados": [
    {
      "id": 1739054353774,
      "name": "david",
      "email": "david23@valledeleon.com",
      "password": "a",
      "puesto_id": 2,
      "puesto": "MOLINO"
    }
  ]
}

  */

export default Admin;
