from digitalocean_api import DigitalOceanService
from aws_api import AWSService

digitalocean_service = DigitalOceanService()
digitalocean_service.deleteAllDroplets()

aws_service = AWSService()
aws_service.deleteAllEC2Instances
