import requests
import json
import time
import configparser

DIGITALOCEAN_DROPLETS_ENDPOINT = 'https://api.digitalocean.com/v2/droplets/'


class DigitalOceanService:

    def getAuthToken(self):
        ini_file = '/home/ndalmia/keys/digitalocean_auth_token.ini'
        config = configparser.ConfigParser()
        config.read(ini_file)
        return config['DEFAULT']['AUTH_TOKEN']

    ## create droplet
    def createDroplet(self):
        headers = {'Content-Type':'application/json', 'Authorization': 'Bearer ' + self.getAuthToken()}

        name = 'test-droplet-1'
        region = 'nyc1'
        image = 'ubuntu-14-04-x64'
        data = {
        'name': name,
        'region': region,
        'size': '512mb',
        'image': image,
        'ssh_keys': [1297084],
        'backups': False,
        'ipv6': False,
        'user_data': None,
        'private_networking': None
        }

        resp = requests.post(DIGITALOCEAN_DROPLETS_ENDPOINT, data=json.dumps(data), headers=headers)
        if (resp.status_code == 202):
            resp_body = resp.json()
            id = resp_body['droplet']['id']
            print('Created droplet with id: ' + str(id))
            ip = None
            i = 1
            while (ip is None):
                print('Attempt number ' + str(i) + ' to get ip of created droplet')
                ip = self.getDropletIp(id=id)
                if (ip is None):
                    timeout = 2
                    print('sleeping for ' + str(timeout) + ' seconds')
                    time.sleep(timeout)
                i += 1
            print("Droplet Ip Addess: " + ip)
            return ip
        else:
            raise Exception('Failed to create droplet')

    def deleteDroplet(self, id):
        headers = {'Content-Type':'application/json', 'Authorization': 'Bearer ' + self.getAuthToken()}
        resp = requests.delete(DIGITALOCEAN_DROPLETS_ENDPOINT + str(id), headers=headers)
        if (resp.status_code == 204):
            print('Successfully deleted droplet with id ' + str(id))
        else:
            raise Exception('Failed to delete droplet')

    def deleteAllDroplets(self):
        headers = {'Content-Type':'application/json', 'Authorization': 'Bearer ' + self.getAuthToken()}
        resp = requests.get(DIGITALOCEAN_DROPLETS_ENDPOINT, headers=headers)
        if (resp.status_code == 200):
            resp_body = resp.json()
            for droplet in resp_body['droplets']:
               self.deleteDroplet(droplet['id']) 
        else:
            raise Exception('Failed to list all droplets')

    def getDropletIp(self, id):
        headers = {'Content-Type':'application/json', 'Authorization': 'Bearer ' + self.getAuthToken()}
        resp = requests.get(DIGITALOCEAN_DROPLETS_ENDPOINT + str(id), headers=headers)
        if (resp.status_code == 200):
            resp_body = resp.json()
            ipv4_details = resp_body['droplet']['networks']['v4']
            if len(ipv4_details) == 0:
                return None
            else:
                return ipv4_details[0]['ip_address']
        else:
            raise Exception('Failed to get details of droplet with id ' + str(id))
