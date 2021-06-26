import { makeAutoObservable } from 'mobx'

const roleMap = {
  1:'运营',
  2:'客服',
  3:'管理员'
} 

class UserStore{
  constructor(rootStore){
    this.rootStore = rootStore
    makeAutoObservable(this)
  }
  roleType = 1
  get roleName(){
    return roleMap[this.roleType]
  }
  changeRoleType(val){
    this.roleType = val
  }
}
export default UserStore

