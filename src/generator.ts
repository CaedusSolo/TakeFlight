import fs from 'fs-extra'
import path from 'path'
import Handlebars from 'handlebars'

/** 
 * Generate project from a template
 * @param templateName - Name of the template (eg 'express')
 * @param projectName - Target directory name
 */

export async function generateTemplate(templateName: string, projectName: string) {
    const templateDirectory = path.join(__dirname, 'templates', templateName)
    const targetDirectory = path.join(process.cwd(), projectName)

    // copy files
    if (!(await fs.pathExists(templateDirectory))) {
        throw new Error(`Template ${templateName} not found`)
    }
    else {
        await fs.copy(templateDirectory, targetDirectory)
    }    

    const filesToProcess = ['package.json', 'README.md']
    for (const file of filesToProcess) {
        const filePath = path.join(targetDirectory, file)

        if (await fs.pathExists(filePath)) {
            const filePath = path.join(targetDirectory, file)
            if (await fs.pathExists(filePath)) {
                const content = await fs.readFile(filePath, 'utf-8')
                const compiled = Handlebars.compile(content)
                await fs.writeFile(filePath, compiled({projectName}))
            }
        }
    }

}