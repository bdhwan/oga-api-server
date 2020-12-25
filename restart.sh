#!/bin/bash
echo "start restart"
pm2 restart all
echo "done restart"
exit 0