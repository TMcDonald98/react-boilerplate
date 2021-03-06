// import { redirect } from 'redux-first-router';
import {
  composeThunks,
  fetchPlaceholder
} from './thunks';

export const routesMap = {
  HOME: {
    path: '/',
    thunk: composeThunks(
      fetchPlaceholder,
      // fetchOtherThings <-- multiple thunks can be chained with `composeThunks`
    )
  },

  // example entry
  // PLAY: {
  //   path: '/video/:slug/play',
  //   thunk: (dispatch, getState) => {
  //     if (typeof window === 'undefined') {
  //       const { slug } = getState().location.payload;
  //       const action = redirect({ type: 'VIDEO', payload: { slug } });

  //       dispatch(action);
  //     }
  //   }
  //   role: 'admin'
  // },
};

export const toHome = () => ({ type: 'HOME' });
