import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';
// Import router into your Vuex store
// import router from '.../router'; // Adjust the path as needed
import { router } from '/src/main';
const store = createStore({
  state() {
    return {
      token: null, 
      user: null,
      role: null,
      userId:null,
    };
  },
  mutations: {
    setToken(state, token) {
      state.token = token;
    },
    setUser(state, user) {
      state.user = user;
    },
    setRole(state, role) {
      state.role = role;
    },
    clearAuthData(state) {
      state.token = null;
      state.user = null;
      state.role = null;
      state.UserId = null;
    },
    setUserId(state, userId) {
      state.userId =userId; // Mutation to set the userId
    },
  },
  actions: {
    login({ commit }, authData) {
      commit('setToken', authData.token);
      commit('setUser', authData.user);
      commit('setRole', authData.role);
      store.commit('setUserId',  authData.user.$id);
        router.push({ path:'/user/create' });
    },
    logout({ commit }) {
      commit('clearAuthData');
      // router.push('/');
    },
  },
  getters: {
    isAuthenticated(state) {
      return !!state.token;
    },
    getUser(state) {
      return state.user;
    },
    getRole(state) {
      return state.role;
    },
  },
  plugins: [
    createPersistedState({
      paths: ['token', 'user', 'role'], // Persist only these parts of the state
      storage: window.sessionStorage, // Use sessionStorage to persist data only for the session
    }),
  ],
});

export default store;
