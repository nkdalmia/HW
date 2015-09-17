python main.py

echo "Running ansible playbook to install Nginx on provisioned servers"
ansible-playbook provision_playbook.yml -i inventory