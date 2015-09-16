from digitalocean_api import DigitalOceanService
from aws_api import AWSService

servers = []

print("Trying to provision droplet on DigitalOcean")
digitalocean_service = DigitalOceanService()
# digitalocean_service.deleteAllDroplets()
droplet_ip = digitalocean_service.createDroplet()
digitalocean_server = {'name': 'digitalocean_server', 'ip': droplet_ip, 'user': 'root', 'ssh_key_file' : '~/.ssh/digitalocean.pub'}
servers.append(digitalocean_server)


print("\nTrying to provision AWS EC2 instance")
aws_service = AWSService()
# aws_service.deleteAllEC2Instances
ec2_instance_ip = aws_service.createEC2Instance()
ec2_server = {'name': 'ec2_server', 'ip': ec2_instance_ip, 'user': 'ubuntu', 'ssh_key_file' : '~/.ssh/FedoraHome.pem'}
servers.append(ec2_server)

with open('./inventory', 'w') as f:
    f.write('[WebServers]\n')
    for s in servers:
        f.write(s['name'] + ' ansible_ssh_host=' + s['ip'] 
            + ' ansible_ssh_user=' + s['user'] + ' ansible_ssh_private_key_file=' + '~/.ssh/digitalocean.pub'
            + '\n')
