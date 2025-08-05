"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTemplate = generateTemplate;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
const child_process_1 = require("child_process");
const chalk_1 = __importDefault(require("chalk"));
/**
 * Generate project from a template
 * @param templateName - Name of the template (eg 'express')
 * @param projectName - Target directory name
 */
function generateTemplate(templateName, projectName) {
    return __awaiter(this, void 0, void 0, function* () {
        // Add this temporarily to cli.ts
        const templateDirectory = path_1.default.join(__dirname, '..', // Go up from dist/ to project root
        'templates', templateName);
        const targetDirectory = path_1.default.join(process.cwd(), projectName);
        // validate project name with regex
        if (!/^[a-z0-9-]+$/.test(projectName)) {
            throw new Error("Project name must be lowercase, with hyphens only, no spaces.");
        }
        if (yield fs_extra_1.default.pathExists(targetDirectory)) {
            throw new Error(`Directory ${projectName} already exists.`);
        }
        // copy files
        if (!(yield fs_extra_1.default.pathExists(templateDirectory))) {
            throw new Error(`Template ${templateName} not found`);
        }
        else {
            yield fs_extra_1.default.copy(templateDirectory, targetDirectory);
        }
        const filesToProcess = ['package.json', 'README.md'];
        for (const file of filesToProcess) {
            const filePath = path_1.default.join(targetDirectory, file);
            if (yield fs_extra_1.default.pathExists(filePath)) {
                const content = yield fs_extra_1.default.readFile(filePath, 'utf-8');
                const compiled = handlebars_1.default.compile(content);
                yield fs_extra_1.default.writeFile(filePath, compiled({ projectName }));
            }
        }
        // install dependencies
        console.log(chalk_1.default.blue(`Installing dependencies...`));
        (0, child_process_1.execSync)('npm install', { cwd: targetDirectory, stdio: "inherit" });
        // git init
        console.log(chalk_1.default.blue("Running git init..."));
        (0, child_process_1.execSync)('git init', { cwd: targetDirectory });
    });
}
