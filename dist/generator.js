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
const nanospinner_1 = require("nanospinner");
const auth_1 = require("./auth");
function generateTemplate(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const spinner = (0, nanospinner_1.createSpinner)('Initializing project...').start();
        spinner.stop();
        try {
            const { projectName, templateName, auth } = options;
            const sanitizedName = projectName
                .trim()
                .toLowerCase()
                .replace(/\s+/g, '-') // replace spaces with hyphens
                .replace(/[^a-z0-9-]/g, '');
            const targetDirectory = path_1.default.join(process.cwd(), sanitizedName);
            // --- Validation ---
            if (!/^[a-z0-9-]+$/.test(projectName)) {
                throw new Error("Project name must be lowercase with hyphens only");
            }
            if (yield fs_extra_1.default.pathExists(targetDirectory)) {
                throw new Error(`Directory ${projectName} already exists`);
            }
            // --- Next.js Special Handling ---
            if (templateName === 'nextjs') {
                yield setupNextJsProject(targetDirectory, auth);
                spinner.stop();
                return;
            }
            spinner.stop();
            // --- Regular Templates ---
            const templateDirectory = path_1.default.resolve(__dirname, '..', 'templates', templateName);
            // Copy template
            spinner.update({ text: 'Copying template files...' });
            yield fs_extra_1.default.copy(templateDirectory, targetDirectory);
            // Process template files
            spinner.update({ text: 'Configuring project...' });
            const filesToProcess = ['package.json', 'README.md'];
            for (const file of filesToProcess) {
                const filePath = path_1.default.join(targetDirectory, file);
                if (yield fs_extra_1.default.pathExists(filePath)) {
                    const content = yield fs_extra_1.default.readFile(filePath, 'utf-8');
                    yield fs_extra_1.default.writeFile(filePath, handlebars_1.default.compile(content)({ projectName }));
                }
            }
            // Install dependencies
            spinner.update({ text: 'Installing dependencies...' });
            (0, child_process_1.execSync)('npm install', { cwd: targetDirectory, stdio: "inherit" });
            // Initialize Git
            spinner.update({ text: 'Initializing Git...' });
            (0, child_process_1.execSync)('git init', { cwd: targetDirectory });
            spinner.stop();
            // Setup auth (if specified)
            if (auth !== 'none') {
                yield (0, auth_1.setupAuth)(targetDirectory, auth);
            }
            // Success message
            printSuccessMessage(projectName, auth);
        }
        catch (error) {
            spinner.error(chalk_1.default.red('Project generation failed'));
            console.error(chalk_1.default.red(error instanceof Error ? error.message : error));
            process.exit(1);
        }
    });
}
function setupNextJsProject(projectDir, auth) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const spinner = (0, nanospinner_1.createSpinner)('Creating Next.js app...').start();
        try {
            // Ensure parent directory exists
            yield fs_extra_1.default.ensureDir(path_1.default.dirname(projectDir));
            // Make sure project folder doesn't already exist
            if (yield fs_extra_1.default.pathExists(projectDir)) {
                throw new Error(`Directory ${projectDir} already exists`);
            }
            // Pre-create the target folder to avoid permission errors
            yield fs_extra_1.default.mkdir(projectDir);
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
                useTailwind && '--tailwind', // Tailwind 
                useSrcDir && '--src-dir', // src/ folder
                useAppRouter && '--app', // App Router
                !useEslint && '--no-eslint', // Disable ESLint
                '--use-npm', // Force npm
                `--import-alias "${importAlias}"`,
                '--yes' // Skip all prompts
            ].filter(Boolean).join(' ');
            // Run create-next-app in the projectDir
            (0, child_process_1.execSync)(`npx create-next-app@latest ${projectDir} ${flags}`, { stdio: 'inherit' });
            // 2. Add auth if specified
            if (auth !== 'none') {
                if (!((_a = auth_1.AUTH_PROVIDERS[auth]) === null || _a === void 0 ? void 0 : _a.isNextJsCompatible)) {
                    throw new Error(`${auth} auth is not supported for Next.js`);
                }
                yield (0, auth_1.setupAuth)(projectDir, auth, true); // isNextJsProject = true
            }
            spinner.success(chalk_1.default.green('Next.js project created'));
            printSuccessMessage(path_1.default.basename(projectDir), auth);
        }
        catch (error) {
            spinner.error(chalk_1.default.red('Next.js setup failed'));
            yield fs_extra_1.default.remove(projectDir); // Cleanup
            throw error;
        }
    });
}
function printSuccessMessage(projectName, auth) {
    console.log(chalk_1.default.bold.green('\nProject ready!'));
    console.log(chalk_1.default.blue('\nNext steps:'));
    console.log(`  ${chalk_1.default.cyan(`cd ${projectName}`)}`);
    console.log(`  ${chalk_1.default.cyan('npm run dev')}`);
    if (auth !== 'none') {
        console.log(chalk_1.default.yellow('\nConfigure these in .env.local:'));
        console.log(chalk_1.default.cyan(auth_1.AUTH_PROVIDERS[auth].envVars.join('\n')));
    }
}
