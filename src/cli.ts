#!/usr/bin/env node

import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import { generateTemplate } from "./generator";

const program = new Command();

async function callback() {
    const { template } = await inquirer.prompt([
        {
            type: 'list',
            name: 'template',
            message: 'Choose a template:',
            choices: ['express', 'react', 'nextjs']
        }
    ]);

    let authChoices = [
        { name: "No", value: 'none' },
        { name: "Yes - Supabase", value: 'supabase' },
        { name: "Yes - Firebase", value: 'firebase' }
    ];

    if (template === 'nextjs') {
        authChoices.push({ name: "Yes - NextAuth.js", value: 'nextauth' });
    }

    const { projectName, auth } = await inquirer.prompt([
        {
            type: 'input',
            name: 'projectName',
            message: 'Enter project name:',
            default: 'my-app'
        },
        {
            type: "list",
            name: "auth",
            message: "Include authentication?",
            choices: authChoices,
            default: 'none'
        }
    ]);

    try {
        await generateTemplate({
            projectName,
            templateName: template,
            auth
        });
        console.log(chalk.green(`Success! Project generated at ./${projectName}`));
    } catch (error) {
        console.log(chalk.red(error));
        process.exit(1);
    }
}

program
    .name('take-flight')
    .description("Generate project boilerplates with this tool")
    .version("0.1.0");

program
    .command("init")
    .description("Testing if take-flight is working...")
    .action(callback);

program.parse(process.argv);
