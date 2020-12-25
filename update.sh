#!/bin/bash
echo "start update"
git pull
npm install
npm run build
pm2 restart all
echo "done update"
exit(0)