#!/usr/bin/env node   // To tell OS to execute this using Node

//  imports
import { Command } from "commander" // To parse CLI arguments
import inquirer from "inquirer"  //  To add interactivity to the tool
import chalk from "chalk"  //  To add colours to CLI text
import { generateTemplate } from "./generator"

const program = new Command()

async function callback() {
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'template',
            message: 'Choose a template: ',
            choices: ['express', 'react']
        },
        {
            type: 'input',
            name: 'projectName',
            message: 'Enter project name: ',
            default: 'my-app',
        },
        {
            type: "list",
            name: "auth",
            message: "Include authentication?",
            choices: [
                { name: "No", value: 'none' },
                { name: "Yes - Supabase", value: 'supabase' },
                { name: "Yes- Firebase", value: 'firebase' }
            ],
            default: 'none' 
        }
    ])
    try {
        await generateTemplate({
            projectName: answers.projectName, 
            templateName: answers.template, 
            auth: answers.auth
        })
        console.log(chalk.green(`Success! Project generated is at ./${answers.projectName}`))
    }
    catch (error) {
        console.log(chalk.red(error))
        process.exit(1)
    }
}

program
    .name('take-flight')
    .description("Generate project boilerplates with this tool")
    .version("0.1.0")

program
    .command("init")
    .description("Testing if take-flight is working...")
    .action(callback)

program.parse(process.argv)