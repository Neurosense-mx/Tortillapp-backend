const client = await new Client().connect({
  hostname: Deno.env.get("DB_SERVER") || "localhost",
  username: Deno.env.get("DB_USER") || "tortillappdb",
  db: Deno.env.get("DB_NAME") || "tortillapp_db",
  password: Deno.env.get("DB_PASSWORD") || "Javier117",
  port: parseInt(Deno.env.get("DB_PORT") || "3306"),
});