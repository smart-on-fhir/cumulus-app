FROM node:18

WORKDIR /app

ENV PORT=80
ENV HOST=0.0.0.0
ENV NODE_ENV=$NODE_ENV

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

# /app/backend, /app/build and /app/logs mounted as volumes

RUN npm ci

EXPOSE 80

CMD ["npm", "run", "watch:server"]