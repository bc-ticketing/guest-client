import Vue from 'vue'
import App from './App.vue'
import Vuex from 'vuex'


// Todo: Update this when publishing
// import drizzleVuePlugin from '@drizzle/vue-plugin'
import drizzleVuePlugin from '@drizzle/vue-plugin'
import drizzleOptions from './drizzleOptions'

import router from './router'
import vuetify from './plugins/vuetify'

// setup store
Vue.use(Vuex)
const store = new Vuex.Store({ state: {} })

// setup drizzle
Vue.use(drizzleVuePlugin, { store, drizzleOptions })

// setup Vuetify (styled components)

Vue.config.productionTip = false

new Vue({
  store,
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
