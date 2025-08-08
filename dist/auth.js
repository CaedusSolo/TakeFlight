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
exports.NEXTJS_AUTH_PROVIDERS = exports.AUTH_PROVIDERS = void 0;
exports.setupAuth = setupAuth;
exports.addNextJsAuth = addNextJsAuth;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
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
exports.NEXTJS_AUTH_PROVIDERS = {
    supabase: {
        files: 'templates/nextjs-auth/supabase',
        dependencies: ['@supabase/supabase-js'],
        envVars: ['NEXT_PUBLIC_SUPABASE_KEY', 'NEXT_PUBLIC_SUPABASE_URL']
    },
    firebase: {
        files: 'templates/nextjs-auth/firebase',
        dependencies: ['firebase'],
        envVars: ['NEXT_PUBLIC_FIREBASE_API_KEY', 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN']
    },
    nextauth: {
        files: 'templates/nextjs-auth/next-auth',
        dependencies: ['next-auth'],
        envVars: ['NEXTAUTH_SECRET', 'NEXTAUTH_URL']
    }
};
function setupAuth(projectDir, provider) {
    return __awaiter(this, void 0, void 0, function* () {
        if (provider === 'none')
            return;
        // Skip unsupported providers (e.g., nextauth is Next.js-only)
        if (!(provider in exports.AUTH_PROVIDERS)) {
            console.log(chalk_1.default.yellow(`Skipping generic auth setup for provider "${provider}".`));
            return;
        }
        const config = exports.AUTH_PROVIDERS[provider];
        const authTemplatePath = path_1.default.join(__dirname, '..', 'src', 'templates', 'auth', config.templateDir);
        // 1. Copy auth files to /src/auth
        const authTargetDir = path_1.default.join(projectDir, 'src', 'auth');
        yield fs_extra_1.default.copy(path_1.default.join(authTemplatePath, 'src'), authTargetDir);
        // 2. Copy setup guide if available
        const setupFilePath = path_1.default.join(authTemplatePath, 'AUTH_SETUP.md');
        if (yield fs_extra_1.default.pathExists(setupFilePath)) {
            yield fs_extra_1.default.copy(setupFilePath, path_1.default.join(projectDir, 'AUTH-SETUP.md'));
            console.log(chalk_1.default.green('\n✓ Copied auth setup guide to AUTH-SETUP.md'));
        }
        // 3. Fix imports in the auth entry file
        const authEntryPath = path_1.default.join(authTargetDir, 'auth.js');
        if (yield fs_extra_1.default.pathExists(authEntryPath)) {
            let content = yield fs_extra_1.default.readFile(authEntryPath, 'utf-8');
            content = content.replace(/from '\.\//g, "from './auth/");
            yield fs_extra_1.default.writeFile(authEntryPath, content);
        }
        // 4. Add dependencies to package.json
        const pkgPath = path_1.default.join(projectDir, 'package.json');
        const pkg = yield fs_extra_1.default.readJson(pkgPath);
        pkg.dependencies = Object.assign(Object.assign({}, pkg.dependencies), config.dependencies.reduce((acc, dep) => (Object.assign(Object.assign({}, acc), { [dep]: 'latest' })), {}));
        yield fs_extra_1.default.writeJson(pkgPath, pkg, { spaces: 2 });
    });
}
function addNextJsAuth(projectDirectory, auth) {
    return __awaiter(this, void 0, void 0, function* () {
        const authConfig = exports.NEXTJS_AUTH_PROVIDERS[auth];
        // 1. Copy template files
        yield fs_extra_1.default.copy(path_1.default.join(__dirname, authConfig.files), projectDirectory);
        // 2. Install dependencies
        (0, child_process_1.execSync)(`npm install ${authConfig.dependencies.join(' ')}`, {
            cwd: projectDirectory,
            stdio: 'inherit'
        });
    });
}
