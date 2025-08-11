import chalk from "chalk";
import fs from 'fs-extra'
import path from "path";

export type DbProvider = "sqlite" | "postgresql" | "mongodb" | "none"

