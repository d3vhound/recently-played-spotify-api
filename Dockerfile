FROM node:10.13.0-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3030
CMD ["npm", "start"]