FROM mundialis/grass-py3-pdal:stable-ubuntu

RUN mkdir -p /opt/www/log
COPY requirements.txt /opt/www

RUN pip3 install -r /opt/www/requirements.txt

COPY run.sh /opt/www
COPY wsgi.py /opt/www
COPY gunicorn.config.py /opt/www
COPY server /opt/www/server
COPY config /opt/www/config

WORKDIR /opt/www

EXPOSE 5000

ENTRYPOINT ["./run.sh"]
CMD ["run"]
