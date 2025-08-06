import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'

export type AuthProvider = 'supabase' | 'firebase' | 'none';

export interface AuthConfig {
    envVars: string[];
    dependencies: string[];
    templateDir: string;
}

export const AUTH_PROVIDERS: Record<Exclude<AuthProvider, 'none'>, AuthConfig> = {
    supabase: {
        envVars: ['SUPABASE_URL', 'SUPABASE_KEY'],
        dependencies: ['@supabase/supabase-js'],
        templateDir: 'supabase-auth'
    },
    firebase: {
        envVars: ['FIREBASE_API_KEY', 'FIREBASE_AUTH_DOMAIN'],
        dependencies: ['firebase'],
        templateDir: 'firebase-auth'
    }
};

export async function setupAuth(projectDir: string, provider: AuthProvider) {
    if (provider == 'none') return;

    const config = AUTH_PROVIDERS[provider];
    const authTemplatePath = path.join(__dirname, "..", "src", "templates", "auth", config.templateDir);

    if (!(await fs.pathExists(authTemplatePath))) {
        throw new Error(`Auth template for ${provider} not found at ${authTemplatePath}`)
    }

    await fs.copy(authTemplatePath, projectDir)

    const packageJsonPath = path.join(projectDir, 'package.json')
    const pkge = await fs.readJson(packageJsonPath)

    pkge.dependencies = {
        ...pkge.dependencies,
        ...config.dependencies.reduce((acc, dependency) => ({ ...acc, [dependency]: 'latest' }), {})
    }

    await fs.writeJson(packageJsonPath, pkge, { spaces: 2 })

    console.log(chalk.green(`✓ Added ${provider} auth setup`));
    console.log(chalk.yellow(`⚠️ Add these ENV vars to your .env file:`));
    config.envVars.forEach(varName => console.log(`- ${varName}=your_value`));
}
