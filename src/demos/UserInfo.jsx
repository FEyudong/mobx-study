import { Component } from "react";
import { observer } from "mobx-react";
import { Row, Col, Space } from "antd";
import rootStore from './../store'

const { userStore } = rootStore;

// class组件
class UserInfo extends Component {
  render() {
    const { roleName } = userStore;
    return (
        <Row justify="space-between">
          <Col></Col>
          <Col span={5} className='border'>
            <Space align='center'>
              <span>当前角色类型:</span>
              <h2>{roleName}</h2>
            </Space>
          </Col>
        </Row>
    );
  }
}
// function组件
const userInfo = () => {
    const { roleName } = userStore;
    return (
        <Row justify="space-between">
          <Col></Col>
          <Col span={5} className='border'>
            <Space align='center'>
              <span>当前角色类型:</span>
              <h2>{roleName}</h2> 
            </Space>
          </Col>
        </Row>
    );
}
export default observer(userInfo)
