import { Component } from "react";
import { inject, observer } from "mobx-react";
import { Button } from 'antd'

class RoleManage extends Component {
  handleUpdateRoleType = ()=>{
    this.props.userStore.changeRoleType(2)
  }
  render() {
    return <Button onClick={this.handleUpdateRoleType}>更改角色</Button>
  }
}
export default inject("userStore")(observer(RoleManage));
