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
  if (provider === 'none') return;

  const config = AUTH_PROVIDERS[provider];
  const authTemplatePath = path.join(__dirname, '..', 'src', 'templates', 'auth', config.templateDir, 'src');
  const authTargetDir = path.join(projectDir, 'src', 'auth'); // New auth folder

  // Create auth directoryi
  await fs.ensureDir(authTargetDir);

  // Copy files to /src/auth
  await fs.copy(authTemplatePath, authTargetDir);

  // Update imports in template files
  const authEntryPath = path.join(authTargetDir, 'auth.js');
  if (await fs.pathExists(authEntryPath)) {
    let content = await fs.readFile(authEntryPath, 'utf-8');
    content = content.replace(/from '\.\//g, "from './auth/");
    await fs.writeFile(authEntryPath, content);
  }

  // Update main package.json
  const pkgPath = path.join(projectDir, 'package.json');
  const pkg = await fs.readJson(pkgPath);
  
  pkg.dependencies = {
    ...pkg.dependencies,
    ...config.dependencies.reduce((acc, dep) => ({ ...acc, [dep]: 'latest' }), {})
  };

  await fs.writeJson(pkgPath, pkg, { spaces: 2 });
}