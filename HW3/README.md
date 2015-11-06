# HW 3

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

## Running Proxy Server and Application Servers

### Application Servers
An Application Server can be started using the command `node main.js <app_port>`.
```
node main.js 3000
node main.js 3001
```

### Proxy Server
Start Proxy Server using the command `node main.js <proxy_port> <app1_addres> <app2_address>`.
```
node main.js 8080 http://localhost:3000 http://localhost:3001
```

This will start a proxy server (running on port 8080) and 2 application servers (running on 3000 and 3001).

## Calling Application Server APIs
### Set/Get
From your browser, go to 
```
http://localhost:8080/get
http://localhost:8080/set
```

### Recent
From your browser, go to 
```
http://localhost:8080/recent
```
Note: The above request (GET /recent) is always the most recent received request.

## Upload/Meow
Use curl to upload the image:
```
curl -F "image=@./img/morning.jpg" localhost:8080/upload
```

To view the most recently uploaded image, go to
```
http://localhost:8080/meow
```

## Proxy Server
The proxy server runs on port 8080 and delivers requests to the two appliction servers uniformly.
* 1st request is delivered to localhost:3000, 2nd request to localhost:3001, 3rd request again to localhost:3000, 4th to localhost:3001 and so on.

### Implementation Details
* A queue (stored in Redis) is used to maintain the list of application servers.
* For each request received by the proxy server, we use redis command 'rpoplpush' to remove the applcation server from the front of the queue and insert it at the end of queue. 
* The proxy server delivers the request to the application server that was moved in the above step.

## Screencast
Link: https://youtu.be/ASn4fZpUlzw
