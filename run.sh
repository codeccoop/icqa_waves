#! /usr/bin/env bash

if [ -f process.pid ];
then
    kill $(cat process.pid)
fi

echo "Start running server"
nohup .venv/bin/gunicorn --config gunicorn.config.py wsgi:app &>/dev/null &
pid=$!
echo $pid > process.pid
echo "Running server with PID $(cat process.pid)"


arg=$1

if [[ -z "$arg" ]]; then
  echo
  echo -e "\e[1m   SERVER CONTROLS \e[0m"
  echo " welcome to wsgi API"
  echo
  echo -e "  \e[4mcommands:\e[0m"
  echo "   · install"
  echo -e "   · serve \e[31m\e[3m[development]\e[0m\e[0m"
  echo -e "   · run \e[31m\e[3m[production]\e[0m\e[0m"
  echo -e "   · stop \e[31m\e[3m[production]\e[0m\e[0m"
  echo -e "   · interactive \e[31m\e[3m[docker]\e[0m\e[0m"
  echo
  echo "Feed a command:";read command
else
  command=$arg
fi

function stop () {
  if [[ -e process.pid ]]; then
    kill -8 $(cat process.pid)
  fi
}

if [[ "$command" = "install" ]]
then
  pip install -r requirements.txt
elif [[ "$command" = "serve" ]]
then
  python3 wsgi.py --dev
elif [[ "$command" = "run" ]]
then
  stop
  gunicorn --config gunicorn.config.py wsgi:app
  echo "Running server with PID $(cat process.pid)"
elif [[ "$command" = "stop" ]]
then
  stop
elif [[ "$command" = "interactive" ]]
then
	echo "Attach interactive sesson to docker container\n"
	bash
else
  echo "Unrecognized command"
fi
