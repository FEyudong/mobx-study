import { useLocalObservable, useObserver, Observer } from "mobx-react-lite";
import { Row, Col, Space, Button } from "antd";

const UserInfo = () => {
  const store = useLocalObservable(() => ({
    name: 'xxx',
    changeName(text) {
      this.name = text
    }
  }))
  return useObserver(() => <Row justify="space-between">
    <Col></Col>
    <Col span={5} className='border'>
      <Space align='center'>
        <span>当前用户:</span>
        <h2>{store.name}</h2>
        <Button onClick={() => store.changeName('小米')}>修改</Button>
      </Space>
    </Col>
  </Row>)
  // return <Observer>
  //         {() => <Row justify="space-between">
  //           <Col></Col>
  //           <Col span={5} className='border'>
  //             <Space align='center'>
  //               <span>当前用户:</span>
  //               <h2>{store.name}</h2>
  //               <Button onClick={() => store.changeName('小米')}>修改</Button>
  //             </Space>
  //           </Col>
  //         </Row>}
  //     </Observer>
}
export default UserInfo
