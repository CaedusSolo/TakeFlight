import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { createSpinner } from 'nanospinner';

export type AuthProvider = 'supabase' | 'firebase' | 'nextauth' | 'none';

export interface AuthConfig {
  envVars: string[];
  dependencies: string[];
  templateDir: string;
  isNextJsCompatible: boolean;
}

export const AUTH_PROVIDERS: Record<Exclude<AuthProvider, 'none'>, AuthConfig> = {
  supabase: {
    envVars: [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ],
    dependencies: ['@supabase/supabase-js'],
    templateDir: 'supabase-auth',
    isNextJsCompatible: true
  },
  firebase: {
    envVars: [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'
    ],
    dependencies: ['firebase'],
    templateDir: 'firebase-auth',
    isNextJsCompatible: true
  },
  nextauth: {
    envVars: [
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'GITHUB_CLIENT_ID',
      'GITHUB_CLIENT_SECRET'
    ],
    dependencies: ['next-auth'],
    templateDir: 'nextauth',
    isNextJsCompatible: true 
  }
};

export async function setupAuth(
  projectDir: string,
  provider: AuthProvider,
  isNextJsProject: boolean = false
) {
  if (provider === 'none') return;

  const config = AUTH_PROVIDERS[provider];
  const spinner = createSpinner(`Configuring ${provider} auth...`).start();
  spinner.stop()

  try {
    // Determine template source path
    const templatePath = path.join(
      __dirname,
      '..', 
      'src',
      'templates',
      'auth',
      isNextJsProject ? 'nextjs-auth' : 'auth', // Use correct parent folder
      provider // Go directly into provider-specific folder
    );

    // Determine target path
    const targetPath = isNextJsProject
      ? path.join(projectDir, 'src/app') 
      : path.join(projectDir, 'src/auth'); 

    // 1. Copy template files
    await fs.copy(templatePath, targetPath, { 
      overwrite: true,
      filter: (src) => !src.includes('node_modules') 
    });

  } catch (error) {
    spinner.error(chalk.red(`${provider} auth setup failed`));
    console.error(chalk.red(error instanceof Error ? error.message : error));

    // Cleanup on failure
    if (isNextJsProject) {
      await fs.remove(path.join(projectDir, 'src/app/auth'));
    } else {
      await fs.remove(path.join(projectDir, 'src/auth'));
    }
  }
}