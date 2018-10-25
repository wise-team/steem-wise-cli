#§ 'FROM node:' + data.config.npm.node.version + '-slim'
FROM node:10.12-slim

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


##§ '\n' + data.config.docker.generateDockerfileFrontMatter(data) + '\n' §##
LABEL maintainer="The Wise Team (https://wise-team.io/) <jedrzejblew@gmail.com>"
LABEL vote.wise.wise-version="2.2.2"
LABEL vote.wise.license="MIT"
LABEL vote.wise.repository="steem-wise-cli"
##§ §.##