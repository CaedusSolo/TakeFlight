import chalk from "chalk";
import fs from 'fs-extra'
import path from "path";

export type DbProvider = "sqlite" | "postgresql" | "mongodb" | "none"

export interface DbConfig {
    envVars: string[];
    dependencies: string[];
    templateDir: string;
}

export const DB_PROVIDERS: Record<Exclude<DbProvider, 'none'>, DbConfig> = {
    sqlite: {
        envVars: [
            "SQLITE_DB_PATH"
        ],
        dependencies: ['better-sqlite3'],
        templateDir: 'sqlite',
    },
    postgresql: {
        envVars: [
            "DATABASE_URL", "PG_HOST", "PG_USER", "PG_PASSWORD", "PG_DATABASE"
        ],
        dependencies: ['pg', '@types/pg --save-dev'],
        templateDir: 'postgresql',
    },
    mongodb: {
        envVars: [
            'NEXTAUTH_SECRET',
            'NEXTAUTH_URL',
            'GITHUB_CLIENT_ID',
            'GITHUB_CLIENT_SECRET'
        ],
        dependencies: ['next-auth'],
        templateDir: 'nextauth',
    }
};

export async function setupDB() {

}