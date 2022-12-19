FROM node:19

WORKDIR /app

ENV PORT 80
ENV HOST 0.0.0.0

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

# /app/backend, /app/build and /app/logs mounted as volumes

RUN npm install

EXPOSE 80

CMD ["npm", "run", "run:server"]