#!/bin/bash

printf "\nDelivery new code"
# run bash script on remote server
ssh root@45.55.39.130 "bash -s" < ./deploy/delivery.sh
