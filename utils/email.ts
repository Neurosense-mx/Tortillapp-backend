import { SMTPClient } from "https://deno.land/x/denomailer/mod.ts";

export class EmailService {
  private client: SMTPClient;
  
  constructor() {
    this.client = new SMTPClient({
      connection: {
        hostname: "smtp.hostinger.com", // SMTP de Hostinger
        port: 465, // Puerto para SSL
        tls: true, // Habilitar SSL/TLS
        auth: {
          username: "tortillapp@neurosense.mx", // Tu correo de Hostinger
          password: "L4^ttKu&on", // Tu contraseña o token de app
        },
      },
    });
  }

  // Método para enviar el correo de validación
  async sendValidationEmail(to: string, code: string) {
    try {
      await this.client.send({
        from: "tortillapp@neurosense.mx", // Tu correo de Hostinger
        to: to, // Correo del usuario al que enviarás el código
        subject: "Código de validación", // Asunto del correo
        html: `<h1>Tu código de validación es: ${code}</h1>`, // Cuerpo del correo en HTML
      });

      console.log("Correo enviado exitosamente.");
    } catch (error) {
      console.error("Error al enviar el correo:", error);
    } finally {
      await this.client.close(); // Cerrar la conexión SMTP
    }
  }
}
