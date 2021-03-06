Link to the presentation! https://docs.google.com/presentation/d/1291yyit73I7pWa_NzgzYOuPLUV54ywfQongU4AbUNWs/edit?usp=sharing

# React boilerplate

This is a React/Redux/Webpack-based boilerplate client application with routing, networking, styles, state, components and testing.

- [Setup](#setup)
- [Usage](#usage)
  - [Development](#development)
  - [Hot Reloading](#hot-reloading)
  - [Production](#production)
- [State](#state)
- [Routing](#routing)
- [Networking](#networking)
  - [Auth](#auth)
- [Styles](#styles)
- [Testing](#testing)
  - [Coverage Report](#coverage-report)
  - [Snapshots](#snapshots)

# Setup

- `npm i` to install packages.
- Setup an `env.js` file from the `env.js.template`.
 - In `env.js`, you set the value of `activeHosts` to select which environment context to use.
 - The environment context, or the service -> url maps, are configured in `app.js`.
 
```javascript
// app.js
serviceHosts: {
  default: {
    serviceHost1: 'http://host:port',
    serviceHost2: 'http://host:port'
  },
  production: {
    serviceHost1: 'http://host:port',
    serviceHost2: 'http://host:port'
  }
}

// ...

// env.js
activeHosts: 'production',
 ```

# Usage

## Development

For the development server, use `npm run dev`. This will build files to memory and host the app by default on `http://localhost:9080` using `webpack-dev-server`.

For the server, do `npm run server:dev`. This will build the server files and execute them, hosted on `http://localhost:3000` by default. There is no hot reloading for the server yet, so you will have to rebuild the files every time you make a change.

### Hot Reloading

Routes are switched by dynamically loading components in the `App` parent component. This means that to maintain hot reloading, you have to wrap all of those top-level route components with the `hot` function from `react-hot-loader`.

```javascript
import { hot } from 'react-hot-loader';

const Home from () => <div />;

export const hot(module)(Home);
```

No need to wrap any other components, just the dynamically loaded ones serving as top-level route components such as `src/routes/Home/Home` and `src/routes/NotFound/NotFound`.

You can find more information in the [Routing](#routing) section of this readme.

## Production

To build the production verson of the app, use `npm run start`. This will build the production client and server assets and run the production server, which is hosted on on port 80 by default.

Alternatively, if you've already built the assets, you can simply use `npm run server` to start the server.

# State

This repo uses `redux` as its global data store. `redux` utilizes three core components: `reducers`, `selectors` and `actions`.

* `reducers` manage a branch of the state tree, such as `state.auth` or `state.location`. They do this by accepting an action object, which contains information about which part of the tree to change and what to change it with. In a reducer, remember to ALWAYS return a brand new state object! A reducer looks like this:

```javascript
const initialState = {
  data: {}
};

const auth = (state = initialState, action) => {
  switch(action.type) {
    case constants.setData:
      return {
        ...state, // <-- this creates a shallow clone of the old state object
        data: action.payload
      };
    case constants.clearData:
      return {
        ...state,
        data: initialState.data
      };
    default:
      return state;
  }
};
```

* `actions` generate the object that selects a case in a reducer. They always include a `type` key, which matches a switch case in a reducer, and sometimes a `payload` key, which contains information about how to modify the state. Actions look like this:

```javascript
import { constants } from 'app';

export const setData = data => ({
  type: constants.setData,
  payload: data
});
export const clearData = data => ({
  type: constants.setData
});
```

* `selectors` fetch the desired data from the state tree. This step is helpful in memoizing state lookups to make it faster. This repo uses `reselect` for selector memoization. Selectors look like this:

```javascript
import { createSelector } from 'reselect';
import { getKey } from 'state/selectors';

export const getData = state => state?.auth?.data;
/** The `?` operator conditionally accesses properties.
 * If the property is undefined, it won't throw an error,
 * It will simply return undefined.
 * Functionally equivalent to writing:
 * export const getData = state => state && state.auth && state.auth.data
 **/

export const getDataByKey = createSelector(
  getKey, // <-- this `getKey` function is passed the entire state tree and selects the current key.
  getData, // <-- this function, which is just defined right above, gets the current auth data.
  (key, data) => data[key] // <-- the order of the arguments (key, data) matches the order of the selectors.
);
/** This function uses `createSelector` from `reselect`.
 * It passes the state object through each selector callback,
 * and the final callback gets the results of each selector
 * in the order it was executed.
 **/
```

The pattern of the `state` directory tree is designed to make importing easier. Different branches of the state tree are kept under `modules`, and each module has up to three files: `reducer.js`, `selectors.js` and `actions.js`.

These files are exported from the `reducers.js`, `selectors.js` and `actions.js` files in `src/state`. The result of this is that you can import any of the selectors and actions without having to remember which branch of the state tree they belong in:

```javascript
import { getLocationType } from 'state/selectors';
import { setPlaceholderData } from 'state/actions';
```

# Routing

This repo uses a client-side routing solution, or CSR, with the `redux-first-router` library. Based on `redux` state and the HTML5 history api, top-level components are switched to simulate 'routes'. You can find these top-level components in `src/routes`.

The route map is found at `src/routes/routesMap.js`. In this file, you can define what `thunks` (functions that return a promise) are automatically invoked when going to that route. For example, this could be useful to fetch data user data from the server when going to a 'settings' page.

NOTE: You can use the `composeThunks` function to chain multiple thunks together on a route. Please note that if one of those thunks reject a promise, it will not execute rest of the thunks in that chain.

In your application, you can change the route, such as in an event handler, by dispatching actions that change the route in `redux`. These actions can be found at the bottom of the routesMap, for example, `toHome`.

```javascript
import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toHome as _toHome } from 'routes';

const Component = ({ toHome }) => (
  <a onClick={toHome}>Go home!</a>
);

Component.propTypes = {
  toHome: PropTypes.func.isRequired
};

const mapDispatchToProps = {
  toHome: _toHome
};
/**
 * Note how the above `mapDispatchToProps` is an object
 * and not a function that accepts the dispatch parameter.
 * When you do this, all the object values are
 * automatically wrapped in the dispatch function, as if you wrote:
 * 
 * const mapDispatchToProps = dispatch => ({
 *  toHome: () => dispatch(_toHome)
 * });
 **/
export default connect(null, mapDispatchToProps)(Component);
```

## CSR Servers

Because routing is handled by the client, it's important to remember that the server must listen for all traffic and serve the index.html file at the root, like below. There is currently a server bundled with the repo that handles this, but it's still good to note.

```javascript
app.get('/*', (req, res) => {
  console.log(`GET ${req.headers.host}${req.url}`);
  res.sendFile(__dirname + '/public/index.html'), err => {
    if (err) res.status(500);
  };
});
```

# Networking

Network requests are made using the `client` class found in `src/client`. You can import it like so:

```javascript
import client from 'client';
```

The `client` makes available all functions kept in the `dao` folder. These functions look like this:

```javascript
export const getPlaceholder = (
  { request, serviceHosts }, // <-- this is the client context, e.g. 'this'
  limit = 30
) => request({
  path: `/v1/placeholder`,
  service: serviceHosts.serviceHost1,
  method: 'GET',
  auth: false,
  params: {
    limit
  }
});
```

Each of these functions has the `client` class context injected as its first argument in a Python-like style. Each one of these functions must also return a promise.

After importing the client in a component, it can be used like so:

```javascript
// App.js
// ...
import client from 'client';

export class App from React.Component {
  // ...
  get20MoreData = async () => {
    const { setData } = this.props;
    const limit = 20;
    const moreData = await client.getPlaceholder(20);
    
    // set data in redux
    setData(moreData);
    // maybe return it to this method caller
    return moreData;
  }
  // ...
}
```

## Auth

The client also supports adding api keys to certain routes. It looks for the api key in `redux` by default in the `auth` branch. Check the `src/client` file for more info.

# Styles

This repo uses `scss` for its styles. App-wide styles can be found in `src/styles`. The boilerplate includes a few related to animation and the `react-transition-group`, a base set of typography, a font, and some useful mixins.

All other component-level stylesheets are kept with the components themselves. They are usually imported at the top of the component like so:

```javascript
// App.js
import './App.scss';
import * as React from 'react';
// ...
```

In a component-level stylesheet, you can import global variables, mixins, keyframes etc. by putting this at the top:

```scss
@import 'globals.scss';
```

The `scss` loader will make those available. Add more to globals by importing it in `src/styles/_globals.scss`.

# Testing

This repo uses `jest` for testing. Use `npm run test` to run tests and prepare a coverage report.

You can also use `npm run jest:watch` to watch files for changes among other things.

## Coverage Report

The coverage report is an easy way to look at your code coverage. It's found in `./coverage/lcov-report/index.html`.

## Snapshots

Snapshots are a great way for Jest to save time. Snapshots cache the output of a test, and then compare future tests against that cached data. If there is any difference, it notifies you. Please note: it's important to remember to check the snapshots themselves to verify the output!

To update snapshots, use `npm run jest:update`.

