import { makeObservable,makeAutoObservable,observable,computed,action } from 'mobx'

const roleMap = {
  1:'运营',
  2:'客服',
  3:'管理员'
}
// makeObservable
class UserStore{
  constructor(rootStore){
    this.rootStore = rootStore
    makeObservable(this,{
      roleType:observable,
      roleName:computed,
      changeRoleType:action
    })
  }
  roleType = 1
  get roleName(){
    return roleMap[this.roleType]
  }
  changeRoleType(val){
    this.roleType = val
  }
}
// makeAutoObservable
// class UserStore{
//   constructor(rootStore){
//     this.rootStore = rootStore
//     makeAutoObservable(this)
//   }
//   roleType = 1
//   get roleName(){
//     return roleMap[this.roleType]
//   }
//   changeRoleType(val){
//     this.roleType = val
//   }
// }
export default UserStore

