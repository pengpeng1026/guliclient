const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  routes:state => state.user.routes,  //这里拿到了所有的路由对象组成的数组，用于遍历然后在菜单栏展示
  roles: state => state.user.roles,
  buttons: state => state.user.buttons
}
export default getters
