import { Router } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { getDBClient } from "../../utils/db.ts";
import { hashPassword } from "../../utils/Hash.ts";
import { EmailService } from "../../utils/email.ts";

const Register = new Router();

//Edpoint para validar si un correo ya está registrado
Register.post("/register/validateEmail", async (ctx) => {
  try {
    const { correo } = await ctx.request.body({ type: "json" }).value;
    if (!correo) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Correo es requerido" };
      return;
    }

    const client = getDBClient();
    const result = await client.query(
      `SELECT id FROM cuenta WHERE correo = ?`,
      [correo],
    );

    ctx.response.status = 200;
    ctx.response.body = { exists: result.length > 0 };
  } catch (error) {
    console.error("Error al validar email:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Error interno del servidor" };
  }
  /* ------------------------- PETICIÓN DE PRUEBA
{
    "correo": "usuario@example.com"
}
----------------------------*/
});

// Endpoint para registrar un nuevo usuario
Register.post("/register/adduser", async (ctx) => {
  try {
    const { email, password, id_suscripcion } = await ctx.request.body().value; // Extraer también el nombre

    // Validar que todos los campos sean proporcionados
    if (!email || !password || !id_suscripcion) {
      ctx.response.status = 400;
      ctx.response.body = {
        message:
          "Todos los campos son requeridos: email, password, id_role, nombre.",
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

    // Hashear la contraseña
    const hashedPassword = await hashPassword(password);

    // Insertar el nuevo usuario en la base de datos con el nombre correcto
    const result = await dbClient.execute(
      "INSERT INTO cuenta (correo, contraseña, id_rol, nombre, activated) VALUES (?, ?, ?, ?, ?)",
      [email, hashedPassword, 1, "", true], // Aquí se usa 'nombre' en lugar de 'email'
    );

    const id_cuenta = result.lastInsertId; // Obtener el ID del usuario recién insertado
    //crear la relacion del usuario con la suscripcion
    // Verificar si la cuenta existe
    const accountExists = await dbClient.query(
      "SELECT 1 FROM cuenta WHERE id = ?",
      [id_cuenta],
    );

    if (accountExists.length === 0) {
      ctx.response.status = 400;
      ctx.response.body = { message: "La cuenta no existe." };
      return;
    }

    // Verificar si la suscripción existe
    const subscriptionExists = await dbClient.query(
      "SELECT 1 FROM suscripciones WHERE id = ?",
      [id_suscripcion],
    );

    if (subscriptionExists.length === 0) {
      ctx.response.status = 400;
      ctx.response.body = { message: "La suscripción no existe." };
      return;
    }

    // Insertar la suscripción en la tabla cuentas_suscripciones
    await dbClient.execute(
      "INSERT INTO cuentas_suscripciones (id_cuenta, id_suscripcion) VALUES (?, ?)",
      [id_cuenta, id_suscripcion],
    );

    ctx.response.status = 200;
    ctx.response.body = {
      message:
        "Usuario registrado correctamente. Bienvenido a Tortillapp.",
    };
  } catch (error) {
    console.error("Error en el registro de usuario:", error);
    ctx.response.status = 500;
    ctx.response.body = { message: "Error interno al registrar el usuario." };
  }
  /* ------------------------- PETICIÓN DE PRUEBA
{
    "email": "replacedspace17@gmail.com",
    "password": "Javier117",
    "id_suscripcion": 1,
}----------------------------*/
});



Register.post("/register/sendCode/:email", async (ctx) => {
  // obtener el email del usuario
  const { email } = ctx.params;
  const validationCode = Math.floor(1000 + Math.random() * 9000)
    .toString(); // Código de 4 dígitos

  // Crear una instancia del servicio de correo
  const emailService = new EmailService();

  // Enviar el correo de validación
  await emailService.sendValidationEmail(email, validationCode);
  console.log("Código de validación:", validationCode); 
  //contestar al cliente con el código de validación y un 200
  ctx.response.status = 200;
  ctx.response.body = { code: validationCode };

});


//Endpoint para obtener las suscripciones de un usuario
Register.get("/register/getSubscriptions", async (ctx) => {
  try {
    const client = getDBClient();
    const result = await client.query(
      `SELECT * FROM suscripciones WHERE estado = TRUE;`,
    );
    ctx.response.status = 200;
    ctx.response.body = { suscripciones: result };
  } catch (error) {
    console.error("Error al obtener suscripciones:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Error interno del servidor" };
  }
});

//Registrar suscripcion de la cuenta
Register.post("/register/subscription/add", async (ctx) => {
  try {
    // Extraer los datos del cuerpo de la solicitud
    const { id_cuenta, id_suscripcion } = await ctx.request.body().value;

    // Validar que ambos campos sean proporcionados
    if (!id_cuenta || !id_suscripcion) {
      ctx.response.status = 400;
      ctx.response.body = {
        message: "Ambos campos son requeridos: id_cuenta, id_suscripcion.",
      };
      return;
    }

    // Verificar que la cuenta y la suscripción existan
    const dbClient = getDBClient();

    // Verificar si la cuenta existe
    const accountExists = await dbClient.query(
      "SELECT 1 FROM cuenta WHERE id = ?",
      [id_cuenta],
    );

    if (accountExists.length === 0) {
      ctx.response.status = 400;
      ctx.response.body = { message: "La cuenta no existe." };
      return;
    }

    // Verificar si la suscripción existe
    const subscriptionExists = await dbClient.query(
      "SELECT 1 FROM suscripciones WHERE id = ?",
      [id_suscripcion],
    );

    if (subscriptionExists.length === 0) {
      ctx.response.status = 400;
      ctx.response.body = { message: "La suscripción no existe." };
      return;
    }

    // Insertar la suscripción en la tabla cuentas_suscripciones
    await dbClient.execute(
      "INSERT INTO cuentas_suscripciones (id_cuenta, id_suscripcion) VALUES (?, ?)",
      [id_cuenta, id_suscripcion],
    );

    ctx.response.status = 201;
    ctx.response.body = { message: "Suscripción registrada correctamente." };
  } catch (error) {
    console.error("Error al registrar la suscripción:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      message: "Error interno al registrar la suscripción.",
    };
  }
  /* ------------------------- PETICIÓN DE PRUEBA
    {
        "id_cuenta": 1,
        "id_suscripcion": 1
    }
    ----------------------------*/
});

///////////////////////////// mover a Admin
//Endpoint para registrar el nombre del negocio
Register.post("/register/business", async (ctx) => {
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
Register.post("/register/sucursal", async (ctx) => {
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
Register.post("/register/adduser/sucursal/negocio", async (ctx) => {
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

export default Register;

//Pendientes:
//1.- Revisar por que no llegan los correos de validación a google y borrar el code de prueba de la bd
