#!/bin/bash

printf "\nRum node app\n"
cd ~/backend-boilerplate
git checkout dev
git pull
npm install
pm2 stop all
NODE_ENV=production pm2 start index.js --name apiserver
