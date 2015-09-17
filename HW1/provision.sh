python main.py

echo "Running ansible playbook to install Nginx on provisioned servers"
export ANSIBLE_HOST_KEY_CHECKING=False
ansible-playbook -i 'inventory' provision_playbook.yml