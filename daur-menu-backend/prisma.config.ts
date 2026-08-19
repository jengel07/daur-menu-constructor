import "dotenv/config";
import { defineConfig } from "@prisma/config";
import pkg from "pg";
const { Pool } = pkg;
import { PrismaPg } from "@prisma/adapter-pg";

export default defineConfig({
  datasource: {
    // Для migrate/db push — прямое подключение (порт 5432, минуя PgBouncer)
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    // Для runtime PrismaClient — pooled подключение
    adapter: () => {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      return new PrismaPg(pool);
    },
  },
});