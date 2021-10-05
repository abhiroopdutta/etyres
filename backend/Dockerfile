# Create our image based on Python 3.9
FROM python:3.9-slim-buster

#setup working dir
WORKDIR /app

# Expose ports
EXPOSE 5000

# Tell Python to not generate .pyc
ENV PYTHONDONTWRITEBYTECODE 1
# Turn off buffering
ENV PYTHONUNBUFFERED 1

# copy dependancy list 
COPY requirements.txt requirements.txt

# install app dependencies
RUN pip install -r requirements.txt

# copy all source files from current dir to docker /app directory
COPY . .