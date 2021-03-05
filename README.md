This is a demo project to show how GraphQL works as a Gateway between microservices.

![Routing](routing.jpg?raw=true "Routing")

How to run project

1) Install docker + docker-compose
2) Create networks, run `"make init-network"`, if you have conflicts -  ids in brackets may be changed, here is the manual steps
    * docker network create --driver=bridge --subnet=172.{33}.20.0/24 frontend_gateway
    * docker network create --driver=bridge --subnet=172.{34}.20.0/24 backend_services
3) Install all dependencies of a projects by executing `"make init-fe"` and `"make init-be"` 
4) "`docker-compose up`" to start project, I recommend doing that via PhpStorm - to review project logs in separate tabs
5) on your local machine go to http://localhost:4000/  - that will be GQL playground to execute queries

Interesting files

- docker-compose.yml - to review the components that takes participation in this demo project
- gateway/index.js - all that related to GQL you can find in 1 file, everything is commented
- docker/nginx/conf.d/XXX.conf - configs of nginx - just for insuring that we have 3 different services
- api/src/Controller/XXXXXController.php - contains simple methods and mocked data, you can find data description there

