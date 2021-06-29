import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

// import { Provider } from 'mobx-react'
import rootStore, {rootStoreContext} from './store'

const { Provider } = rootStoreContext

ReactDOM.render(
      <Provider value={rootStore}>
          <App/>
      </Provider>,
  document.getElementById("root")
);


// 模块热更新
if (module.hot) {
  module.hot.accept();
}
