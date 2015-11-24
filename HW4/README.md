# HW 4

## File IO

### Containers for Legacy App and Linked App
Build the docker image for legacy app.
```
docker build -f Legacy_App_Dockerfile -t legacy_app .
```
Run the legacy app container
```
docker run -it --rm --name legacy_app_container legacy_app
```
Build the docker image that will run the linked app container
```
docker build -f Linked_App_Dockerfile -t linked_app .
```
Run the linked app container and open bash shell in it
```
docker run -it --rm --name linked_app_container --link legacy_app_container:legacy_app_container linked_app /bin/bash
```
Read the file in linked app container by accessing port 9001 on legacy app container using curl
```
curl legacy_app_container:9001
```

### Screencast
Link: https://youtu.be/uOYqc1_CCH8

## Ambassador pattern
### Redis server and Redis server Ambassador
Go to directory part_2/vm1.
Initialize Vagrant VM.
```
vagrant init dbit/ubuntu-docker-fig
```
In Vagrantfile, uncomment the following line to run this VM on a private network with ip 192.168.33.10
```
config.vm.network "private_network", ip: "192.168.33.10"
```
Create file docker-compose.yml as present /part_2/vm1/docker-compose.yml
Start and ssh into Vagrant VM
```
vagrant up
vagrant ssh
```
Start containers for Redis server and Redis server ambassador
```
sudo docker-compose up -d
```

### Redis client and Redis client Ambassador
Go to directory part_2/vm2
Initialize Vagrant VM.
```
vagrant init dbit/ubuntu-docker-fig
```
Create file docker-compose.yml as present /part_2/vm2/docker-compose.yml.
Start and ssh into Vagrant VM
```
vagrant up
vagrant ssh
```
Start containers for Redis client and Redis client ambassador
```
sudo docker-compose run redis_client
```

Perform set and get from Redis client to Redis server using ambassadors.
```
set key 1
get key
```

### Screencast
Link: https://youtu.be/LIHvnUmw-Ng

## Docker Deploy
Run Docker registry.
```
docker run -d -p 5000:5000 --restart=always --name registry registry:0.9.1
```

In a folder not present in this repository folder, create required deploy folders.
```
mkdir deploy/
cd deploy/
mkdir blue.git/ blue-www/ green.git/ green-www/
cd deploy/green.git
git init --bare
cd ..
cd blue.git
git init --bare
```
Set ROOT environment variable to the above creared deploy folder.
```
export ROOT=/home/ndalmia/assignments/DevOps/hw4_part3/deploy
```
Clone the [app repo](https://github.com/CSC-DevOps/App), and set the following remotes.
```
git remote add blue file://$ROOT/blue.git
git remote add green file://$ROOT/green.git
```

Commit changes and push to above remotes using
```
git push blue master
git push green master
```

Access app deployed with latest changes at
```
# Blue App
http://localhost:3001/

# Green App
http://localhost:3002/
```

### Screencast
Link: 
