# We don't want to start from scratch.
# That is why we tell node here to use the current node image as base.
FROM node:alpine3.19

EXPOSE 4173

# Create an application directory
RUN mkdir -p /app

# The /app directory should act as the main application directory
WORKDIR /app

# Copy the app package and package-lock.json file
COPY package.json .

# Install node packages
RUN npm install

# Copy or project directory (locally) in the current directory of our docker image (/app)
COPY conf ./conf
COPY svelte.config.js .
COPY postcss.config.js .
COPY vite.config.ts .
COPY tsconfig.json .
COPY public ./public
COPY tailwind.config.mjs .
COPY index.html .
COPY src ./src

# Build the app
RUN npm run build


CMD [ "npm", "run", "preview" ]
