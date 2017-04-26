// React parts
import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Browser routing
import { BrowserRouter } from 'react-router-dom';

// Apollo Provider. This HOC will 'wrap' our React component chain
// and handle injecting data down to any listening component
import { ApolloProvider } from 'react-apollo';

// Grab the shared Apollo Client
import { browserClient } from '../lib/apollo';

// Custom redux store creator.  This will allow us to create a store 'outside'
// of Apollo, so we can apply our own reducers and make use of the Redux dev
// tools in the browser
import createNewStore from '../lib/redux';

// Root component.  This is our 'entrypoint' into the app.  If you're using
// the ReactQL starter kit for the first time, `src/app.js` is where
// you can start editing to add your own code
import App from '../app';

// Create a new browser Apollo client
const client = browserClient();

// Create a new Redux store
const store = createNewStore(client);

ReactDOM.render(
  <ApolloProvider store={store} client={client}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ApolloProvider>,
  document.getElementById('main'),
);
