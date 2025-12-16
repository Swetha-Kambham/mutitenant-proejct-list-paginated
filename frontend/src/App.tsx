import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './apollo/client';
import { AppRouter } from './routes/AppRouter';
import './styles.css';

export function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AppRouter />
    </ApolloProvider>
  );
}
