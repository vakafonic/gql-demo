// Whole project will be using TypeScript
const {ApolloServer, gql} = require('apollo-server');
const {RESTDataSource} = require('apollo-datasource-rest');
const DataLoader = require('dataloader');

//----------------------------------------------------------------------------------------------------------------------
// Definition of Frontend Interface, called GQL schema
// This will be situated into different files using split context
//----------------------------------------------------------------------------------------------------------------------
const typeDefs = gql`
  # Objects description + links
  type User {
    id: Int
    username: String
    avatar: File
  }
  
  type File {
    id: Int,
    name: String,
    url: String
  }

  type Stream {
    id: Int,
    title: String
    thumbnail: File,
    owner: User
    views: Int
  }

  # Available "endpoints"
  type Query {
    getLoggedInUserInfo: User
    getActiveStreams: [Stream]
    getTopShows: [Stream]
    getStream(id: Int): Stream
  }
`;


//----------------------------------------------------------------------------------------------------------------------
// Definition of Resolvers - mapping data sources to GQL structure
// Resolvers is kind of aggregators that solving n+1 + it works like a cache
// in one request (If you will ask for already loaded entity
// - it will be returned without querying real service)
//----------------------------------------------------------------------------------------------------------------------

const resolvers = {
    Query: { // resolvers for your "endpoints"
        getLoggedInUserInfo: async (_source, {}, {dataSources, dataLoaders}) => {
            return dataLoaders.userLoader.load(await dataSources.user.getLoggedInUser());
        },
        getActiveStreams: async (_source, {}, {dataSources, dataLoaders}) => {
            return dataLoaders.streamLoader.loadMany(await dataSources.stream.getActiveStreams());
        },
        getTopShows: async (_source, {}, {dataSources, dataLoaders}) => {
            return dataLoaders.streamLoader.loadMany(await dataSources.stream.getTopShows());
        },
        getStream: async (_source, {id}, {dataLoaders}) => {
            return dataLoaders.streamLoader.load(id);
        },
    },
    User: { // resolvers of entity fields - if we dont have this data from BE when fetching users - this resolvers will be called
        // so the GQL entities could be compiled from different data sources
        // in this particular case - User::avatar has File type and will be loaded using avatar_file_id from cdn service
        avatar: async (parent, {}, {dataLoaders}) => {
            console.log( Date.now()  + ' <-- Resolving User::avatar throughout loader by id: ' + parent.avatar_file_id);
            return dataLoaders.fileLoader.load(parent.avatar_file_id)
        }
    },
    Stream: {
        thumbnail: async (parent, {}, {dataLoaders}) => {
            console.log( Date.now()  + ' <-- Resolving Stream::thumbnail throughout loader by id: ' + parent.thumbnail_file_id);
            return dataLoaders.fileLoader.load(parent.thumbnail_file_id) // using this dataloader the same files will be not loaded twice from service
                                                                         // like if you have Stream in two outputs - top and live sections
        },
        owner: async (parent, {}, {dataLoaders}) => {
            console.log( Date.now()  + ' <-- Resolving Stream::owner throughout loader by id: ' + parent.thumbnail_file_id);
            return dataLoaders.userLoader.load(parent.owner_id) // this optimization uses dataloader to do not load user as each request
        },
        views: async (parent, {}, {dataLoaders}) => {
            console.log( Date.now()  + ' <-- Resolving Stream::views throughout loader by id: ' + parent.thumbnail_file_id);
            return dataLoaders.viewsLoader.load(parent.id) // just a demo to fetch Stream::views directly from views service
        }
    }
};

//----------------------------------------------------------------------------------------------------------------------
// Definition of API objects, that uses simple rest. For future we will use some proto libs to connect to services
//----------------------------------------------------------------------------------------------------------------------

class UsersAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'http://userapiaddr.loc/';
    }

    async getLoggedInUser() {
        console.log( Date.now()  + ' <-- Making request to user/logged to fetch id');
        return await this.get(`user/logged`);
    }

    async getUsers(ids) {
        console.log( Date.now()  + ' <-- Making request to user/list to fetch users by ids ' + ids);
        return this.post(`user/list`, {ids: ids});
    }
}

class CDNAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'http://cdnapiaddr.loc/';
    }

    async getFilesList(ids) {
        console.log( Date.now()  + ' <-- Making request to file/list to fetch files by ids ' + ids);
        return this.post(`file/list`, {ids: ids});
    }
}

class StreamAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'http://streamapiaddr.loc/';
    }

    async getActiveStreams() {
        console.log( Date.now()  + ' <-- Making request to stream/active to fetch active stream ids');
        return this.get(`stream/active`);
    }

    async getTopShows() {
        console.log( Date.now()  + ' <-- Making request to stream/top to fetch top stream ids');
        return this.get(`stream/top`);
    }

    async getStreamList(ids) {
        console.log( Date.now()  + ' <-- Making request to stream/list to fetch streams by ids ' + ids);
        return this.post(`stream/list`, {ids: ids});
    }

    async getStreamViews(ids) {
        console.log( Date.now()  + ' <-- Making request to stream/views to fetch stream views by stream ids ' + ids);
        return this.post(`stream/views`, {ids: ids});
    }
}


//----------------------------------------------------------------------------------------------------------------------
// Definition of Server that would handle requests
// Server is our app general object
//----------------------------------------------------------------------------------------------------------------------

const realDataSources = { // to access them from outer code
    user: new UsersAPI(),
    cdn: new CDNAPI(),
    stream: new StreamAPI(),
};

const server = new ApolloServer({
    typeDefs,   // gql schema goes here
    resolvers,  // resolve functions
    dataSources: () => realDataSources,  // API objects
    context: ({req}) => ({
        // context will be created on each request, that is why for different request
        // will have new dataloaders without cache
        req,
        dataLoaders: {
            userLoader: new DataLoader(loadUsers),
            streamLoader: new DataLoader(loadStreams),
            fileLoader: new DataLoader(loadFiles),
            viewsLoader: new DataLoader(loadViews)
        },
    }),
});

//----------------------------------------------------------------------------------------------------------------------
// Definition of Data loaders - methods that collects requests to fetch some models,
// and then - makes batch request to fetch them
//----------------------------------------------------------------------------------------------------------------------

async function loadFiles(ids) {
    console.log( Date.now()  + ' <-- File loader makes request to service with batched ids: ' + ids);
    const res = await realDataSources.cdn.getFilesList(ids);
    return ids.map(id => res[id]);
}

async function loadStreams(ids) {
    console.log( Date.now()  + ' <-- Stream loader makes request to service with batched ids: ' + ids);
    const res = await realDataSources.stream.getStreamList(ids);
    return ids.map(id => res[id]);
}


async function loadViews(ids) {
    console.log( Date.now()  + ' <-- Views loader makes request to service with batched ids: ' + ids);
    const res = await realDataSources.stream.getStreamViews(ids);
    return ids.map(id => res[id]);
}

async function loadUsers(ids) {
    console.log( Date.now()  + ' <-- User loader makes request to service with batched ids: ' + ids);
    const res = await realDataSources.user.getUsers(ids);
    return ids.map(id => res[id]);
}


//----------------------------------------------------------------------------
// Application start + subscription on process lifecycle
//----------------------------------------------------------------------------

server.listen().then(({url}) => {
    console.log(`You can start playing with GQL using this url ${url}`);
});


