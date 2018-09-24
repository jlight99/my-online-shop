# Use an official Ubuntu runtime as parent image
FROM ubuntu:18.04

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Update Ubuntu Software Repository
RUN apt update

# Install the required packages
RUN apt -y install npm nodejs 

# Define environment variable
ENV NAME World

# Install necessary dependencies as defined in package.json
RUN npm install

# Run index.js when the container launches
CMD ["node", "index.js"]
