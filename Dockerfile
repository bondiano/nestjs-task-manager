FROM node:18.16-bullseye-slim AS dependencies

WORKDIR /app
COPY ./package.json .
COPY ./yarn.lock .

RUN yarn install --immutable --production

FROM node:18.16-bullseye-slim AS runtime

WORKDIR /app

ENV NODE_ENV production

USER node

COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node ./dist .

CMD ["node", "main.js"]
