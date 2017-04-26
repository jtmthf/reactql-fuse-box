// ----------------------
// IMPORTS

// React
import * as React from 'react';

// GraphQL
import { gql, graphql, InjectedGraphQLProps } from 'react-apollo';

// Routing
import { Link, Route, match, RouteComponentProps } from 'react-router-dom';

// <Helmet> component for setting the page title
import Helmet from 'react-helmet';

import { compose, pure } from 'recompose';

// Styles
import './styles.global.css';
import css from './styles.css';
import sass from './styles.scss';
import less from './styles.less';

// Get the ReactQL logo.  This is a local .svg file, which will be made
// available as a string relative to [root]/dist/assets/img/
import * as logo from './reactql-logo.svg';

// ----------------------

// We'll display this <Home> component when we're on the / route
const Home = () => (
  <h1>You&apos;re on the home page - click another link above</h1>
);

export interface PageProps {
  match: match<{ name: string }>;
}

// Helper component that will be conditionally shown when the route matches.
// This gives you an idea how React Router v4 works
const Page: React.SFC<RouteComponentProps<{ name: string }>> = ({ match }) => (
  <h1>Changed route: {match.params.name}</h1>
);

// Stats pulled from the environment.  This demonstrates how data will
// change depending where we're running the code (environment vars, etc)
// and also how we can connect a 'vanilla' React component to an RxJS
// observable source, and feed eventual values in as properties
const Stats = () => {
  const info = [
    ['Environment', process.env.NODE_ENV],
    ['Running', process.env.SERVER ? 'On the server' : 'In the browser'],
  ];

  return (
    <ul className={css.data}>
      {info.map(([key, val]) => (
        <li key={key}>{key}: <span>{val}</span></li>
      ))}
    </ul>
  );
};

// Now, let's create a GraphQL-enabled component...

// First, create the GraphQL query that we'll use to request data from our
// sample endpoint
const query = gql`
  query {
    allMessages(first:1) {
      text
    }
  }
`;

interface MessageData {
  allMessages?: Array<{
    text: string;
  }>;
}

// ... then, let's create the component and decorate it with the `graphql`
// HOC that will automatically populate `this.props` with the query data
// once the GraphQL API request has been completed
const connect = compose<InjectedGraphQLProps<MessageData>, {}>(
  graphql(query),
  pure
);

const GraphQLMessage = connect(({ data }) => {
  const message = data!.allMessages && data!.allMessages![0].text;
  const isLoading = data!.loading ? 'yes' : 'nope';
  return (
    <div>
      <h2>Message from GraphQL server: <em>{message}</em></h2>
      <h2>Currently loading?: {isLoading}</h2>
    </div>
  );
});

// Example of CSS, SASS and LESS styles being used together
const Styles = () => (
  <ul className={css.styleExamples}>
    <li className={css.example}>Styled by CSS</li>
    <li className={sass.example}>Styled by SASS</li>
    <li className={less.example}>Styled by LESS</li>
  </ul>
);

// Export a simple component that allows clicking on list items to change
// the route, along with a <Route> 'listener' that will conditionally display
// the <Page> component based on the route name
export default () => (
  <div>
    <Helmet>
      <title>ReactQL application</title>
      <meta name="description" content="ReactQL starter kit app" />
    </Helmet>
    <div className={css.hello}>
      <img src={logo} alt="ReactQL" className={css.logo} />
    </div>
    <hr />
    <GraphQLMessage />
    <hr />
    <ul>
      <li><Link to="/">Home</Link></li>
      <li><Link to="/page/about">About</Link></li>
      <li><Link to="/page/contact">Contact</Link></li>
    </ul>
    <hr />
    <Route exact path="/" component={Home} />
    <Route path="/page/:name" component={Page} />
    <hr />
    <p>Runtime info:</p>
    <Stats />
    <hr />
    <p>Stylesheet examples:</p>
    <Styles />
  </div>
);
