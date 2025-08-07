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
const ora_1 = __importDefault(require("ora"));
const auth_1 = require("./auth");
function generateTemplate(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { projectName, templateName, auth } = options;
        const templateDirectory = path_1.default.resolve(process.cwd(), 'src', 'templates', templateName);
        const targetDirectory = path_1.default.join(process.cwd(), projectName);
        // Validate project name
        if (!/^[a-z0-9-]+$/.test(projectName)) {
            throw new Error("Project name must be lowercase, with hyphens only, no spaces.");
        }
        if (yield fs_extra_1.default.pathExists(targetDirectory)) {
            throw new Error(`Directory ${projectName} already exists.`);
        }
        // Copy template files
        if (!(yield fs_extra_1.default.pathExists(templateDirectory))) {
            throw new Error(`Template ${templateName} not found`);
        }
        const spinner = (0, ora_1.default)('Copying template files...').start();
        yield fs_extra_1.default.copy(templateDirectory, targetDirectory);
        spinner.succeed('Template files copied!');
        // Process template files
        const filesToProcess = ['package.json', 'README.md'];
        for (const file of filesToProcess) {
            const filePath = path_1.default.join(targetDirectory, file);
            if (yield fs_extra_1.default.pathExists(filePath)) {
                const content = yield fs_extra_1.default.readFile(filePath, 'utf-8');
                const compiled = handlebars_1.default.compile(content);
                yield fs_extra_1.default.writeFile(filePath, compiled({ projectName }));
            }
        }
        // Install dependencies
        console.log(chalk_1.default.blue(`Installing dependencies...`));
        (0, child_process_1.execSync)('npm install', { cwd: targetDirectory, stdio: "inherit" });
        console.log(chalk_1.default.green('Successfully installed project dependencies!'));
        // Initialize Git
        console.log(chalk_1.default.blue("Running git init..."));
        (0, child_process_1.execSync)('git init', { cwd: targetDirectory });
        console.log(chalk_1.default.green("Successfully initialized Git repository!"));
        // Setup authentication
        try {
            yield (0, auth_1.setupAuth)(targetDirectory, auth);
        }
        catch (error) {
            console.log(chalk_1.default.yellow('⚠️ Auth setup skipped due to error:'));
            console.log(chalk_1.default.red(error.message));
        }
    });
}
