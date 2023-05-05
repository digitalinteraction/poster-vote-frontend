import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/AppHome.vue'

import {
  ROUTE_HOME,
  ROUTE_LIST_POSTERS,
  ROUTE_SHOW_POSTER,
  ROUTE_ADD_POSTER,
  ROUTE_EDIT_POSTER,
  ROUTE_WEB_CONSOLE,
} from '@/const'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: ROUTE_HOME,
      component: Home,
      meta: { title: 'Home' },
    },
    {
      path: '/posters',
      name: ROUTE_LIST_POSTERS,
      component: () =>
        import(/* webpackChunkName: "posters" */ './views/ListPosters.vue'),
      meta: { title: 'Your Posters' },
    },
    {
      path: '/posters/add',
      name: ROUTE_ADD_POSTER,
      component: () =>
        import(/* webpackChunkName: "posters" */ './views/AddPoster.vue'),
      meta: { title: 'Add Poster' },
    },
    {
      path: '/posters/:id',
      name: ROUTE_SHOW_POSTER,
      component: () =>
        import(/* webpackChunkName: "posters" */ './views/ShowPoster.vue'),
      meta: { title: 'View Poster' },
    },
    {
      path: '/posters/:id/edit',
      name: ROUTE_EDIT_POSTER,
      component: () =>
        import(/* webpackChunkName: "posters" */ './views/EditPoster.vue'),
      meta: { title: 'Edit Poster' },
    },
    {
      path: '/console',
      name: ROUTE_WEB_CONSOLE,
      component: () =>
        import(/* webpackChunkName: "console" */ './views/WebConsole.vue'),
      meta: { title: 'Web Console' },
    },
  ],
})

router.afterEach((route) => {
  const brand = 'PosterVote'
  const pageTitle = route.meta && route.meta.title

  Vue.nextTick(() => {
    document.title = [pageTitle, brand].filter((s) => s).join(' | ')
  })
})

export default router
