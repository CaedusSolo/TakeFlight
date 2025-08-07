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
    const spinner = createSpinner('🚀 Launching project setup...').start();

    try {
        const { projectName, templateName, auth } = options;
        const templateDirectory = path.resolve(process.cwd(), 'src', 'templates', templateName);
        const targetDirectory = path.join(process.cwd(), projectName);

        // --- Validation Phase ---
        spinner.update({ text: '🔍 Validating project...' });
        if (!/^[a-z0-9-]+$/.test(projectName)) {
            throw new Error("Project name must be lowercase, with hyphens only, no spaces.");
        }
        if (await fs.pathExists(targetDirectory)) {
            throw new Error(`Directory ${projectName} already exists.`);
        }
        if (!(await fs.pathExists(templateDirectory))) {
            throw new Error(`Template ${templateName} not found`);
        }

        // --- File Operations ---
        spinner.update({ text: '📂 Copying template files...' });
        await fs.copy(templateDirectory, targetDirectory);
        spinner.stop();
        console.log(chalk.green('✓ Template files copied'));
        spinner.start();

        // --- Configuration ---
        spinner.update({ text: '⚙️  Configuring project...' });
        const filesToProcess = ['package.json', 'README.md'];
        for (const file of filesToProcess) {
            const filePath = path.join(targetDirectory, file);
            if (await fs.pathExists(filePath)) {
                const content = await fs.readFile(filePath, 'utf-8');
                await fs.writeFile(filePath, Handlebars.compile(content)({ projectName }));
            }
        }

        // --- Dependencies ---
        spinner.update({ text: '📦 Installing dependencies...' });
        spinner.stop();
        execSync('npm install', { cwd: targetDirectory, stdio: "inherit" });
        console.log(chalk.green('✓ Dependencies installed'));
        spinner.start();

        // --- Git Init ---
        spinner.update({ text: '🐙 Initializing Git...' });
        execSync('git init', { cwd: targetDirectory });
        spinner.stop();
        console.log(chalk.green('✓ Git repository initialized'));
        spinner.start();

        // --- Auth Setup ---
        if (auth !== 'none') {
            try {
                spinner.update({ text: '🔐 Setting up authentication...' });
                await setupAuth(targetDirectory, auth);
                spinner.stop();
                console.log(chalk.green('✓ Authentication configured'));
                spinner.start();
            } catch (error) {
                spinner.stop();
                console.log(chalk.yellow('⚠️  Authentication setup skipped'));
                console.log(chalk.red(`   ${(error as Error).message}`));
                spinner.start();
            }
        }

        // --- Completion ---
        spinner.stop();
        console.log(chalk.bold.green('\n✨ Project ready!\n'));
        console.log(chalk.bold('Next steps:'));
        console.log(`  ${chalk.cyan(`cd ${projectName}`)}`);
        if (auth !== 'none') {
            console.log(`  ${chalk.cyan('Configure your .env file')}`);
        }
        console.log(`  ${chalk.cyan('Start developing!')}`);

    } catch (error) {
        spinner.error({ text: '💥 Project generation failed' });
        console.error(chalk.red('\nError:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
}