# Contributing to ZentrixUI

Thank you for your interest in contributing to ZentrixUI! We welcome contributions from the community and are grateful for your support.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Style Guidelines](#style-guidelines)
- [Release Process](#release-process)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [conduct@zentrixui.com](mailto:conduct@zentrixui.com).

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm, pnpm, or yarn
- Git

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/zentrixui.git
   cd zentrixui
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:5173` to see the demo

### Project Structure

```
zentrixui/
├── src/lib/                 # Main library code
│   ├── components/          # React components
│   ├── utils/              # Utility functions
│   ├── config/             # Configuration system
│   └── styles/             # CSS and styling
├── demo/                   # Demo application
├── docs/                   # Documentation
├── tests/                  # Test files
└── dist/                   # Built library (generated)
```

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/add-new-variant`
- `fix/accessibility-issue`
- `docs/update-readme`
- `refactor/improve-performance`

### Commit Messages

Follow conventional commits format:
- `feat: add new upload variant`
- `fix: resolve accessibility issue in dropzone`
- `docs: update API documentation`
- `test: add unit tests for validation`
- `refactor: improve component performance`

### Types of Contributions

#### Bug Fixes
- Check existing issues before creating a new one
- Include steps to reproduce the bug
- Add tests that verify the fix

#### New Features
- Discuss major features in an issue first
- Follow existing patterns and conventions
- Include comprehensive tests
- Update documentation

#### Documentation
- Fix typos and improve clarity
- Add examples and use cases
- Update API documentation
- Improve code comments

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write unit tests for all new functionality
- Include accessibility tests
- Test error conditions and edge cases
- Use descriptive test names

Example test structure:
```typescript
describe('FileUpload Component', () => {
  describe('Button Variant', () => {
    it('should render upload button with correct label', () => {
      // Test implementation
    })

    it('should handle file selection', () => {
      // Test implementation
    })
  })
})
```

### Accessibility Testing

- Test keyboard navigation
- Verify screen reader compatibility
- Check color contrast ratios
- Test with assistive technologies

## Submitting Changes

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with clear, focused commits
3. Add or update tests as needed
4. Update documentation if required
5. Run the full test suite
6. Create a pull request with:
   - Clear title and description
   - Link to related issues
   - Screenshots for UI changes
   - Breaking change notes if applicable

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## Style Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Component Guidelines

- Use functional components with hooks
- Implement proper prop types
- Include accessibility attributes
- Follow naming conventions
- Export components properly

### CSS Guidelines

- Use TailwindCSS classes when possible
- Follow BEM methodology for custom CSS
- Use CSS custom properties for theming
- Ensure responsive design
- Test in multiple browsers

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run full test suite
4. Build and test the package
5. Create release PR
6. Tag release after merge
7. Publish to npm

## Getting Help

### Community

- [GitHub Discussions](https://github.com/zentrixui/zentrixui/discussions) - General questions and discussions
- [GitHub Issues](https://github.com/zentrixui/zentrixui/issues) - Bug reports and feature requests

### Documentation

- [API Documentation](docs/API.md)
- [Configuration Guide](docs/CONFIGURATION.md)
- [Examples](docs/EXAMPLES.md)

### Contact

- Email: [contributors@zentrixui.com](mailto:contributors@zentrixui.com)
- Twitter: [@zentrixui](https://twitter.com/zentrixui)

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to ZentrixUI! 🚀