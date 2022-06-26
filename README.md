# ETyres
Etyres is an inventory management and invoicing desktop web app focused on tyre dealerships, built with React, Flask and Mongo. 
It is designed with a focus on negotations that take place between a seller and customer, GST invoice is computed accordingly.


![Output sample](https://j.gifs.com/pZqkkX.gif)

### To run the dev build - 
1. Download Docker for your OS
   1. For Ubuntu - download [Docker Engine](https://docs.docker.com/engine/install/ubuntu/) and [Docker-compose](https://docs.docker.com/compose/install/).
   1. For Windows - download [Docker Desktop](https://docs.docker.com/desktop/windows/install/).
   1. For MacOS - download [Docker Desktop](https://docs.docker.com/desktop/mac/install/).
1. Fork and clone this repo
1. Run the following command to start the dev build (make sure it is executed from the project diretory) - 
```
sudo docker-compose --profile dev up 
```
The app can be accessed at localhost:3000/, and the mongodb at port 27017 (any mongo GUI tool can be used such as Mongo Compass).

Feel free to fork it and make contributions.

### Todo

- [ ] Make the server async.
- [ ] Add feature to delete sale invoice, reverse stock.
- [ ] Make it mobile friendly.    
 
