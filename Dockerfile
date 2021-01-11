FROM node:12
MAINTAINER Chris Lanus <cqlanus@gmail.com>

# set working directory
WORKDIR /app

ENV PORT 9001
ENV HTTPS true

COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent

# add app
COPY . ./

## THE LIFE SAVER
# ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
# RUN chmod +x /wait

EXPOSE 9001

## Launch the wait tool and then your application
# CMD /wait && npm run dev

CMD npm run dev
