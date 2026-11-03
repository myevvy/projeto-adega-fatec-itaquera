FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Adiciona --legacy-peer-deps para ignorar conflitos de pacotes do ESLint/TypeScript
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]