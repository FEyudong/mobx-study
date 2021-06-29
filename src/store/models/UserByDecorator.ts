// import { makeObservable,makeAutoObservable,observable,computed,action } from 'mobx'
// import rootStore from './../models/index.js'

// type RootStore = typeof rootStore
// const roleMap = {
//   1:'运营',
//   2:'客服',
//   3:'管理员'
// }
// type RoleMapKey = keyof typeof roleMap

// // 装饰器
// class UserStore{
//   rootStore: RootStore
//   constructor(rootStore:RootStore){
//     this.rootStore = rootStore
//   }
//   @observable
//   roleType:RoleMapKey = 1
//   @computed
//   roleName(){
//     return roleMap[this.roleType]
//   }
//   @action
//   changeRoleType(val:RoleMapKey){
//     this.roleType = val
//   }
// }
// export default UserStore
export {}

