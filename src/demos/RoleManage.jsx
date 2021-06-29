import { Component } from "react";
import { Button } from 'antd'
import rootStore from './../store'

const { userStore } = rootStore;
class RoleManage extends Component {
  handleUpdateRoleType = ()=>{
    userStore.changeRoleType(2)
  }
  render() {
    return <Button onClick={this.handleUpdateRoleType}>更改角色</Button>
  }
}
export default RoleManage;
