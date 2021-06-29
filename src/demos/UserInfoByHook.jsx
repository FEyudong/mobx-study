import { observer } from "mobx-react-lite";
import { Row, Col, Space } from "antd";
import { useStore } from '../store';

// hooks
const UserInfo = ()=> {
    const { roleName } = useStore('userStore')
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
    )
}
export default observer(UserInfo)
