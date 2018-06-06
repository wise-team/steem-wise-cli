FROM node:9.11-slim

LABEL maintainer="Jędrzej Lewandowski <jedrzejblew@gmail.com>"

WORKDIR /app
ADD . /app

RUN bash -c 'set -o pipefail && \
    ( \
        if [[ "$(node --version)" = "$(cat .nvmrc)"* ]]; then \
       echo "Node version correct"; else echo "Node version in .nvmrc is different. Please update Dockerfile" && exit 1; fi \
    ) \
    && npm install \
    && npm run build \
    && npm install -g'

CMD ["wise daemon"]
