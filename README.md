## Install

1. Install node js
2. import file honeypot_db.sql to your db
3. cd express-honey
4. type "npm install" on your terminal or CMD

## Description and How it work?

This project is about honeypot for brute force detection. When client request to server with abnormal request per second on certain honeypot route. Then the server watch the IP and count the request if it abnormal request then server save the IP and then do something.

## How to use it?
1. after cd to express-honey,
2. then type "npm start"

## Route
The target is present at /localhost:3000/login (Where you can test your attacks)

### NOTE:

The correct credentials:
- email : admin@acompany.com
- password : admin123

You can test with several brute force tools.