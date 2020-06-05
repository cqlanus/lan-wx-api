FROM node:12
MAINTAINER Chris Lanus <cqlanus@gmail.com>

# set working directory
WORKDIR /app

ENV PORT 9001
ENV HTTPS true
ENV POSTGRES_USER clanus
ENV POSTGRES_BD MLID

COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent

# add app
COPY . ./

# start app
CMD ["sh", "scripts/bootstrap.sh"]
