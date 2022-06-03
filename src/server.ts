import express from "express";
import { ApolloServer } from "apollo-server-express";
import cors from "cors";
const { join } = require('path');
import mongoose from 'mongoose';
const { formatError } = require('apollo-errors');
const { loadSchemaSync } = require('@graphql-tools/load');
const { applyMiddleware } = require('graphql-middleware');
const { addResolversToSchema } = require('@graphql-tools/schema');
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');
import depthLimit from "graphql-depth-limit";

import resolvers from "./resolver";
import { RedisSetup } from './cache/redis'


const app = express();
require('dotenv').config();
RedisSetup()

const corsOptions = {
  origin: process.env.UI_HOSTS?.split(','),
  credentials: true,
};

const server = new ApolloServer({
  playground: process.env.NODE_ENV !== 'production' ? true : false,
  formatError,
  subscriptions: false,
  validationRules: [depthLimit(2)], // as a catgeory gets its parent category - highest .
  schema: applyMiddleware(
    addResolversToSchema({
      schema: loadSchemaSync(join(__dirname, './schema', 'schema.graphql'), {
        loaders: [new GraphQLFileLoader()],
      }),
      resolvers,
    }),
    // ...[require('./authentication')],
  ),
  // plugins: [BASIC_LOGGING], // for api log
  context: ({ req, res }) => {
    return { req, res };
  },
  formatResponse: (response, query) => {
    return response;
  },
});

// app.use("*", cors());
mongoose.connect(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DATABASE}`)
  .then((success) => {
    console.log('Mongodb connected')
  })
server.applyMiddleware({ app, path: "/graphql", cors: corsOptions });
const PORT = process.env.PORT || 8000
const HOST = process.env.HOST || 'http://127.0.0.1'
app.listen({ port: PORT }, () => {
  console.log(`Apollo Server on ${HOST}:${PORT}/graphql`);
});
