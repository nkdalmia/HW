# HW 1

## One Time Setup
Install Python (version >= 3.0), [VirtualEnv](http://virtualenv.readthedocs.org/en/latest/) and Ansible.

Get the code and setup virtual environment to run the python script
```
git clone https://github.com/nkdalmia/HW.git
cd HW/HW1
virtualenv ~/venv
```
## Running the code

### Activate Python Virtual Environment
```
source ~/venv/bin/activate
```

### Configuration Management (Installing dependencies)
```
pip install -r requirements.txt
```
In future, new package dependencies can be put in requirements.txt.

### Server Provisioning and Nginx Installation
```
./provision.sh
```
Runs the python script main.py used to provisions servers and the ansible playbook that installs nginx on provisioned servers.

### Deactivate Python Virtual Environment
```
deactivate
```

## Screencast


