# Use a Node.js base image
FROM node:14

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object

# Copy the rest of the frontend code
COPY . .

# Expose the port (assuming the app runs on 3000)
EXPOSE 3000

# Start the React application
CMD ["npm", "start"]
