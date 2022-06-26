# ETyres
Etyres is an inventory management and invoicing desktop web app focused on tyre dealerships, built with React, Flask and Mongo. 
It is designed with a focus on negotations that take place between a seller and customer, GST invoice is computed accordingly.


### Update price list (catalog)
https://user-images.githubusercontent.com/19819930/175831985-0125d144-7558-4ffa-9939-12404e9b1e33.mp4

### Upload purchase invoices
https://user-images.githubusercontent.com/19819930/175832102-cfff1205-d06a-4b24-a513-5d299a5577a6.mp4

### Create sales order
https://user-images.githubusercontent.com/19819930/175832197-02635f66-4ebd-43e0-a005-39c93896ce70.mp4

### Reports
https://user-images.githubusercontent.com/19819930/175832364-815dd400-0651-40cd-8776-f9eda20e7cf5.mp4

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
 
