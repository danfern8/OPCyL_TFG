import Vue from 'vue'
import VueRouter from 'vue-router'
import Principal from '../views/Principal.vue'
import InformationOposition from '../views/InformationOposicion.vue'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Principal',
    component: Principal
  },
  {
    path: '/informationOposicion/:id',
    name: 'InformationOposicion',
    component: InformationOposition
  }
]

const router = new VueRouter({
  routes
})

export default router
