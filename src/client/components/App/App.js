
import 'styles/main.scss';
import './App.scss';
import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { NOT_FOUND } from 'redux-first-router';
import { getLocationType } from 'state/selectors';
import { hot } from 'react-hot-loader';
import { Home, NotFound } from 'routes';
import { Switcher } from 'components';

export const App = ({ locationType }) => (
  <div className={`${locationType} app-container`}>
    <div className='content-container'>
      <Switcher
        routes={{
          HOME: Home,
          [NOT_FOUND]: NotFound
        }}
      />
    </div>
  </div>
);

App.propTypes = {
  locationType: PropTypes.string
};

export const mapStateToProps = state => ({
  locationType: getLocationType(state)
});

export const ConnectedApp = connect(mapStateToProps)(App); 
export default hot(module)(ConnectedApp);