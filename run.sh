#! /usr/bin/env bash

if [ -f process.pid ];
then
    kill $(cat process.pid)
fi

echo "Start running server"
nohup .venv/bin/gunicorn --config gunicorn.config.py wsgi:app &>/dev/null &
echo "Running server with PID $(cat process.pid)"
