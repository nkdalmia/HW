import boto3
import time

class AWSService:

    def createEC2Instance(self):
        region = 'us-east-1'
        image = 'ami-01fa416a'

        ec2 = boto3.resource('ec2', region)
        instance = ec2.create_instances(ImageId=image, MinCount=1, MaxCount=1)
        id = instance[0].id
        print('Created EC2 instance with id: ' + str(id))
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
        print("EC2 Instance Ip Addess: " + ip)
        return ip

    def deleteAllEC2Instances(self):
        region = 'us-east-1'

        ec2 = boto3.resource('ec2', region)
        ec2.instances.stop()
        ec2.instances.terminate()


