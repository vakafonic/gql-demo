FROM node:12.14.1-alpine AS build

RUN apk --update add openssh-client && \
    apk add git && \
    npm install -g npm-cli-adduser

USER node

WORKDIR /usr/src/app

FROM build AS dev
#some dev dependencies

FROM build AS prod

ARG NODE_ENV=production

COPY . .

RUN npm install --production

CMD ["npm", "run", "start"]
