import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Tools from '../views/Tools.vue';
import NotFound from '../views/NotFound.vue';
import Login from '../views/Login.vue';
import Profile from '../views/Profile.vue';
import Register from '../views/Register.vue'
import AcceptTerms from '../views/AcceptTerms.vue';
import AccountsPassthroughGetPage from '../views/AccountsPassthroughGetPage.vue';
import AccountsPassthroughFormPage from '../views/AccountsPassthroughFormPage.vue';
import store from '../store/index.js';
import _ from 'lodash';
import $ from 'jquery';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      title: 'Submitted Requests'
    }
  },
  {
    path: '/help',
    name: 'help',
    // route level code-splitting
    // this generates a separate chunk (help.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "help" */ '../views/Help.vue'),
    meta: {
      title: 'Help'
    }
  },
  {
    path: '/proposals',
    name: 'proposals',
    // TODO: Update with proposals component
    component: NotFound
  },
  {
    path: '/proposals/:id',
    name: 'proposalsDetail',
    // TODO: Update component
    component: NotFound
  },
  {
    path: '/requestgroups/:id',
    name: 'requestgroupsDetail',
    // TODO: Update component
    component: NotFound
  },
  {
    path: '/apply',
    name: 'apply',
    // TODO: Update with sciapplications component
    component: NotFound
  },
  {
    path: '/create',
    name: 'create',
    // TODO: Update with create component
    component: NotFound
  },
  {
    path: '/tools',
    name: 'tools',
    component: Tools,
    meta: {
      title: 'Planning Tools'
    }
  },
  {
    path: '/accounts/profile',
    name: 'profile',
    component: Profile,
    meta: {
      title: 'Profile'
    }
  },
  {
    path: '/accounts/login',
    name: 'login',
    component: Login,
    meta: {
      title: 'Log in'
    }
  },
  {
    path: '/accounts/register',
    name: 'register',
    component: Register,
    meta: {
      title: 'Register for an account'
    }
  },
  {
    path: '/accounts/password/reset',
    name: 'passwordReset',
    component: AccountsPassthroughFormPage
  },
  {
    path: '/accounts/password/change',
    name: 'passwordChange',
    component: AccountsPassthroughFormPage
  },
  {
    path: '/accounts/removalrequest',
    name: 'accountRemoval',
    component: NotFound
  },
  {
    path: '/accounts/acceptterms',
    name: 'acceptTerms',
    component: AcceptTerms,
    meta: {
      title: 'Accept Terms'
    }
  },
  {
    path: '/accounts/*',
    name: 'AccountsPassthroughGetPage',
    component: AccountsPassthroughGetPage,
    meta: {
      title: 'Accounts'
    }
  },
  { 
    path: '*',
    name: 'notFound',
    component: NotFound
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

router.beforeEach((to, from, next) => {
  // Set the title of each page
  const baseTitle = _.split(document.title, '|')[0];
  const nearestWithTitle = to.matched.slice().reverse().find(r => r.meta && r.meta.title);
  // If a route with a title was found, set the document (page) title to that value.
  if (nearestWithTitle) {
    document.title = baseTitle + ' | ' + nearestWithTitle.meta.title;
  } else {
    document.title = baseTitle;
  }
  next();
})

router.beforeEach((to, from, next) => {
  // Redirect to the Accept Terms page if the user is logged in but has not
  // yet accepted the terms.
  if (!store.state.profileDataRetrieved) {
    $.ajax({
      url: store.state.urls.observationPortalApi + '/api/profile/',
      success: function (response) {
        store.commit('setProfileData', response);
      },
      error: function(response) {
        if (response.status === 403) {
          // Tried to get profile data, but are not authenticated.
          store.commit('setProfileDataAsRetrieved')
        }
      },
      // Need to wait for profile information to load before moving on to the next step as
      // that contains whether a user has accepted terms or not.
      async: false
    });
  }
  if (store.state.userIsAuthenticated && !store.state.profile.profile.is_staff && !store.state.userAcceptedTerms && to.name !== 'acceptTerms') {
    next({ name: 'acceptTerms' });
  } else {
    next();
  }
});

export default router;
