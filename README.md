# Compresso Coffee Store

Welcome to the Compresso Coffee Store! This is the official GitHub repository for Team 07’s project in CS 308 - Software Engineering at Sabanci University. We’re a team of six working to build a functional, secure, and visually appealing online store for our unique coffee brand, **Compresso**.

## 📍 Key Features

- **Browse and Purchase:** Users can explore coffee products, check availability, add items to their cart, and place orders.
- **User Authentication:** Customers can register, log in, and securely manage their accounts.
- **Order Tracking:** Order statuses are updated in real-time (e.g., "processing," "in-transit," "delivered").
- **Product Reviews:** Customers can rate and comment on products, pending manager approval.
- **Search and Filter:** Users can search by product name and sort by price or popularity.
- **Admin Interface:** A dedicated section for managers to handle inventory, manage discounts, and view analytics.

## 📍 Tech Stack

- **Frontend:** React, Axios
- **Backend:** Node.js, Express
- **Database:** MySQL
- **Containerization:** Docker
- **Version Control:** Git, GitHub

## 📍 Team Members

- Arya Hassibi
- Beste Bayhan
- Mustafa Topcu
- Orhun Ege Ozpay
- Eid Alhamali
- Ecem Akın

## 📍 Development Roadmap

### Project SCRUM Schedule
We follow a SCRUM approach with two-week sprints, culminating in bi-weekly demos as outlined below:

- **Sprint 1:** Initial setup, basic UI, and data modeling
- **Sprint 2:** Product Display, User Account Setup, and Shopping Cart
- **Sprint 3:** Order Tracking and Review System
- **Sprint 4:** Wishlist, Admin Review Management, and System Optimizations
- **Sprint 5:** Final Testing, Debugging, and Demo Preparation

Jira is used to manage tasks and track progress. Each sprint begins with a planning meeting to assign tasks and ends with a sprint review to showcase completed features.

## 📍 Git and GitHub Guidelines

To keep our project organized:

1. **Branching:** We follow the Git Flow model, with separate branches for features, development, and main releases.
2. **Commit Frequency:** Each member aims for at least five meaningful commits per sprint.
3. **PR Reviews:** All pull requests require review and approval from at least one teammate before merging.

Checkout our [Git Guide](docs/Git_Guide.md) for mor info about our system and useful commands.

## 📍 Workflow Overview

Here’s a quick roadmap to get you set up and moving forward effectively.

### 1. Set Up Your Development Environment

- **Install Prerequisites**: Make sure you have **Docker** installed.
- **Clone the Project Repository**:  
    ```bash
    git clone https://github.com/aryahassibi/TEAM07.git
    cd TEAM07
    ```
- **Create Environment Variables**: Add a `.env` file in the project root to manage sensitive data:
    ```
    PORT=5000
    DB_HOST=db
    DB_USER=root
    DB_PASS=
    DB_NAME=ecommerce_db
    JWT_SECRET=JWTSECRET
    ```
    The `DB_PASS` field should be left empty since for now during the development phase, the database is modified to accept empty passwords.

### 2. Start Services with Docker
- Download and install Docker Desktop from [here](https://www.docker.com/products/docker-desktop).
- Verify Docker is running by checking:
    ```bash
    docker --version
    ```
- **Run the Project in Docker**: Start all services (backend, frontend, database) with:
    ```bash
    docker-compose up --build
    ```
    The first time you run this command you might get an error and your may able ot resolve it easirly by stopping the application (press `Ctrl+C` in the terminal) and running the command again. 
- **Access Services**:
    - **Frontend**: [http://localhost:3000](http://localhost:3000)
    - **Backend**: [http://localhost:5001](http://localhost:5001)
- **Stopping and Removing Docker Containers**
    To stop the running containers, press `Ctrl+C` in the terminal, then run:
    ```bash
    docker-compose down
    ```
    This will stop and remove the containers. However, the data will persist in the database volume. If you want to remove the data as well, run:
    ```bash
    docker-compose down -v
    ```
    This command stops and removes the containers and associated volumes, effectively resetting the database and other persistent data.
> [!TIP]
> These commands can also be used to resolve Docker errors by ensuring a clean state before restarting the services.


### 3. Choose Your Task and Branch

- **Sync the Latest Code**:
    ```bash
    git pull origin develop
    ```
- **Create a Feature Branch** for your task (replace `your-feature` with your task name):
    ```bash
    git checkout -b feature/your-feature
    ```

### 4. Code, Test, and Push

- **Develop**: Write your code and test it locally. Make sure API calls (from React) to the backend work smoothly.
- **Commit Changes** using the format: `type(scope): message`
    ```bash
    # Stage the changes you want to commit
    git add .
    ```
    ```bash
    git commit -m "type(scope): message"
    ```
- **Push Your Branch**:
    ```bash
    git push origin feature/your-feature
    ```

### 5. Open a Pull Request (PR)

- On [GitHub](https://github.com/aryahassibi/TEAM07.git), submit a **Pull Request to the `develop` branch** and request a review. 
- Once approved by a at least one of your teammates, you’re ready to merge.

### Best Practices

- Use **environment variables** (like the '.env' file) for sensitive data. Never hard-code passwords, tokens, or keys in the code.



For detailed instructions on setting up the project, initializing the tech stack, and managing version control, please refer to the [Project Setup Guide](./PROJECT_SETUP_GUIDE.md).

