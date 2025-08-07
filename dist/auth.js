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
        if (provider === 'none')
            return;
        const config = exports.AUTH_PROVIDERS[provider];
        const authTemplatePath = path_1.default.join(__dirname, '..', 'src', 'templates', 'auth', config.templateDir, 'src');
        const authTargetDir = path_1.default.join(projectDir, 'src', 'auth'); // New auth folder
        // Create auth directoryi
        yield fs_extra_1.default.ensureDir(authTargetDir);
        // Copy files to /src/auth
        yield fs_extra_1.default.copy(authTemplatePath, authTargetDir);
        // Update imports in template files
        const authEntryPath = path_1.default.join(authTargetDir, 'auth.js');
        if (yield fs_extra_1.default.pathExists(authEntryPath)) {
            let content = yield fs_extra_1.default.readFile(authEntryPath, 'utf-8');
            content = content.replace(/from '\.\//g, "from './auth/");
            yield fs_extra_1.default.writeFile(authEntryPath, content);
        }
        // Update main package.json
        const pkgPath = path_1.default.join(projectDir, 'package.json');
        const pkg = yield fs_extra_1.default.readJson(pkgPath);
        pkg.dependencies = Object.assign(Object.assign({}, pkg.dependencies), config.dependencies.reduce((acc, dep) => (Object.assign(Object.assign({}, acc), { [dep]: 'latest' })), {}));
        yield fs_extra_1.default.writeJson(pkgPath, pkg, { spaces: 2 });
    });
}
