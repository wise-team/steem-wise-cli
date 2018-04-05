FROM node:8.11-slim

WORKDIR /app
COPY .nvmrc package.json package-lock.json ./
COPY src/ ./src

RUN bash -c 'set -o pipefail && \
    ( \
        if [[ "$(node --version)" = "$(cat .nvmrc)"* ]]; then \
       echo "Node version correct"; else echo "Node version in .nvmrc is different. Please update Dockerfile" && exit 1; fi \
    )'

RUN npm install

CMD ["npm", "start"]
