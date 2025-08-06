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
exports.AUTH_PROVIDERS = void 0;
exports.setupAuth = setupAuth;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
exports.AUTH_PROVIDERS = {
    supabase: {
        envVars: ['SUPABASE_URL', 'SUPABASE_KEY'],
        dependencies: ['@supabase/supabase-js'],
        templateDir: 'supabase-auth'
    },
    firebase: {
        envVars: ['FIREBASE_API_KEY', 'FIREBASE_AUTH_DOMAIN'],
        dependencies: ['firebase'],
        templateDir: 'firebase-auth'
    }
};
function setupAuth(projectDir, provider) {
    return __awaiter(this, void 0, void 0, function* () {
        if (provider == 'none')
            return;
        const config = exports.AUTH_PROVIDERS[provider];
        const authTemplatePath = path_1.default.join(__dirname, "..", "src", "templates", "auth", config.templateDir);
        if (!(yield fs_extra_1.default.pathExists(authTemplatePath))) {
            throw new Error(`Auth template for ${provider} not found at ${authTemplatePath}`);
        }
        yield fs_extra_1.default.copy(authTemplatePath, projectDir);
        const packageJsonPath = path_1.default.join(projectDir, 'package.json');
        const pkge = yield fs_extra_1.default.readJson(packageJsonPath);
        pkge.dependencies = Object.assign(Object.assign({}, pkge.dependencies), config.dependencies.reduce((acc, dependency) => (Object.assign(Object.assign({}, acc), { [dependency]: 'latest' })), {}));
        yield fs_extra_1.default.writeJson(packageJsonPath, pkge, { spaces: 2 });
        console.log(chalk_1.default.green(`✓ Added ${provider} auth setup`));
        console.log(chalk_1.default.yellow(`⚠️ Add these ENV vars to your .env file:`));
        config.envVars.forEach(varName => console.log(`- ${varName}=your_value`));
    });
}
