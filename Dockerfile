
# Use official Node.js Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile && npx prisma generate

# Copy all source code
COPY . .

# Build the Next.js app
RUN yarn build

# Expose the port Next.js runs on
EXPOSE 3000

# Start the production server
CMD ["yarn", "start"]

