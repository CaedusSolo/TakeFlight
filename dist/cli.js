#!/usr/bin/env node   // To tell OS to execute this using Node
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
//  imports
const commander_1 = require("commander"); // To parse CLI arguments
const inquirer_1 = __importDefault(require("inquirer")); //  To add interactivity to the tool
const chalk_1 = __importDefault(require("chalk")); //  To add colours to CLI text
const generator_1 = require("./generator");
const program = new commander_1.Command();
function callback() {
    return __awaiter(this, void 0, void 0, function* () {
        const answers = yield inquirer_1.default.prompt([
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
                    { name: "No", value: false },
                    { name: "Yes - Supabase", value: 'supabase' },
                    { name: "Yes- Firebase", value: 'firebase' }
                ],
                default: 'none'
            }
        ]);
        try {
            yield (0, generator_1.generateTemplate)({
                projectName: answers.projectName,
                templateName: answers.template,
                auth: answers.auth
            });
            console.log(chalk_1.default.green(`Success! Project generated is at ./${answers.projectName}`));
        }
        catch (error) {
            console.log(chalk_1.default.red(error));
            process.exit(1);
        }
    });
}
program
    .name('take-flight')
    .description("Generate project boilerplates with this tool")
    .version("0.1.0");
program
    .command("init")
    .description("Testing if take-flight is working...")
    .action(callback);
program.parse(process.argv);
