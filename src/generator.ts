import fs from 'fs-extra';
import path from 'path';
import Handlebars from 'handlebars';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { createSpinner } from 'nanospinner';
import { AuthProvider, setupAuth, AUTH_PROVIDERS } from './auth';
import { DB_PROVIDERS, DbProvider, setupDB } from './db';

interface Options {
  projectName: string;
  templateName: 'express' | 'react' | 'nextjs';
  auth: AuthProvider;
  db: DbProvider;
}

export async function generateTemplate(options: Options) {
  const spinner = createSpinner('Initializing project...').start();
  spinner.stop()

  try {
    const { projectName, templateName, auth, db } = options;
    const isNextJsProject = templateName === "nextjs"
    const sanitizedName = projectName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-') // replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '');

    const targetDirectory = path.join(process.cwd(), sanitizedName);

    // --- Validation ---
    if (!/^[a-z0-9-]+$/.test(projectName)) {
      throw new Error("Project name must be lowercase with hyphens only");
    }
    if (await fs.pathExists(targetDirectory)) {
      throw new Error(`Directory ${projectName} already exists`);
    }

    // --- Next.js Special Handling ---
    if (templateName === 'nextjs') {
      await setupNextJsProject(targetDirectory, auth);
      spinner.stop()
      return;
    }

    spinner.stop()
    // --- Regular Templates ---
    const templateDirectory = path.resolve(__dirname, '..', 'templates', templateName);

    // Copy template
    spinner.update({ text: 'Copying template files...' });
    await fs.copy(templateDirectory, targetDirectory);

    // Process template files
    spinner.update({ text: 'Configuring project...' });
    const filesToProcess = ['package.json', 'README.md'];
    for (const file of filesToProcess) {
      const filePath = path.join(targetDirectory, file);
      if (await fs.pathExists(filePath)) {
        const content = await fs.readFile(filePath, 'utf-8');
        await fs.writeFile(filePath, Handlebars.compile(content)({ projectName }));
      }
    }

    // Install dependencies
    spinner.update({ text: 'Installing dependencies...' });
    execSync('npm install', { cwd: targetDirectory, stdio: "inherit" });

    // Initialize Git
    spinner.update({ text: 'Initializing Git...' });
    execSync('git init', { cwd: targetDirectory });
    spinner.stop()

    if (auth !== 'none') {
      await setupAuth(targetDirectory, auth, isNextJsProject);
    }

    if (db !== 'none') {
      await setupDB(targetDirectory, db)
    }

    // create .env/.env.local file
    await createEnvFile(targetDirectory, auth, db, isNextJsProject)
    if (!isNextJsProject) {
      await createGitignore(targetDirectory)
    }

    // Success message
    printSuccessMessage(projectName, auth);

  } catch (error) {
    spinner.error(chalk.red('Project generation failed'));
    console.error(chalk.red(error instanceof Error ? error.message : error));
    process.exit(1);
  }
}

async function setupNextJsProject(projectDir: string, auth: AuthProvider) {
  const spinner = createSpinner('Creating Next.js app...').start();

  try {
    // Ensure parent directory exists
    await fs.ensureDir(path.dirname(projectDir));

    // Make sure project folder doesn't already exist
    if (await fs.pathExists(projectDir)) {
      throw new Error(`Directory ${projectDir} already exists`);
    }

    // Pre-create the target folder to avoid permission errors
    await fs.mkdir(projectDir);

    const useTypeScript = true;
    const useTailwind = true;
    const useSrcDir = true;
    const useAppRouter = true;
    const useTurpoback = false;
    const importAlias = '@/*';
    const useEslint = false;

    // Build flags for create-next-app
    const flags = [
      '--ts',
      useTailwind && '--tailwind',  // Tailwind 
      useSrcDir && '--src-dir',     // src/ folder
      useAppRouter && '--app',      // App Router
      !useEslint && '--no-eslint',  // Disable ESLint
      '--use-npm',                  // Force npm
      `--import-alias "${importAlias}"`,
      '--yes'                       // Skip all prompts
    ].filter(Boolean).join(' ');

    // Run create-next-app in the projectDir
    execSync(
      `npx create-next-app@latest ${projectDir} ${flags}`,
      { stdio: 'inherit' }
    );

    // 2. Add auth if specified
    if (auth !== 'none') {
      if (!AUTH_PROVIDERS[auth]?.isNextJsCompatible) {
        throw new Error(`${auth} auth is not supported for Next.js`);
      }
      await setupAuth(projectDir, auth, true); // isNextJsProject = true
    }

    spinner.success(chalk.green('Next.js project created'));
    printSuccessMessage(path.basename(projectDir), auth);

  } catch (error) {
    spinner.error(chalk.red('Next.js setup failed'));
    await fs.remove(projectDir); // Cleanup
    throw error;
  }
}


async function createEnvFile(
  projectDirectory: string,
  auth: AuthProvider,
  db: DbProvider,
  isNextJsProject: boolean
) {
  let envVars: string[] = []

  if (auth !== "none") {
    envVars = envVars.concat(AUTH_PROVIDERS[auth].envVars)
  }
  if (db !== "none") {
    envVars = envVars.concat(DB_PROVIDERS[db].envVars)
  }

  if (envVars.length === 0) return
  const envFileName = isNextJsProject ? ".env.local" : ".env"
  const envFilePath = path.join(projectDirectory, envFileName)

  const envContent = envVars.map((v) => `${v}=your_${v.toLowerCase()}_here`).join("\n") + "\n"
  await fs.writeFile(envFilePath, envContent, { flag: "wx" })
    .catch(async (error) => {
      if (error.code == "EEXIST") {
        console.log(chalk.yellow(".env file already exists, skipping setup..."))
      }
    })

  console.log(chalk.green(`Successfully created ${envFileName} with the needed variables.`))
}


async function createGitignore(targetDirectory: string) {
  const gitignoreContent = `
# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Env files
.env
.env.local
.env.*.local

# Build
dist/
build/
.next/
out/
coverage/

# Logs
logs
*.log
*.log.*
`;

  const gitignorePath = path.join(targetDirectory, '.gitignore');

  if (!(await fs.pathExists(gitignorePath))) {
    await fs.writeFile(gitignorePath, gitignoreContent.trim() + '\n');
    console.log(chalk.green("Successfully created and populated .gitignore"))
  }
}


function printSuccessMessage(projectName: string, auth: AuthProvider) {
  console.log(chalk.bold.green('\nProject ready!'));
  console.log(chalk.blue('\nNext steps:'));
  console.log(`  ${chalk.cyan(`cd ${projectName}`)}`);
  console.log(`  ${chalk.cyan("git remote add origin https://github.com/yourusername/projectname.git")}`)
  console.log(`  ${chalk.cyan('npm run dev')}`);

  if (auth !== 'none') {
    console.log(chalk.yellow('\nConfigure these in .env (.env.local if NextJS):'));
    console.log(chalk.cyan(AUTH_PROVIDERS[auth].envVars.join('\n')));
  }
}