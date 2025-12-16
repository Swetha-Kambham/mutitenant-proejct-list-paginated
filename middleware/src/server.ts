import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import {
  ApolloServerPluginLandingPageLocalDefault,
} from '@apollo/server/plugin/landingPage/default';

import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { createContext, GraphQLContext } from './context/authContext';

export async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 4000;

  const server = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({
        embed: true, // ✅ GraphQL Playground
      }),
    ],
  });

  await server.start();

  // ✅ ORDER MATTERS — JSON FIRST
  app.use(express.json());
  app.use(cookieParser());

  app.use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    })
  );

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // ✅ GraphQL middleware AFTER json()
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req, res }) =>
        createContext({ req, res }),
    })
  );

  app.listen(PORT, () => {
    console.log('🚀 GraphQL Middleware Ready');
    console.log(`📍 GraphQL Playground: http://localhost:${PORT}/graphql`);
  });
}
