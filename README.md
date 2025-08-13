# Take Flight CLI

[![npm version](https://img.shields.io/npm/v/take-flight-cli.svg?color=blue)](https://www.npmjs.com/package/take-flight-cli)
[![License: MIT](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/yourusername/take-flight/pulls)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](https://github.com/yourusername/take-flight/issues)

> **Blast off with zero-config project setups!**  
> A lightning-fast CLI to generate modern web app boilerplates with authentication, databases, and more (coming soon).

---

## Features 

- **One-command project scaffolding** for:
  - Next.js (App Router)
  - React + Vite
  - Express.js APIs
- **Built-in Auth Templates**:
  - Supabase | Firebase | NextAuth.js
- **Developer Experience**:
  - TypeScript-ready 
  - Auto-installs dependencies 
  - Git initialized 

---

## Quick Start

### 1. Install Globally
```bash
npm install -g take-flight-cli
# or
yarn global add take-flight-cli
```

### 2. Generate a Project
```bash
take-flight init
```
---

## Contributing
Contributions are welcome! Whether you’re fixing bugs, adding templates, or improving docs, your help makes this tool better for everyone.

### How to Contribute
#### 1. Fork the repo and clone it locally:

```bash
git clone https://github.com/yourusername/take-flight.git
cd take-flight
```

#### 2. Set up dev environment:

```bash
npm install
npm run dev  # Start live-reload for CLI testing
```

#### 3. Pick an issue or propose a new feature:
- Check the [good first issues](https://github.com/topics/good-first-issue) tag for beginner-friendly contributions.
- Discuss your idea in a new issue before coding to avoid overlap.

#### 4. Submit a Pull Request (PR):
- Branch from main: ``` git checkout -b feat/your-feature ```
- Follow the [commit convention](https://www.conventionalcommits.org/en/v1.0.0/) (e.g., feat: add Next.js template).
- Test changes with npm test (add tests if applicable).
- Document updates in the README if needed.
