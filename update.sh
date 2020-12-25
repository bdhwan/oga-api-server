#!/bin/bash
echo "start update"
git pull
npm install
npm run build
echo "done update"
exit(0)