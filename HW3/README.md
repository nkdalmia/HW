# HW 1

## Setup

### Prerequisites
* Install NodeJS (version >= 4.0.0). You can use [NVM](https://www.npmjs.com/package/nvm) to manage your NodeJS installation.
* Install redis and run on localhost:6379

### Get the code and install NodeJS modules
```
git clone https://github.com/nkdalmia/HW.git
cd HW/HW3
npm install
```

## Running Proxy Server and Application servers

```
node main.js
```

This will start a proxy server (running on port 80) and 2 application servers (running on 3000 and 3001).

## Calling Application Server APIs
### Set/Get
From your browser, go to 
```
http://localhost/get
http://localhost/set
```

### Recent
From your browser, go to 
```
http://localhost/recent
```
Note: The above request (GET /recent) is always the most recent received request.

## Upload/Meow
Use curl to upload the image:
```
curl -F "image=@./img/morning.jpg" localhost/upload
```

To view the most recently uploaded image, go to
```
http://localhost/meow
```

## Proxy Server
The proxy server runs on port 80 and delivers requests to the two appliction servers uniformly.
* 1st request is delivered to localhost:3000, 2nd request to localhost:3001, 3rd request again to localhost:3000, 4th to localhost:3001 and so on.

### Implementation Details
* A queue (stored in Redis) is used to maintain the list of application servers.
* For each request received by the proxy server, we use redis command 'rpoplpush' to remove the applcation server from the front of the queue and insert it at the end of queue. 
* The proxy server delivers the request to the application server that was moved in the above step.

## Screencast
Link: http://
