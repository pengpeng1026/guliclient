import { login, logout, getInfo } from '@/api/acl/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter,constantRoutes,allAsyncRoutes,anyRoutes } from '@/router'
import router from '@/router'

// 这个函数，是将用户登录返回的登录信息里面的routes名字数组用于过滤所有的异步路由
// 比如用户的权限只有首页（常量路由）那么返回的这个名字数组里面是空的，因此过滤后就只有一个空的数组
function filterAsyncRoutes(allAsyncRoutes,routesName){
  const filterRoutes = allAsyncRoutes.filter(item => {
    if(routesName.indexOf(item.name) !== -1){
      if(item.children && item.children.length){
        item.children = filterAsyncRoutes(item.children,routesName)
      }
      return true
    }
  })
  return filterRoutes
}

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    roles:[],
    buttons:[],
    routes:[]  //这里拿到的是整理后的所有的用户相关的路由对象数组，用于之后在sideBar里面去遍历然后在
                // 菜单栏里面展示
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  // SET_NAME: (state, name) => {
  //   state.name = name
  // },
  // SET_AVATAR: (state, avatar) => {
  //   state.avatar = avatar
  // }
  // 使用这个mutation保存这四个数据信息，和菜单权限相关的单独设置保存
  SET_USERINFO(state,userInfo){
    state.name = userInfo.name
    state.avatar = userInfo.avatar
    state.buttons = userInfo.buttons
    state.roles = userInfo.roles
  },
  SET_ROUTES(state,routes){
    state.routes = routes
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response  //从返回的响应中解构出data

        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        // const { name, avatar } = data

        // commit('SET_NAME', name)
        // commit('SET_AVATAR', avatar)
        // 这里是保存用户登录返回的信息（不包括名字数组）
        commit('SET_USERINFO',data)

        // 将返回的名字数组参照所有的异步数组进行过滤，拿到该用户自己的异步路由数组，如果是空的话代表用户没有其他的权限
        let asyncRoutes = filterAsyncRoutes(allAsyncRoutes,data.routes)
        // 合并，这里合并routes，是拿到所有和用户相关的数组，包括常量路由，异步路由，任意路由，稍后作展示用
        let routes = constantRoutes.concat(asyncRoutes,anyRoutes)
        commit('SET_ROUTES',routes)
        // 这一步，拿到路由器对象，此时的路由器对象里面只注册了常量路由，因此需要根据用户动态的添加路由
        router.addRoutes([...asyncRoutes,anyRoutes])  // 动态添加路由
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

