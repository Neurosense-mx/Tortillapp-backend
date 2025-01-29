import { getDBClient } from "./db.ts";

const dbConnectionMiddleware = async (ctx: any, next: Function) => {
  ctx.state.dbClient = getDBClient();
  await next();
};

export { dbConnectionMiddleware };
