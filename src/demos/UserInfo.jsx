import { Component } from "react";
import { inject,observer } from "mobx-react";
import { Row, Col, Space } from "antd";

// class组件
class UserInfo extends Component {
  render() {
    const { roleName } = this.props.userStore;
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
export default inject('userStore')(observer(UserInfo))
