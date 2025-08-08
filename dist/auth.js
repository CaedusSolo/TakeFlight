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
const nanospinner_1 = require("nanospinner");
exports.AUTH_PROVIDERS = {
    supabase: {
        envVars: [
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY'
        ],
        dependencies: ['@supabase/supabase-js'],
        templateDir: 'supabase-auth',
        isNextJsCompatible: true
    },
    firebase: {
        envVars: [
            'NEXT_PUBLIC_FIREBASE_API_KEY',
            'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'
        ],
        dependencies: ['firebase'],
        templateDir: 'firebase-auth',
        isNextJsCompatible: true
    },
    nextauth: {
        envVars: [
            'NEXTAUTH_SECRET',
            'NEXTAUTH_URL',
            'GITHUB_CLIENT_ID',
            'GITHUB_CLIENT_SECRET'
        ],
        dependencies: ['next-auth'],
        templateDir: 'nextauth',
        isNextJsCompatible: true
    }
};
function setupAuth(projectDir_1, provider_1) {
    return __awaiter(this, arguments, void 0, function* (projectDir, provider, isNextJsProject = false) {
        if (provider === 'none')
            return;
        const config = exports.AUTH_PROVIDERS[provider];
        const spinner = (0, nanospinner_1.createSpinner)(`Configuring ${provider} auth...`).start();
        spinner.stop();
        try {
            // Determine template source path
            const templatePath = path_1.default.join(__dirname, '..', 'src', 'templates', 'auth', isNextJsProject ? 'nextjs-auth' : 'auth', // Use correct parent folder
            provider // Go directly into provider-specific folder
            );
            // Determine target path
            const targetPath = isNextJsProject
                ? path_1.default.join(projectDir, 'src/app') // Next.js puts auth in app/
                : path_1.default.join(projectDir, 'src/auth'); // Others use src/auth
            // 1. Copy template files
            yield fs_extra_1.default.copy(templatePath, targetPath, {
                overwrite: true,
                filter: (src) => !src.includes('node_modules') // Safety check
            });
        }
        catch (error) {
            spinner.error(chalk_1.default.red(`${provider} auth setup failed`));
            console.error(chalk_1.default.red(error instanceof Error ? error.message : error));
            // Cleanup on failure
            if (isNextJsProject) {
                yield fs_extra_1.default.remove(path_1.default.join(projectDir, 'src/app/auth'));
            }
            else {
                yield fs_extra_1.default.remove(path_1.default.join(projectDir, 'src/auth'));
            }
        }
    });
}
