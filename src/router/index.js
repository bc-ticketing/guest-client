import Vue from "vue";
import Router from "vue-router";
import Home from "../views/Home.vue";

Vue.use(Router);

// route level code-splitting
// this generates a separate chunk (about.[hash].js) for this route
// which is lazy-loaded when the route is visited.
function loadView(view) {
  return () =>
    import(/* webpackChunkName: "view-[request]" */ `@/views/${view}.vue`);
}

export default new Router({
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/event-list",
      name: "event-list",

      component: loadView("EventList"),
    },
    {
      path: "/event/:id",
      name: "event",
      component: loadView("Event"),
    },
    {
      path: "/identification",
      name: "identification",
      component: loadView("Identification"),
    },
    {
      path: "/inventory",
      name: "inventory",
      component: loadView("Inventory"),
    },
    {
      path: "/wallet-funding",
      name: "wallet-funding",
      component: loadView("WalletFunding"),
    },
    {
      path: "/simple-storage",
      name: "simple-storage",
      component: loadView("SimpleStorage"),
    },
    {
      path: "/seating-plan",
      name: "seating-plan",
      component: loadView("SeatingPlan"),
    },
  ],
});
