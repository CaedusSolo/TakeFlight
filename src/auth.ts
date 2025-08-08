import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import { execSync } from 'child_process'

export type AuthProvider = 'supabase' | 'firebase' | 'nextauth' | 'none';

export interface AuthConfig {
  envVars: string[];
  dependencies: string[];
  templateDir: string;
}

export const AUTH_PROVIDERS: Partial<Record<Exclude<AuthProvider, 'none'>, AuthConfig>> = {
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

export const NEXTJS_AUTH_PROVIDERS = {
  supabase: {
    files: 'templates/nextjs-auth/supabase',
    dependencies: ['@supabase/supabase-js'],
    envVars: ['NEXT_PUBLIC_SUPABASE_KEY', 'NEXT_PUBLIC_SUPABASE_URL']
  },

  firebase: {
    files: 'templates/nextjs-auth/firebase',
    dependencies: ['firebase'],
    envVars: ['NEXT_PUBLIC_FIREBASE_API_KEY', 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN']
  },

  nextauth: {
    files: 'templates/nextjs-auth/next-auth',
    dependencies: ['next-auth'],
    envVars: ['NEXTAUTH_SECRET', 'NEXTAUTH_URL']
  }
};

export async function setupAuth(projectDir: string, provider: AuthProvider) {
  if (provider === 'none') return;

  // Skip unsupported providers (e.g., nextauth is Next.js-only)
  if (!(provider in AUTH_PROVIDERS)) {
    console.log(chalk.yellow(`Skipping generic auth setup for provider "${provider}".`));
    return;
  }

  const config = AUTH_PROVIDERS[provider as Exclude<AuthProvider, 'none'>]!;
  const authTemplatePath = path.join(__dirname, '..', 'src', 'templates', 'auth', config.templateDir);

  // 1. Copy auth files to /src/auth
  const authTargetDir = path.join(projectDir, 'src', 'auth');
  await fs.copy(path.join(authTemplatePath, 'src'), authTargetDir);

  // 2. Copy setup guide if available
  const setupFilePath = path.join(authTemplatePath, 'AUTH_SETUP.md');
  if (await fs.pathExists(setupFilePath)) {
    await fs.copy(setupFilePath, path.join(projectDir, 'AUTH-SETUP.md'));
    console.log(chalk.green('\n✓ Copied auth setup guide to AUTH-SETUP.md'));
  }

  // 3. Fix imports in the auth entry file
  const authEntryPath = path.join(authTargetDir, 'auth.js');
  if (await fs.pathExists(authEntryPath)) {
    let content = await fs.readFile(authEntryPath, 'utf-8');
    content = content.replace(/from '\.\//g, "from './auth/");
    await fs.writeFile(authEntryPath, content);
  }

  // 4. Add dependencies to package.json
  const pkgPath = path.join(projectDir, 'package.json');
  const pkg = await fs.readJson(pkgPath);

  pkg.dependencies = {
    ...pkg.dependencies,
    ...config.dependencies.reduce((acc, dep) => ({ ...acc, [dep]: 'latest' }), {})
  };

  await fs.writeJson(pkgPath, pkg, { spaces: 2 });
}

export async function addNextJsAuth(projectDirectory: string, auth: keyof typeof NEXTJS_AUTH_PROVIDERS) {
  const authConfig = NEXTJS_AUTH_PROVIDERS[auth];

  // 1. Copy template files
  await fs.copy(
    path.join(__dirname, authConfig.files),
    projectDirectory
  );

  // 2. Install dependencies
  execSync(`npm install ${authConfig.dependencies.join(' ')}`, {
    cwd: projectDirectory,
    stdio: 'inherit'
  });
}
