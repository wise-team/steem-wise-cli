FROM python:3.6-slim

ENV PIPENV_DEFAULT_PYTHON_VERSION 3.6.4

RUN \
    apt-get update && \
    apt-get install -y \
        build-essential \
        libssl-dev && \
    apt-get clean

RUN \
    python3.6 -m pip install --upgrade pip && \
    python3.6 -m pip install pipenv

COPY . /app
WORKDIR /app

RUN pipenv install --system && \
    pipenv install --python 3.6 --dev && \
    pipenv check


RUN ls -a

RUN \
    apt-get remove -y \
        build-essential \
    apt-get autoremove -y && \
    rm -rf \
        /root/.cache \
        /var/lib/apt/lists/* \
        /tmp/* \
        /var/tmp/* \
        /var/cache/* \
        /usr/include \
        /usr/local/include

CMD ["python", "src/app.py"]