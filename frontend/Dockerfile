FROM node:16.14.2-buster as build

# Expose ports
EXPOSE 3000

# Set working directory
WORKDIR /app

# Copy package files 
COPY package.json package.json
COPY package-lock.json package-lock.json

# install app dependencies
RUN npm install

# copy all source files from current dir to docker /app directory
COPY . .

CMD ["npm", "start"]