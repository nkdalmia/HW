# HW 4

## File IO

### Containers for Legacy App and Linked App
Build the docker image for legacy app.
```
sudo docker build -f LegacyApp_Dockerfile -t legacyapp .
```

Run the legacy app container
```
sudo docker run -it --rm --name legacyappcontainer legacyapp
```

Build the docker image that will run the linked app container
```
sudo docker build -f LinkedApp_Dockerfile -t linkedapp .
```

Run the linked app container and open bash shell in it
```
sudo docker run -it --rm --name linkedappcontainer --link legacyappcontainer:legacyappcontainer linkedapp /bin/bash
```

Read the file in linked app container by accessing port 9001 on legacy app container
curl legacyappcontainer:9001

### Screencast
Link: https://youtu.be/ASn4fZpUlzw

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

### Screencast
Link: https://youtu.be/ASn4fZpUlzw
