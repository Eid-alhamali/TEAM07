# Git & GitHub Guide for TEAM07 Project

This guide provides instructions and guidelines for using Git and GitHub in this project.

## Table of Contents
1. [Branching Strategy](#branching-strategy)
2. [Committing Changes](#committing-changes)
3. [Pull Requests](#pull-requests)
4. [Code Review and Merging](#code-review-and-merging)
5. [Updating Local Branches](#updating-local-branches)
6. [Best Practices](#best-practices)


---

## Branching Strategy

We follow **Git Flow** for better collaboration:

- **Main branch**: Contains production-ready code.
- **Develop branch**: Where integration happens.
- **Feature branches**: Each new feature or bug fix should have its own branch.

To create a new feature branch:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature
```

## Committing Changes

- Follow the Commit Message Convention: `type(scope): message`
   - `type`
   Indicates the kind of change you are making to the project. Common types include:
      - `feat`: A new feature.
      - `fix`: A bug fix.
      - `docs`: Documentation changes.
      - `style`: Code style changes (formatting, no code change).
      - `refactor`: Code refactoring without adding features or fixing bugs.
      - `test`: Adding or modifying tests.
      - `chore`: Maintenance tasks (e.g., dependency updates).

   - `scope`
   Describes the part of the project that your change affects. Some common scopes are:
      - `auth`: Authentication-related code.
      - `cart`: Shopping cart functionality.
      - `setup`: Project setup or configuration.
      - `db`: Database changes.
      - `api`: Backend API-related changes.

   - `message`
      A concise summary of the change you made, written in the `imperative` form (e.g., "add", "fix", "update"). Keep it brief but descriptive.
      
- Commit Message Examples:
   - Adding a feature: `feat(auth): add login functionality`
   - Fixing a bug: `fix(cart): correct item count logic`
   - Updating documentation: `docs(setup): add project setup guide`


- Stage and commit your changes:
   ```bash
   git add .
   git commit -m "feat(auth): implement user login"
   ```
   - The `git add .` command stages all changes in the current directory and its subdirectories. This includes new, modified, and deleted files.
   - Alternatively, you can stage specific files or folders by listing them individually:
      ```bash
      git add file1 directory1/ file2
      ```

## Pull Requests

- Once you are done with a feature, push your changes to GitHub:
  ```bash
  git push origin feature/your-feature
  ```

- Open a pull request (PR) on GitHub to merge the feature branch into `develop`. 

## Code Review and Merging
  - Wait for at least one approval before merging your PR.
  - Once approved, **merge your PR** into `develop` on [GitHub](https://github.com/aryahassibi/TEAM07.git). Avoid merging directly from your local machine.

## Updating Local Branches
- **Sync frequently** by pulling the latest changes from `develop`:
  ```bash
  git checkout develop
  git pull origin develop
  ```

## Best Practices

- **Commit Often**: Smaller commits make it easier to track changes.
- **Pull Frequently**: Keep your local `develop` branch updated.
- **Descriptive Messages**: Write clear commit messages.
- **Review Before Commit**: Use `git diff` to review changes.
