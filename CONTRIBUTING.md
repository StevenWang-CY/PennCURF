# Contributing to Penn CURF Research Finder

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/PennCURF.git
   cd PennCURF
   ```
3. **Set up** the development environment following the [Getting Started](README.md#getting-started) section in the README

## Development Workflow

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Test your changes locally (both frontend and backend if applicable)
4. Commit with a clear, descriptive message:
   ```bash
   git commit -m "Add feature: brief description"
   ```
5. Push to your fork and open a Pull Request

## Pull Request Guidelines

- Keep PRs focused on a single change
- Write a clear description of what your PR does and why
- Reference any related issues (e.g., "Closes #42")
- Ensure the frontend builds without errors (`npm run build`)
- Ensure the backend runs without errors

## Code Style

### Frontend (TypeScript/React)
- Use TypeScript for all new files
- Follow existing component patterns in `src/components/`
- Use Tailwind CSS for styling (follow Penn brand colors)
- Run `npm run lint` before submitting

### Backend (Python)
- Follow PEP 8 style guidelines
- Use type hints for function signatures
- Use Pydantic models for request/response schemas

## Reporting Issues

- Use [GitHub Issues](https://github.com/StevenWang-CY/PennCURF/issues) to report bugs or request features
- Include steps to reproduce for bug reports
- Provide screenshots for UI-related issues

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.
