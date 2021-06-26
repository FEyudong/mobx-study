import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

import { Provider } from 'mobx-react'
import store from './store'

ReactDOM.render(
  <React.StrictMode>
      <Provider {...store}>
          <App/>
      </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);


// 模块热更新
if (module.hot) {
  module.hot.accept();
}
