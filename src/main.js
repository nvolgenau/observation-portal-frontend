import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import '@/assets/css/main.css';
import $ from 'jquery';
import { addCsrfProtection } from '@/utils.js';

$(document).ajaxSend(addCsrfProtection);

Vue.use(BootstrapVue);

Vue.config.productionTip = false

const getRuntimeConfig = async () => {
  const runtimeConfig = await fetch('/config/urls.json');
  return await runtimeConfig.json();
}

getRuntimeConfig().then(function(json) {
  store.commit('setRuntimeConfig', {
    observationPortalApi: process.env.VUE_APP_OBSERVATION_PORTAL_API_URL || json.observationPortalApiUrl,
    archiveApi: process.env.VUE_APP_ARCHIVE_API_URL || json.archiveApiUrl,
    archiveClient: process.env.VUE_APP_ARCHIVE_CLIENT_URL || json.archiveClientUrl,
    simbadService: process.env.VUE_APP_SIMBAD_SERVICE_URL || json.simbadServiceUrl,
    thumbnailService: process.env.VUE_APP_THUMBNAILS_SERVICE_URL || json.thumbnailServiceUrl,
  });

  // Include credentials when sending requests to the observation portal.
  $(document).ajaxSend(function(event, xhr, settings) {
    if (settings.url.startsWith(store.state.urls.observationPortalApi)) {
      settings.xhrFields = {
        withCredentials: true
      };
    }
  });

  // Add the archive token to a request being sent to the archive api or the thumbservice
  $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
    if ((options.url.indexOf(store.state.urls.archiveApi) >= 0 || options.url.indexOf(store.state.urls.thumbnailService) >= 0) && store.state.archiveToken) {
      jqXHR.setRequestHeader('Authorization', 'Token ' + store.state.archiveToken);
    }
  });

  store.dispatch('getProfileData').then(() => {
    new Vue({
      router,
      store,
      render: h => h(App)
    }).$mount('#app')
  }).catch(() => {
    // TODO: Display error page
    console.log('Error getting profile data')
  })
});
