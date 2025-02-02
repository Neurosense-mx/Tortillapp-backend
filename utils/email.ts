import { SMTPClient } from "https://deno.land/x/denomailer/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

const env = config();

export class EmailService {
  private client: SMTPClient;
  
  constructor() {
    this.client = new SMTPClient({
      connection: {
        hostname: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT),
        tls: env.SMTP_TLS === "true", // Convertir a booleano
        auth: {
          username: env.SMTP_USERNAME,
          password: env.SMTP_PASSWORD,
        },
      },
    });
  }
  
  async sendValidationEmail(to: string, code: string) {
    try {
      await this.client.send({
        from: env.SMTP_USERNAME,
        to: to,
        subject: "Tortillapp - Código de validación",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background-color: #F1F1F3; padding: 20px; border-radius: 10px; text-align: center; border: 1px solid #ddd;">
            <div style="background-color: #1B374D; padding: 15px; border-radius: 10px 10px 0 0;">
              <h1 style="color: #ffffff; margin: 0;">Bienvenido a Tortillapp</h1>
            </div>
            <div style="padding: 20px;">
              <p style="font-size: 18px; color: #333;">Tu código de validación es:</p>
              <p style="font-size: 28px; font-weight: bold; color: #1B374D; background: #ffffff; padding: 15px 20px; border-radius: 5px; display: inline-block; box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);">${code}</p>
              <p style="font-size: 16px; color: #555; margin-top: 10px;">Por favor, ingresa este código en la aplicación para completar tu registro.</p>
              <a href="#" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background-color: #1B374D; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Verificar cuenta en la app</a>
            </div>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 14px; color: #777;">Si no solicitaste este código, ignora este mensaje.</p>
            <p style="font-size: 14px; color: #777;">&copy; 2024 Tortillapp. Todos los derechos reservados.</p>
          </div>
        `,
      });
  
      console.log("Correo enviado exitosamente.");
    } catch (error) {
      console.error("Error al enviar el correo:", error);
    } finally {
      await this.client.close();
    }
  }
  

  async testEmail(destinatario: string) {
    try {
      await this.client.send({
        from: env.SMTP_USERNAME,
        to: destinatario,
        subject: "Tortillapp - Código de validación",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background-color: #F1F1F3; padding: 20px; border-radius: 10px; text-align: center; border: 1px solid #ddd;">
            <div style="background-color: #1B374D; padding: 15px; border-radius: 10px 10px 0 0;">
              <h1 style="color: #ffffff; margin: 0;">Bienvenido a Tortillapp</h1>
            </div>
            <div style="padding: 20px;">
              <p style="font-size: 18px; color: #333;">Tu código de validación es:</p>
              <p style="font-size: 28px; font-weight: bold; color: #1B374D; background: #ffffff; padding: 15px 20px; border-radius: 5px; display: inline-block; box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);">1903</p>
              <p style="font-size: 16px; color: #555; margin-top: 10px;">Por favor, usa este código para completar tu registro.</p>
              <a href="#" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background-color: #1B374D; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Verificar cuenta en la app</a>
            </div>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 14px; color: #777;">Si no solicitaste este código, ignora este mensaje.</p>
            <p style="font-size: 14px; color: #777;">&copy; 2024 Tortillapp. Todos los derechos reservados.</p>
          </div>
        `,
      });
  
      console.log("Correo de prueba enviado exitosamente.");
    } catch (error) {
      console.error("Error al enviar el correo de prueba:", error);
    } finally {
      await this.client.close();
    }
  }
  
  
}
