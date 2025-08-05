import fs from 'fs-extra'
import path from 'path'
import Handlebars from 'handlebars'
import { execSync } from 'child_process'
import chalk from 'chalk'

/** 
 * Generate project from a template
 * @param templateName - Name of the template (eg 'express')
 * @param projectName - Target directory name
 */

export async function generateTemplate(templateName: string, projectName: string) {
// Add this temporarily to cli.ts
    const templateDirectory = path.join(
        __dirname,
        '..',  // Go up from dist/ to project root
        'templates',
        templateName
    );
    const targetDirectory = path.join(process.cwd(), projectName)

    // validate project name with regex
    if (!/^[a-z0-9-]+$/.test(projectName)) {
        throw new Error("Project name must be lowercase, with hyphens only, no spaces.")
    }

    if (await fs.pathExists(targetDirectory)) {
        throw new Error(`Directory ${projectName} already exists.`)
    }


    // copy files
    if (!(await fs.pathExists(templateDirectory))) {
        throw new Error(`Template ${templateName} not found`)
    }
    else {
        await fs.copy(templateDirectory, targetDirectory)
    }

    const filesToProcess = ['package.json', 'README.md']
    for (const file of filesToProcess) {
        const filePath = path.join(targetDirectory, file);
        if (await fs.pathExists(filePath)) {
            const content = await fs.readFile(filePath, 'utf-8');
            const compiled = Handlebars.compile(content);
            await fs.writeFile(filePath, compiled({ projectName }));
        }
    }

    // install dependencies
    console.log(chalk.blue(`Installing dependencies...`))
    execSync('npm install', { cwd: targetDirectory, stdio: "inherit" })

    // git init
    console.log(chalk.blue("Running git init..."))
    execSync('git init', { cwd: targetDirectory })

}