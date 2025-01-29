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
      const { email, password, id_role } = await ctx.request.body().value; // Extraer los datos del cuerpo de la solicitud
  
      // Validar que todos los campos sean proporcionados
      if (!email || !password || !id_role) {
        ctx.response.status = 400;
        ctx.response.body = {
          message: "Todos los campos son requeridos: email, password, id_role.",
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
  
      // Insertar el nuevo usuario en la base de datos
      const result = await dbClient.execute(
        "INSERT INTO cuenta (correo, contraseña, id_rol, nombre, activated) VALUES (?, ?, ?, ?, ?)",
        [email, hashedPassword, id_role, email, false], // Usamos el correo como nombre por ahora y 'false' para 'activated'
      );
  
      const userId = result.lastInsertId; // Obtener el ID del usuario recién insertado
  
      // Generar un código de validación
      const validationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos
  
      // Almacenar el código en la base de datos
      await dbClient.execute(
        "INSERT INTO codigos_validacion (id_usuario, codigo) VALUES (?, ?)",
        [userId, validationCode]
      );
  
      // Crear una instancia del servicio de correo
      const emailService = new EmailService();
  
      // Enviar el correo de validación
      await emailService.sendValidationEmail(email, validationCode);
  
      ctx.response.status = 201;
      ctx.response.body = { message: "Usuario registrado correctamente. Se ha enviado un correo de validación." };
    } catch (error) {
      console.error("Error en el registro de usuario:", error);
      ctx.response.status = 500;
      ctx.response.body = { message: "Error interno al registrar el usuario." };
    }
  /* ------------------------- PETICIÓN DE PRUEBA
    {
        "email": "exampleæexample.com",
        "password": "123456",
        "id_role": 1
    }
        ----------------------------*/
});

// Endpoint para activar un usuario
Register.post("/register/verify", async (ctx) => {
    try {
      const { userId, code } = await ctx.request.body().value; // Extraer los datos del cuerpo de la solicitud
  
      // Validar que se haya proporcionado el id_usuario y el código
      if (!userId || !code) {
        ctx.response.status = 400;
        ctx.response.body = {
          message: "Se requiere el id_usuario y el código.",
        };
        return;
      }
  
      // Verificar si el código de validación es correcto
      const dbClient = getDBClient();
      const validationRecord = await dbClient.query(
        "SELECT * FROM codigos_validacion WHERE id_usuario = ? AND codigo = ?",
        [userId, code],
      );
  
      if (validationRecord.length === 0) {
        ctx.response.status = 400;
        ctx.response.body = { message: "Código de validación inválido." };
        return;
      }
  
      // Actualizar el estado del usuario a 'activated' = true
      await dbClient.execute(
        "UPDATE cuenta SET activated = ? WHERE id = ?",
        [true, userId]
      );
  
      ctx.response.status = 200;
      ctx.response.body = { message: "Cuenta activada correctamente." };
    } catch (error) {
      console.error("Error en la verificación del código:", error);
      ctx.response.status = 500;
      ctx.response.body = { message: "Error interno al verificar el código." };
    }
    /* ------------------------- PETICIÓN DE PRUEBA
        {
            "userId": 1,
            "code": "123456"
        }
        ----------------------------*/
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
        [id_cuenta]
      );
  
      if (accountExists.length === 0) {
        ctx.response.status = 400;
        ctx.response.body = { message: "La cuenta no existe." };
        return;
      }
  
      // Verificar si la suscripción existe
      const subscriptionExists = await dbClient.query(
        "SELECT 1 FROM suscripciones WHERE id = ?",
        [id_suscripcion]
      );
  
      if (subscriptionExists.length === 0) {
        ctx.response.status = 400;
        ctx.response.body = { message: "La suscripción no existe." };
        return;
      }
  
      // Insertar la suscripción en la tabla cuentas_suscripciones
      await dbClient.execute(
        "INSERT INTO cuentas_suscripciones (id_cuenta, id_suscripcion) VALUES (?, ?)",
        [id_cuenta, id_suscripcion]
      );
  
      ctx.response.status = 201;
      ctx.response.body = { message: "Suscripción registrada correctamente." };
    } catch (error) {
      console.error("Error al registrar la suscripción:", error);
      ctx.response.status = 500;
      ctx.response.body = { message: "Error interno al registrar la suscripción." };
    }
    /* ------------------------- PETICIÓN DE PRUEBA
    {
        "id_cuenta": 1,
        "id_suscripcion": 1
    }
    ----------------------------*/
});

//Endpoint para registrar el nombre del negocio
Register.post("/register/business", async (ctx) => {
    try {
      // Extraer los datos del cuerpo de la solicitud
      const { nombre, id_cuenta } = await ctx.request.body().value;
  
      // Validar que ambos campos sean proporcionados
      if (!nombre || !id_cuenta) {
        ctx.response.status = 400;
        ctx.response.body = {
          message: "Ambos campos son requeridos: nombre, id_cuenta.",
        };
        return;
      }
  
      // Verificar si la cuenta existe
      const dbClient = getDBClient();
      const accountExists = await dbClient.query(
        "SELECT 1 FROM cuenta WHERE id = ?",
        [id_cuenta]
      );
  
      if (accountExists.length === 0) {
        ctx.response.status = 400;
        ctx.response.body = { message: "La cuenta no existe." };
        return;
      }
  
      // Insertar el negocio en la tabla negocio
      await dbClient.execute(
        "INSERT INTO negocio (nombre, id_cuenta) VALUES (?, ?)",
        [nombre, id_cuenta]
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
        "id_cuenta": 1
    }
    ----------------------------*/
});

//Endpoint para agregar sucursales al negocio
Register.post("/register/sucursal", async (ctx) => {
    try {
      // Extraer los datos del cuerpo de la solicitud
      const { nombre, longitude, latitude, id_negocio } = await ctx.request.body().value;
  
      // Validar que todos los campos sean proporcionados
      if (!nombre || !longitude || !latitude || !id_negocio) {
        ctx.response.status = 400;
        ctx.response.body = {
          message: "Todos los campos son requeridos: nombre, longitude, latitude, id_negocio.",
        };
        return;
      }
  
      // Verificar si el negocio (id_negocio) existe
      const dbClient = getDBClient();
      const businessExists = await dbClient.query(
        "SELECT 1 FROM negocio WHERE id = ?",
        [id_negocio]
      );
  
      if (businessExists.length === 0) {
        ctx.response.status = 400;
        ctx.response.body = { message: "El negocio no existe." };
        return;
      }
  
      // Insertar la nueva sucursal en la tabla sucursales
      await dbClient.execute(
        "INSERT INTO sucursales (nombre, longitude, latitude, id_negocio) VALUES (?, ?, ?, ?)",
        [nombre, longitude, latitude, id_negocio]
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


  //Endpoint para agregar usuarios a la sucursal
  
  
  
export default Register;

//Pendientes:
//1.- Revisar por que no llegan los correos de validación a google y borrar el code de prueba de la bd