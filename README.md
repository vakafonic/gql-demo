# GQL demo

This is a demo project to show how GraphQL works as a Gateway between microservices.

![Routing](routing.jpg?raw=true "Routing")

## How to run project

1) Install docker + docker-compose
2) Create networks, run `"make init-network"`, if you have conflicts -  ids in brackets may be changed, here is the manual steps
    * docker network create --driver=bridge --subnet=172.{33}.20.0/24 frontend_gateway
    * docker network create --driver=bridge --subnet=172.{34}.20.0/24 backend_services
3) Install all dependencies of a projects by executing `"make init-fe"` and `"make init-be"` 
4) "`docker-compose up`" to start project, I recommend doing that via PhpStorm - to review project logs in separate tabs
5) on your local machine go to http://localhost:4000/  - that will be GQL playground to execute queries

## Interesting files

- docker-compose.yml - to review the components that takes participation in this demo project
- gateway/index.js - all that related to GQL you can find in 1 file, everything is commented
- docker/nginx/conf.d/XXX.conf - configs of nginx - just for insuring that we have 3 different services
- api/src/Controller/XXXXXController.php - contains simple methods and mocked data, you can find data description there

The text above will show how does things works under the hood

## Simple Query

#### Request

```
{
  getTopShows {
    title
    owner {
      username
    }
  }
}
```
#### Logs
```
1614958948354 <-- Making request to stream/top to fetch top stream ids
1614958948358 <-- Stream loader makes request to service with batched ids: 2,3,4
1614958948358 <-- Making request to stream/list to fetch streams by ids 2,3,4
1614958948372 <-- Resolving Stream::owner throughout loader by id: 32
1614958948372 <-- Resolving Stream::owner throughout loader by id: 33
1614958948373 <-- Resolving Stream::owner throughout loader by id: 34
1614958948373 <-- User loader makes request to service with batched ids: 1,2,3
1614958948373 <-- Making request to user/list to fetch users by ids 1,2,3
```
#### Flow

* The GQL fetches the ids[] of Streams, that are in "top" section
* Via the loader GQL tries to fetch Stream models by id's
* When all stream ids are grouped  - GQL makes real request to Stream service to fetch stream by ids
* Fetch users across whole data, so GQL tries to resolve them one by one via UserLoader
* When user data request is compiled - GQL makes real request to User service to fetch user data by ids
* GQL returns data


## More complex queries

Request 

```
{
  getActiveStreams {
    title
    owner{
      username
      avatar{
        url
      }
    }
    thumbnail {
      url
    }
  }
  getTopShows {
    title,
    thumbnail{
      url
    }
    owner {
      username
      avatar{
        url
      }
    }
  }
}
```

Logs

```
1614960073862 <-- Making request to stream/active to fetch active stream ids
1614960073863 <-- Making request to stream/top to fetch top stream ids
1614960073863 <-- Stream loader makes request to service with batched ids: 1,3,2,4
1614960073863 <-- Making request to stream/list to fetch streams by ids 1,3,2,4
1614960073884 <-- Resolving Stream::owner throughout loader by id: 31
1614960073884 <-- Resolving Stream::thumbnail throughout loader by id: 31
1614960073884 <-- Resolving Stream::views throughout loader by id: 31
1614960073884 <-- Resolving Stream::owner throughout loader by id: 33
1614960073885 <-- Resolving Stream::thumbnail throughout loader by id: 33
1614960073885 <-- Resolving Stream::views throughout loader by id: 33
1614960073885 <-- Resolving Stream::thumbnail throughout loader by id: 32
1614960073885 <-- Resolving Stream::owner throughout loader by id: 32
1614960073885 <-- Resolving Stream::views throughout loader by id: 32
1614960073885 <-- Resolving Stream::thumbnail throughout loader by id: 33
1614960073885 <-- Resolving Stream::owner throughout loader by id: 33
1614960073885 <-- Resolving Stream::views throughout loader by id: 33
1614960073885 <-- Resolving Stream::thumbnail throughout loader by id: 34
1614960073886 <-- Resolving Stream::owner throughout loader by id: 34
1614960073886 <-- Resolving Stream::views throughout loader by id: 34
1614960073886 <-- User loader makes request to service with batched ids: 1,2,3
1614960073886 <-- Making request to user/list to fetch users by ids 1,2,3
1614960073886 <-- File loader makes request to service with batched ids: 31,33,32,34
1614960073886 <-- Making request to file/list to fetch files by ids 31,33,32,34
1614960073887 <-- Views loader makes request to service with batched ids: 1,3,2,4
1614960073887 <-- Making request to stream/views to fetch stream views by stream ids 1,3,2,4
1614960073899 <-- Resolving User::avatar throughout loader by id: 1
1614960073899 <-- Resolving User::avatar throughout loader by id: 2
1614960073899 <-- Resolving User::avatar throughout loader by id: 3
1614960073899 <-- Resolving User::avatar throughout loader by id: 1
1614960073900 <-- Resolving User::avatar throughout loader by id: 2
1614960073900 <-- File loader makes request to service with batched ids: 1,2,3
1614960073900 <-- Making request to file/list to fetch files by ids 1,2,3
```
#### Flow

* The GQL gets id's[] of Streams, that are in "active" section, and in the "top" section (because there are 2 queries in 1 post body)
* Via the loader GQL tries to fetch Stream models by the id's
* When all stream ids are grouped  - GQL makes real request to Stream service to fetch stream by ids
* GQL tries to resolve next level - with owners, views count and thumbnails, using data loaders
* After all data aggregated - GQL asks BE for UserData, ViewsCount and File data with one request for each type (but not entity)
* Next level of deepness - is to fetch users avatars from file service, so we will collect it via the loader and then make batch request

Take note that GQL will not ask service for same entity twice in one request scope
