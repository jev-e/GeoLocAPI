# GeoLocAPI

Authors: Jacob Evans, Will Kearney

# Endpoints

A header with a token value needs to be passed for all incoming requests. 

1. /api/ 

For uploading of user Co-ordinates.

1.1 /api/upload (POST)

Uploads a document of the UID, Longitude, and Latitude. 

Document should be structured as:

```
{ 
UID: xxxx,
Longitude: xxxx,
Latitude: xxxx
}
```

2. /users/

For user authentication.

2.1 /users/login (POST)

Takes the username / email and password and authenticates their credentials. 



