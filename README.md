# ETyres
Etyres is an inventory management and invoicing desktop web app focused on tyre dealerships, built with React, Flask and Mongo. 
It is designed with a focus on negotations that take place between a seller and customer, GST invoice is computed accordingly.

Try the Live Demo - [ETyres](http://65.1.114.142/) 

### Upload purchase invoices
https://user-images.githubusercontent.com/19819930/212744031-9dd7d6fd-cf34-4230-9c50-54db14197b8d.mp4

### Create sales order
https://user-images.githubusercontent.com/19819930/212744071-63a913dc-88d4-48c1-a900-77d6fa819ca4.mp4

### Reports
https://user-images.githubusercontent.com/19819930/212744095-6b28a97d-d11c-4337-8f00-8a9dd65c1e1f.mp4

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
- [x] Add feature to delete sale invoice, reverse stock.
- [ ] Add analytics page.   
- [ ] Add GSTR3B tally feature 
