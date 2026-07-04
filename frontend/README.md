# HR Management System - Frontend

This is the frontend application for the HR Management System, built with **React** and **Vite**.

## 🚀 Getting Started

Follow these steps to set up the project locally:

### 1. Install Dependencies

Make sure you have Node.js installed. Then, run the following command to install all required dependencies:

```bash
npm install
```

### 2. Start the Development Server

To start the app in development mode with Hot Module Replacement (HMR):

```bash
npm run dev
```

## 🛠️ Tooling & Code Quality

This project is configured with industry-standard tools to ensure code quality and consistency:

- **ESLint**: Catches syntax errors and enforces best practices.
- **Prettier**: Automatically formats code for a consistent style (e.g., no semicolons, 80 character print width).
- **Husky & lint-staged**: We use Git hooks to automatically run ESLint and Prettier on your staged files **before every commit**. This ensures that no unformatted or broken code is ever committed to the repository.

### Available Scripts

- `npm run dev` - Starts the Vite development server.
- `npm run build` - Builds the app for production.
- `npm run preview` - Previews the production build locally.
- `npm run lint` - Runs ESLint across the codebase to check for issues.
- `npm run format` - Runs Prettier to automatically format all files in the project.

## ⚙️ Configuration Files

- `.prettierrc` - Contains the rules for Prettier formatting.
- `eslint.config.js` - Contains the ESLint configuration (integrated with Prettier).
- `.husky/pre-commit` - The Git hook that triggers `lint-staged` before a commit.
