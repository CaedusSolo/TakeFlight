import chalk from "chalk";
import fs from 'fs-extra'
import path from "path";
import { createSpinner } from "nanospinner";

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
            "DATABASE_URL",
            "PG_HOST",
            "PG_USER",
            "PG_PASSWORD",
            "PG_DATABASE"
        ],
        dependencies: ['pg', '@types/pg --save-dev'],
        templateDir: 'postgresql',
    },
    mongodb: {
        envVars: [
            "MONGODB_URI"
        ],
        dependencies: ['next-auth'],
        templateDir: 'nextauth',
    }
};

export async function setupDB(projectDir: string, provider: DbProvider) {
    if (provider === 'none') return

    const config = DB_PROVIDERS[provider]
    const spinner = createSpinner(`Configuring ${provider} database...`).start()

    try {
        const templatePath = path.join(
            __dirname,
            '..',
            'templates',
            'db',
            `${provider}`
        );

        const targetPath = path.join(projectDir, "src/db")

        await fs.copy(templatePath, targetPath, {
            overwrite: true,
            filter: (src) => !src.includes('node_modules')
        })

        spinner.stop()
    }
    catch (error) {
        spinner.error(chalk.red(`${provider} auth setup failed`));
        console.error(chalk.red(error instanceof Error ? error.message : error));

        await fs.remove(path.join(projectDir, 'src/db'));
    }

}