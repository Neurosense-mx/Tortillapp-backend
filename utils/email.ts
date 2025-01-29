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
        subject: "Código de validación",
        html: `<h1>Tu código de validación es: ${code}</h1>`,
      });

      console.log("Correo enviado exitosamente.");
    } catch (error) {
      console.error("Error al enviar el correo:", error);
    } finally {
      await this.client.close();
    }
  }
}
