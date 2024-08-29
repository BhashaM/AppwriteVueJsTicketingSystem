import { ID } from "appwrite";
import { account } from "../../appwrite";
import { reactive } from "vue";
//import { router } from '/src/main';

import store from '../store';
export const user = reactive({
  current: null,
  
  async init() {
    
    try {
      
      this.current = await account.get();
    } catch (e) {
      this.current = null;
    }
  },
  async register(email, password) {
    await account.create(ID.unique(), email, password);
    await this.login(email, password);
  },
  mutations: {
    SET_USER_ID(state, userId) {
      state.userId = userId;
    },
    // other mutations
  },
  async login(email, password) {
    try {
      await account.createEmailPasswordSession(email, password);
      
      // Retrieve user details after login
      const userDetails = await account.get();

      // Commit user details to Vuex store
      store.commit('setUser', userDetails);
      store.commit('SET_USER_ID', userDetails.userId);
      store.commit('setToken', userDetails.$id); // Assuming the session ID as a token

      window.location.href = "/create"; // Redirect to the desired page
    } catch (error) {
      console.error('Login failed:', error);
      // Handle the error (e.g., show a notification to the user)
    }
  },


  // async login(email, password) {
  //   await account.createEmailPasswordSession(email, password);
  //    // Retrieve user details after login
  //    const user = await account.get();
  //    commit('setUserId', user.$id); // Store userId in Vuex

  //    // Assuming authData includes token, user, and role
  //    commit('setToken', authData.token);
  //    commit('setUser', authData.user);
  //    commit('setRole', authData.role);
  //    window.location.href = "/create"; // Redirect to home page
  //   //router.push('/create'); // Ensure this path is correct
  // },
  async logout() {
    await account.deleteSession("current");
    this.current = null;
  },
});


