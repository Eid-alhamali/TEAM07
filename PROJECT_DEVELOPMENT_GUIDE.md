# Project Setup and Development Guide

## Table of Contents
1. [Project Initialization](#project-initialization)
   - [Backend Setup (Node.js)](#backend-setup-nodejs)
   - [Frontend Setup (React)](#frontend-setup-react)
   - [Database Setup (MySQL)](#database-setup-mysql)
2. [Version Control (GitHub)](#version-control-github)
   - [Cloning the Repository](#cloning-the-repository)
   - [Branching Strategy](#branching-strategy)
   - [Committing Changes](#committing-changes)
   - [Pull Requests](#pull-requests)
   - [Merge Conflicts](#merge-conflicts)
3. [Connecting Backend, Frontend, and Database](#connecting-backend-frontend-and-database)
4. [Environment Setup](#environment-setup)
   - [Windows and Mac Setup](#windows-and-mac-setup)
5. [Best Practices](#best-practices)
6. [Troubleshooting and FAQs](#troubleshooting-and-faqs)

---

## Project Initialization

### Backend Setup (Node.js)

1. **Install Node.js:**
   - Download and install Node.js from [here](https://nodejs.org/). Choose the appropriate version based on your operating system.
   - Verify installation:
     ```bash
     node -v
     npm -v
     ```

2. **Initialize the Backend Project:**
   - In the project root directory:
     ```bash
     mkdir backend
     cd backend
     npm init -y
     ```
   - Install essential dependencies (Express framework):
     ```bash
     npm install express
     ```

3. **Create a Basic Express Server:**
   - Create an `index.js` file:
     ```javascript
     const express = require('express');
     const app = express();
     const port = process.env.PORT || 3000;

     app.get('/', (req, res) => {
         res.send('Backend is running');
     });

     app.listen(port, () => {
         console.log(`Server is running on port ${port}`);
     });
     ```

4. **Install MySQL and other dependencies:**
   ```bash
   npm install mysql2
   ```

### Frontend Setup (React)

1. **Install Node.js (if not already):**
   Ensure Node.js and npm are installed.

2. **Create a React App:**
   - In the project root directory:
     ```bash
     npx create-react-app frontend
     cd frontend
     ```

3. **Run the React Application:**
   ```bash
   npm start
   ```

4. **Install Axios (for API requests to backend):**
   ```bash
   npm install axios
   ```

### Database Setup (MySQL)

1. **Install MySQL:**
   - Download MySQL from [here](https://www.mysql.com/downloads/).
   - For Windows, follow the MySQL Installer instructions. For Mac, use `Homebrew`:
     ```bash
     brew install mysql
     ```

2. **Start MySQL Service:**
   - **Windows:**
     Start MySQL using MySQL Workbench or command prompt.
   - **Mac:**
     ```bash
     brew services start mysql
     ```

3. **Create the Database:**
   ```sql
   CREATE DATABASE online_store;
   ```

---

## Version Control (GitHub)

### Cloning the Repository

1. Clone the project repository from GitHub:
   ```bash
   git clone https://github.com/aryahassibi/TEAM07.git
   cd TEAM07
   ```

### Branching Strategy

We follow **Git Flow** for better collaboration:
- **Main branch**: Contains production-ready code.
- **Development branch**: Where integration happens.
- **Feature branches**: Each new feature or bug fix should have its own branch.

To create a new feature branch:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature
```

### Committing Changes

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

### Pull Requests

- Once you are done with a feature, push your changes to GitHub:
  ```bash
  git push origin feature/your-feature
  ```

- Open a pull request (PR) on GitHub to merge the feature branch into `develop`. 

### Code Review and Merging
  - Wait for at least one approval before merging your PR.
  - Once approved, **merge your PR** into `develop` on [GitHub](https://github.com/aryahassibi/TEAM07.git). Avoid merging directly from your local machine.

### Updating Local Branches
- **Sync frequently** by pulling the latest changes from `develop`:
  ```bash
  git checkout develop
  git pull origin develop
  ```
### Merge Conflicts

- If there are conflicts during merge:
  - Fetch the latest changes:
    ```bash
    git fetch
    git merge origin/develop
    ```
  - Resolve conflicts in your editor and commit.

---

## Connecting Backend, Frontend, and Database

1. **API Integration:**
   - Ensure backend (Node.js) and frontend (React) are running on different ports (e.g., 3000 for React and 5000 for Node.js).
   - Use Axios in the React app to call the backend:
     ```javascript
     axios.get('http://localhost:5000/api/products')
     .then(response => setProducts(response.data))
     ```

2. **Backend-Database Connection:**
   - In your backend code, connect to MySQL:
     ```javascript
     const mysql = require('mysql2');
     const db = mysql.createConnection({
         host: 'localhost',
         user: 'root',
         password: 'your_password',
         database: 'online_store'
     });

     db.connect(err => {
         if (err) throw err;
         console.log('MySQL connected');
     });
     ```

---

## Environment Setup

To ensure consistency and eliminate environment-related issues across all team members, **Docker** will be used to create a uniform development environment. Docker simplifies dependency management and ensures that everyone is working in the same setup, regardless of their operating system. Follow the steps below for setting up the environment.

### Windows and Mac Setup

1. **Install Docker:**
   - Download and install Docker Desktop from [here](https://www.docker.com/products/docker-desktop).
   - Verify Docker is running by checking:
     ```bash
     docker --version
     ```

2. **Clone the Repository:**
   - Clone the project repository to your local machine:
     ```bash
     git clone https://github.com/your-username/TEAM07.git
     cd TEAM07
     ```

3. **Create a `.env` File:**
   - In the project root, create a `.env` file to manage environment variables for the backend and database:
     ```
     PORT=5000
     DB_HOST=db
     DB_USER=root
     DB_PASS=your_password
     DB_NAME=online_store
     ```

4. **Setup Docker with `docker-compose`:**
   - In the project root directory, create a `docker-compose.yml` file to define the services (backend, frontend, and MySQL database):
     ```yaml
     version: '3.8'

     services:
       db:
         image: mysql:8.0
         environment:
           MYSQL_ROOT_PASSWORD: ${DB_PASS}
           MYSQL_DATABASE: ${DB_NAME}
         ports:
           - "3306:3306"
         volumes:
           - ./db_data:/var/lib/mysql

       backend:
         build: ./backend
         ports:
           - "5000:5000"
         volumes:
           - ./backend:/usr/src/app
         depends_on:
           - db
         environment:
           - DB_HOST=db
           - DB_USER=${DB_USER}
           - DB_PASS=${DB_PASS}
           - DB_NAME=${DB_NAME}

       frontend:
         build: ./frontend
         ports:
           - "3000:3000"
         volumes:
           - ./frontend:/usr/src/app
     ```

5. **Build and Start the Containers:**
   - To start the entire application (frontend, backend, and database):
     ```bash
     docker-compose up --build
     ```

6. **Access the Application:**
   - **Frontend**: Go to `http://localhost:3000`
   - **Backend**: Access the backend API at `http://localhost:5000`
   - **Database**: MySQL is running on `localhost:3306`

7. **Stop the Application:**
   - To stop the running containers:
     ```bash
     docker-compose down
     ```
     
---

## Best Practices

- Use **ESLint** and **Prettier** for consistent code style across all environments.
  - Install them as dev dependencies:
    ```bash
    npm install eslint prettier --save-dev
    ```

- Maintain **test coverage** using tools like **Jest** for React and **Mocha** for Node.js.
  
- Use **environment variables** for sensitive data. Never hard-code passwords, tokens, or keys in the code.

---

## Troubleshooting

- **React app not connecting to the backend?**
  - Ensure both the backend and frontend are running on different ports, and use the correct API URL.
  
- **Database connection issues?**
  - Verify the database credentials in the `.env` file and ensure MySQL service is running.
