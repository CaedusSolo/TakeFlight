import fs from 'fs-extra';
import path from 'path';
import Handlebars from 'handlebars';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { createSpinner } from 'nanospinner';
import { AuthProvider, setupAuth } from './auth';

interface Options {
    projectName: string;
    templateName: 'express' | 'react';
    auth: AuthProvider;
}

export async function generateTemplate(options: Options) {
    const { projectName, templateName, auth } = options;
    const spinner = createSpinner().start();

    try {
        const templateDirectory = path.resolve(process.cwd(), 'src', 'templates', templateName);
        const targetDirectory = path.join(process.cwd(), projectName);

        // Validate project name
        spinner.update({ text: 'Validating project name...' });
        if (!/^[a-z0-9-]+$/.test(projectName)) {
            throw new Error("Project name must be lowercase, with hyphens only, no spaces.");
        }

        // Check if directory exists
        if (await fs.pathExists(targetDirectory)) {
            throw new Error(`Directory ${projectName} already exists.`);
        }

        // Copy template files
        spinner.update({ text: 'Copying template files...' });
        if (!(await fs.pathExists(templateDirectory))) {
            throw new Error(`Template ${templateName} not found`);
        }

        await fs.copy(templateDirectory, targetDirectory);
        spinner.stop();
        console.log(chalk.gray(`\n→ Copied ${templateName} template to ./${projectName}`));
        spinner.start();

        // Process template files
        spinner.update({ text: 'Configuring project...' });
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
        spinner.update({ text: 'Installing dependencies (may take a while)...' });
        spinner.stop();
        execSync('npm install', { cwd: targetDirectory, stdio: "inherit" });
        console.log(chalk.green('✓ Dependencies installed'));
        spinner.start();

        // Initialize Git
        spinner.update({ text: 'Initializing Git repository...' });
        execSync('git init', { cwd: targetDirectory });
        spinner.success({ text: chalk.green('Project ready!') });

        // Auth setup
        if (auth !== 'none') {
            try {
                spinner.update({ text: 'Setting up authentication...' });
                await setupAuth(targetDirectory, auth);
            } catch (error) {
                spinner.stop();
                console.log(chalk.yellow('⚠️ Auth setup skipped due to error:'));
                console.log(chalk.red((error as Error).message));
                spinner.start();
            }
        }

        // Final instructions
        console.log(chalk.blue('\nNext steps:'));
        console.log(chalk.cyan(`cd ${projectName}`));

    } catch (error) {
        spinner.error({ text: chalk.red('Project generation failed!') });
        console.error(chalk.red('\nError:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
}