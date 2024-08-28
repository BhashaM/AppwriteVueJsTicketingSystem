import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { createRouter, createWebHistory } from 'vue-router';
import store from './components/store';
import Cookies from 'js-cookie';
import LayoutDiv from './components/LayoutDiv.vue';
import MainLayout from './components/MainLayout.vue';
import UserLogin from './components/pages/UserLogin';
import UserRegisterTemplate from './components/pages/UserRegisterTemplate.vue';
import AdminTicketList from './components/adminPages/AdminTicketList';
import EmployeeCreate from './components/adminPages/EmployeeCreate.vue';
import EmployeeList from './components/adminPages/EmployeeList.vue';
import ManageTicket from './components/adminPages/ManageTicket';
import ManageProrityType from './components/adminPages/ManageProrityType';
import EmpTicketList from './components/empPages/EmpTicketList';
import TicketList from './components/pages/TicketList';
import TicketCreate from './components/pages/TicketCreate';
import TicketEdit from './components/pages/TicketEdit';
import TicketView from './components/pages/TicketView';
import ManageCompany from './components/adminPages/ManageCompany.vue';


// axios.defaults.baseURL = process.env.VUE_APP_API_URL
// axios.interceptors.request.use(function (config) {
//     config.headers['Authorization'] = `Bearer ${process.env.VUE_APP_API_KEY}`;
//     return config;
// });
axios.defaults.baseURL = process.env.VUE_APP_API_URL;
axios.interceptors.request.use(function (config) {
    // const token = localStorage.getItem('token');
    const token = store.state.token;
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

const routes = [
    { path: '/create', component: TicketCreate },
    { path: '/list', component: TicketList },
    { path: '/adminList', component: AdminTicketList },
    { path: '/employeecreate', component: EmployeeCreate },
    { path: '/employeeList', component: EmployeeList },
    { path: '/ticketTypeList', component: ManageTicket },
    { path: '/priorityList', component: ManageProrityType },
    { path: '/companyList', component: ManageCompany },
    { path: '/empTicketList', component: EmpTicketList },
    {
        path: '/',
        component: LayoutDiv,
        children: [
            { path: '', name: 'Login',component: UserLogin },
            { path: 'register',name:'Register', component: UserRegisterTemplate },
        ]
    },
    {
        path: '/user',
        component: MainLayout,
        children: [
            { path: 'admin/list', component: AdminTicketList },
            { path: 'admin/employeecreate', component: EmployeeCreate },
            { path: 'admin/employeelist', component: EmployeeList },
            { path: 'admin/ticket/list', component: ManageTicket },
            { path: 'admin/priority/list', component: ManageProrityType },
            { path: 'admin/company/list', component: ManageCompany },
            { path: 'emp/list', component: EmpTicketList },
            { path: 'list', component: TicketList },
            { path: 'create', component: TicketCreate },
            { path: 'edit/:id', component: TicketEdit },
            { path: 'view/:id', component: TicketView },
        ],
        meta: { requiresAuth: true }
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const isAuthenticated = store.getters.isAuthenticated;
    if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
        next('/'); // Redirect to login page if not authenticated
    } else {
        next(); // Proceed as normal
    }
});

// createApp(App).use(router).mount('#app');
const app = createApp(App);
app.use(store);                    // Use the Vuex store
app.use(router);                   // Use Vue Router
app.mount('#app');

// Rehydrate store on app start
const token = Cookies.get('authToken');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    axios.get('/api/') // Adjust endpoint as necessary
        .then(response => {
            const user = response.data.user;
            const role = response.data.role;
            store.dispatch('login', { token, user, role });
        })
        .catch(() => {
            store.dispatch('logout');
        });
}
