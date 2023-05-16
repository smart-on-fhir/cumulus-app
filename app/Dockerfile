FROM node:19

WORKDIR /app

RUN npm install nodemon -g

COPY *.json /app/
COPY index.d.ts /app/index.d.ts
COPY .mocharc.js /app/.mocharc.js

RUN npm install
# for debugging - uncomment to build during container creation
# TODO: consider using as part of multi-stage build for prod deployment
#ADD src /app/src
#ADD public /app/public
#run REACT_APP_BACKEND_HOST=localhost:4001 npm run build

CMD ["npm", "run", "start:docker"]
