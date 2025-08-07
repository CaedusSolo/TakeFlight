import fs from 'fs-extra';
import path from 'path';
import Handlebars from 'handlebars';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { AuthProvider, setupAuth } from './auth';

interface Options {
    projectName: string;
    templateName: 'express' | 'react';
    auth: AuthProvider;
}

export async function generateTemplate(options: Options) {
    const { projectName, templateName, auth } = options;

    const templateDirectory = path.resolve(process.cwd(), 'src', 'templates', templateName);
    const targetDirectory = path.join(process.cwd(), projectName);

    // Validate project name
    if (!/^[a-z0-9-]+$/.test(projectName)) {
        throw new Error("Project name must be lowercase, with hyphens only, no spaces.");
    }

    if (await fs.pathExists(targetDirectory)) {
        throw new Error(`Directory ${projectName} already exists.`);
    }

    // Copy template files
    if (!(await fs.pathExists(templateDirectory))) {
        throw new Error(`Template ${templateName} not found`);
    }

    await fs.copy(templateDirectory, targetDirectory);

    // Process template files
    const filesToProcess = ['package.json', 'README.md'];
    for (const file of filesToProcess) {
        const filePath = path.join(targetDirectory, file);
        if (await fs.pathExists(filePath)) {
            const content = await fs.readFile(filePath, 'utf-8');
            const compiled = Handlebars.compile(content);
            await fs.writeFile(filePath, compiled({ projectName }));
        }
    }

    // Install dependencies
    console.log(chalk.blue(`Installing dependencies...`));
    execSync('npm install', { cwd: targetDirectory, stdio: "inherit" });
    console.log(chalk.green('Successfully installed project dependencies!'))

    // Initialize Git
    console.log(chalk.blue("Running git init..."));
    execSync('git init', { cwd: targetDirectory });
    console.log(chalk.green("Successfully initialized Git repository!"))

    // Setup authentication
    try {
        await setupAuth(targetDirectory, auth);
    } catch (error) {
        console.log(chalk.yellow('⚠️ Auth setup skipped due to error:'));
        console.log(chalk.red((error as Error).message));
    }
}