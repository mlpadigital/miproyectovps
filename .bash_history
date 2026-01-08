sudo reboot
usermod -aG sudo martin
id martin
sudo apt update
bash setup.sh
nano setup.sh
chmod +x setup.sh
./setup.sh
sudo nano /etc/nginx/conf.d/tenants.map.conf
sudo nginx -t
dig cliente1.mlpadigital.com +short
sudo certbot --nginx -d cliente1.mlpadigital.com --redirect
ls /etc/nginx/conf.d/
ls /etc/nginx/sites-enabled/
sudo nano /etc/nginx/sites-enabled/default
sudo rm /etc/nginx/sites-enabled/default
sudo nano /etc/nginx/conf.d/cliente1.conf
sudo nginx -t
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw --force enable
sudo apt install -y nginx certbot python3-certbot-nginx
sudo systemctl enable nginx
sudo systemctl start nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo certbot --nginx -d cliente1.mlpadigital.com --redirect
nano /etc/nginx/conf.d/cliente1.conf
sudo nginx -t
sudo systemctl reload nginx
nano /etc/nginx/conf.d/cliente1.conf
sudo nano /etc/nginx/conf.d/cliente1.conf
ls -l /etc/nginx/conf.d/cliente1.conf
sudo nginx -t
sudo systemctl reload nginx
sudo grep -R "mlpadigital.com" /etc/nginx/
sudo nano /etc/nginx/conf.d/tenants.map.conf
sudo nginx -t
sudo systemctl reload nginx
sudo nano /etc/nginx/conf.d/tenants.map.conf
sudo nginx -t
sudo systemctl reload nginx
systemctl status nginx
curl -I http://cliente1.mlpadigital.com
sudo lsof -i -P -n | grep LISTEN | grep 8101
curl http://127.0.0.1:8101
node app.js --port 8101
nano /etc/nginx/nginx.conf
