// Explicit DEVELOPMENT-only import. No DDL, no deletion, no logged record values.
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { importLocalRecord, closeStorage } from "../netlify/lib/postgres-store.mts";

if (process.argv[2] !== "--development" || process.env.REPLIT_DEPLOYMENT === "1") {
  throw new Error("Run this only against the development database with --development.");
}
let imported = 0;
try {
  for (const name of ["council-auth", "council-usage", "council-stats"]) {
    const store = createHash("sha256").update(name).digest("hex");
    const directory = new URL(`../.data/${store}/`, import.meta.url);
    const keys = await readdir(directory).catch(error => {
      if (error.code === "ENOENT") return [];
      throw error;
    });
    for (const key of keys) {
      if (!/^[a-f0-9]{64}$/.test(key)) continue;
      const value = await readFile(new URL(key, directory), "utf8");
      imported += (await importLocalRecord(store, key, value)).rowCount;
    }
  }
  console.log(`Imported ${imported} local records; existing database records and files were preserved.`);
} finally { await closeStorage(); }