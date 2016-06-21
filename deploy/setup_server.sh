#!/bin/bash

# remote
# curl http://url.file | bash
# wget -qO- http://url.file | bash

sudo apt-get update -y
sudo apt-get install git -y

printf "\nInstall NODE & NPM"
cd ~
wget https://nodejs.org/dist/latest-v5.x/node-v5.9.0-linux-x64.tar.gz

mkdir node
tar xvf node-v*.tar.?z --strip-components=1 -C ./node

cd ~
rm -rf node-v*

mkdir node/etc
printf '\nprefix=/usr/local' > node/etc/npmrc

sudo mv node /opt/

sudo chown -R root: /opt/node

sudo ln -s /opt/node/bin/node /usr/local/bin/node
sudo ln -s /opt/node/bin/npm /usr/local/bin/npm

node -v

printf "\nInstall NGINX"
sudo apt-get install nginx -y
# sudo rm /etc/nginx/sites-available/default
# sudo vi /etc/nginx/sites-available/default
# tail -f /var/log/nginx/error.log
# sudo service nginx restart

printf "\nInstall pm2 package"
npm install -g pm2

printf "\nRum node app"
cd ~
git clone git@github.com:iddar/backend-boilerplate.git
cd ~/backend-boilerplate
mkdir uploads
git fetch origin

printf "\nSet permissions to remote folder"
# cp -r /root/backend-boilerplate/uploads /var/www/uploads
# ln -s /Users/iddar/Desktop/usability-lab/backend/uploads /var/www
usermod -a -G www-data root
mkdir -p /var/www/uploads
chown -R www-data:www-data /var/www/uploads
chmod 701 -R /var/www/uploads
