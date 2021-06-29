import React from "react";
import "./App.css";
import { HashRouter as Router, Link } from "react-router-dom";
import { Layout, Menu } from "antd";
import RouterViews from "./router";
// import UserInfoView from "./demos/UserInfo"
// import UserInfoView from "./demos/UserInfoByHook"
import UserInfoView from "./demos/UserInfoScopeStore"

const { Content, Sider,Header } = Layout;
class App extends React.Component {
  render() {
    return (
      <Router>
        <Header className="site-layout-background">
          <UserInfoView/>
        </Header>
        <Layout>
          <Sider
            width={200}
            style={{ paddingTop: 20 }}
            className="site-layout-background"
          >
            <Menu mode="inline" style={{ height: "100%", borderRight: 0 }}>
              <Menu.Item key="2">
                <Link to="/roleManage">角色管理</Link>
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout style={{ padding: "24px" }}>
            <Content
              className="site-layout-background border"
              style={{
                padding: 24,
                margin: 0,
                minHeight: "100vh",
              }}
            >
              <RouterViews />
            </Content>
          </Layout>
        </Layout>
      </Router>
    );
  }
}
export default App;
