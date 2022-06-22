import Vue from 'vue'
import Vuex from 'vuex'
// import createPersistedState from 'vuex-persistedstate'

import {
  MUTATION_POSTERS,
  MUTATION_CURRENT_USER,
  MUTATION_DELETE_POSTER,
} from '@/const'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    posters: [],
    currentUser: null,
    checkedLogin: false,
  },
  mutations: {
    [MUTATION_POSTERS](state, posters) {
      state.posters = mergeByKey(state.posters, posters)
    },
    [MUTATION_DELETE_POSTER](state, id) {
      state.posters = state.posters.filter((p) => p.id !== id)
    },
    [MUTATION_CURRENT_USER](state, user) {
      state.checkedLogin = true
      state.currentUser = user
      state.posters = []
    },
  },
  actions: {},
  getters: {
    posterById: (state) => (id) => {
      return state.posters.find((poster) => poster.id === id)
    },
  },
  // plugins: [createPersistedState()]
})

/** Returns a shallow copy of setB merged into setA by comparing element.id */
export function mergeByKey(targetArray, toInsert, key = 'id') {
  let output = Array.from(targetArray)
  toInsert.forEach((value) => {
    let index = output.findIndex((existing) => existing[key] === value[key])
    if (index === -1) output.push(value)
    else output[index] = value
  })
  return output
}
