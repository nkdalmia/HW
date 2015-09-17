import boto3
import time

class AWSService:

    def createEC2Instance(self):
        region = 'us-east-1'
        image = 'ami-01fa416a'

        ec2 = boto3.resource('ec2', region)
        instance = ec2.create_instances(ImageId=image, MinCount=1, MaxCount=1, KeyName='Fedora Home')
        id = instance[0].id
        print('Created AWS EC2 instance with id: ' + str(id))
        ip = None
        i = 1
        while (ip is None):
            print('Attempt number ' + str(i) + ' to get ip of created instance')
            ip = ec2.Instance(id).public_ip_address
            if (ip is None):
                timeout = 5
                print('sleeping for ' + str(timeout) + ' seconds')
                time.sleep(timeout)
                i += 1
        print("AWS EC2 Instance Ip Addess: " + ip)

        ## Timeout to ensure instance is initialized
        timeout_initilizing = 120
        print('Waiting for AWS EC2 instance to initialize. Sleeping for ' + str(timeout_initilizing) + ' seconds')
        time.sleep(timeout_initilizing)

        return ip

    def deleteAllEC2Instances(self):
        region = 'us-east-1'

        ec2 = boto3.resource('ec2', region)
        ec2.instances.stop()
        ec2.instances.terminate()
