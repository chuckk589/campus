#!/bin/bash
read -e -p "jwt_secret: " -i iEGD5mA jwt_secret
read -e -p "DB_PASSWORD:" -i "ssqwec" DB_PASSWORD
echo -e "jwt_secret=$jwt_secret\nDB_PASSWORD=$DB_PASSWORD\nDB_URL=mysql://root:$DB_PASSWORD@mysqldb:3306/campus\nDB_NAME=campus\nPORT=80" > .env
echo "--------------------------------------env file created--------------------------------------"
docker compose up -d --build
echo "--------------------------------------campus container created--------------------------------------"
docker system prune --all -f
echo "--------------------------------------prune done--------------------------------------"
docker exec -it campus-mysqldb-1 mysql -uroot -pssqwec -e "ALTER USER 'root'@'%' IDENTIFIED BY '$DB_PASSWORD';"
echo "--------------------------------------password changed--------------------------------------"