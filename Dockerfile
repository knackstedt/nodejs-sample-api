FROM ubuntu:22.04

RUN apt update
RUN apt install curl -y -qq
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt install nginx nodejs gcc g++ make -y -qq
RUN npm i -g pm2
# RUN service nginx enable

WORKDIR /app

# Pull in nginx configuration
COPY ./nginx.conf /etc/nginx/nginx.conf

COPY . /app

RUN npm i
RUN npm run build

EXPOSE 80


CMD ["/bin/bash", "-c", "service nginx start; pm2-runtime ecosystem.config.js"]
