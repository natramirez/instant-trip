import Base from './components/Base.jsx';
import HomePage from './components/HomePage.jsx';
import DashboardPage from './containers/DashboardPage.jsx';
import SuggestionsPage from './containers/SuggestionsPage.jsx';
import LoginPage from './containers/LoginPage.jsx';
import SignUpPage from './containers/SignUpPage.jsx';
import ItineraryPage from './containers/ItineraryPage.jsx'
import Auth from './modules/Auth';

// import module for trip plan in progress


const routes = {
  // base component (wrapper for the whole application).
  component: Base,
  childRoutes: [
    {
      path: '/',
      getComponent: (location, callback) => {
        if (Auth.isUserAuthenticated()) {
          callback(null, DashboardPage);
        } else {
          callback(null, HomePage);
        }
      }
    },
    {
      path: '/suggestions',
      component: SuggestionsPage
      // getComponent: (location, callback) => {
      //     callback(null, SuggestionsPage);
      // }
      // component: SuggestionsPage
      // getComponent: (location, callback) => {
        // if (Auth.isUserAuthenticated()) { //if plan in progress
        //   callback(null, DashboardPage); //SuggestionsPage
        // } else {
          // callback(null, DashboardPage);
        // }
      // }
    },
    {
      path: '/itinerary',
      component: ItineraryPage
    },

    {
      path: '/login',
      component: LoginPage
    },

    {
      path: '/signup',
      component: SignUpPage
    },

    {
      path: '/logout',
      onEnter: (nextState, replace) => {
        Auth.deauthenticateUser();

        // change the current URL to /
        replace('/');
      }
    }

  ]
};

export default routes;
