# MobX 实践指南

## 一、概览篇

### 简介

  MobX 是一个专注于状态管理的库，在 React 世界的流行程度仅次于拥有官方背景的 Redux。但 MobX 有自己独特的优势，它通过运用透明的函数式响应编程使状态管理变得简单、高效、自由。

### MobX哲学

  任何源自应用状态的东西都应该自动地获得。

### 核心原理

  利用**defineProperty**(<=v5)或**Proxy**(v6)拦截对象属性的变化，实现数据的**Observable**，在 get 中依赖收集，set 中触发依赖绑定的监听函数。  
  假如你之前关注过 Vue.js、Knockout 等的一些 MVVM 框架的响应式原理，那么你应该会感到非常熟悉。是的，它们的原理如出一辙。

### 核心概念

  不仅是原理，基础概念、顶层的 Aspi 设计也十分相似。Vue.js 中 data、computed、watch，几乎可以与 Mobx 中的[observable-state](https://zh.mobx.js.org/observable-state.html)、[computed](https://zh.mobx.js.org/computeds.html)、[reaction](https://zh.mobx.js.org/reactions.html)等概念一一对应。最大的不同是，MobX 通过 actions 约束对 state 的更新方式，实现了对状态的管理这一重要步骤。整体运行流程如下图所示。

  ![alt 运行流程](https://zh.mobx.js.org/assets/zh.flow.png)

### 安装

**mobx** 这个包，提供了 MobX 所有的与具体框架平台无关的基础 Api。比如（observable、makeObservable、action等）。

```
npm i mobx
```

如果在 react 中使用，需要添加针对 react 开发的包 **mobx-react**

```
npm i mobx mobx-react
```

如果你在 react 开发中，只使用函数式组件，没有使用类组件，那么可以将 mobx-react 替换为一个更轻量的包 **mobx-react-lite**

```
npm i mobx mobx-react-lite

相比mobx-react这个全量包，
1. 去掉了对class components的支持，
2. 并且移除了provider、inject
（原因：这两个HOC在React官方已经提供了React.createContext之后变得不是那么必要了）
```


## 二、实践篇

### 1. 声明Store

相比直接使用**普通对象**，MobX 更推荐使用**类**的方式去创建 Store，主要原因是 class 对 TS 的类型系统更友好，更容易被索引实现自动补全等功能。 
#### 三种声明方式   
方式一、直接使用**普通对象**的方式 （不推荐）

```
import { observable,action } from 'mobx'

const userStore = observable({
  roleType:1
})

export const changeRoleType = action((val)=>{
  userStore.roleType = val
})

export default userStore
```

方式二、使用**类 + 装饰器** （V6 版本之前的推荐方式）

```
import { observable } from 'mobx'

class UserStore{
  @observable roleType=1
  @action changeRoleType(val){
    this.data = val
  }
}

export default UserStore
```

方式三、使用**类 + makeObservable/makeAutoObservable** （V6 版本的推荐方式）（至于**不再推荐装饰器**的原因，你可以在Q&A章节找到）  

```
import { makeObservable,observable,computed,action } from 'mobx'

class UserStore{
  constructor(){
    // 显示的声明类上各属性或方法的需要应用何种能力
    makeObservable(this,{
      roleType:observable,
      roleName:computed,
      changeRoleType:action
    })
  }
  roleType = 1
  get roleName(){
    return roleMap[roleType]
  }
  changeRoleType(val){
    this.roleType = val
  }
}
export default UserStore

//or

import { makeAutoObservable } from 'mobx'

class UserStore{
  constructor(){
    makeAutoObservable(this)
    /* 无需显示的声明，属性及方法会自动应用合适的MobX-Api去修饰。默认情况下：
    （1）普通属性会被推断为observable、
    （2）get 修饰的方法，会推断为computed、
    （3）普通方法，会自动应用action 
     如果你有自定义调整某些字段对应功能的需求，请参考此方法的[其他入参](https://zh.mobx.js.org/observable-state.html#makeautoobservable)
    */
  }
  roleType = 1 //自动推断为observable
  get roleName(){ //自动推断为computed 
    return roleMap[roleType]
  }
  changeRoleType(val){//自动推断为action
    this.roleType = val
  }
}
export default UserStore
```

#### 实现 store 间通信  
例子：在一个角色管理的模块，因为自己拥有管理员权限，权力大到甚至能够更改自己的角色类型，那么果真这样操作时，就需要将**RoleStore**的修改同步到**UserStore**，这时就涉及到多个store间通信。  
思路：创建一个公共的上级 rootStore，实现多个Store间的状态读取，方法调用。

```
// 用户信息Store
class UserStore{
  constructor(rootStore){
    this.rootStore = rootStore
    makeAutoObservable(this)
  }
  uid = 'zyd123'
  roleType = 1
  changeRoleType(val){
    this.roleType = val
  }
}
// 角色管理Store
class RoleStore{
  constructor(rootStore){
    this.rootStore = rootStore
    makeAutoObservable(this)
  }
  changeUserRoleType(uid,type){
    const {userStore} =  this.rootStore
    //更改自己的角色类型
    if(uid === userStore.uid){
      //*** 同步UserStore ***
      userStore.changeRoleType(type)
      ...
    }else{
      //更改别人的角色类型
      ...
    }
  }
}

// 新建一个上层rootStore，方便Stores间沟通
class RootStore {
  constructor() {
      this.userStore = new UserStore(this)
      this.roleStore = new RoleStore(this)
  }
}

const rootStore = new RootStore()
export default rootStore
```

### 2. 在React组件中使用
#### 2.1 observer
作用：**自动订阅**在react组件**渲染期间**被使用到的**可观察对象属性**，当他们变化发生时，组件就会自动进行**重新渲染**。
前边在概览篇提到过MobX的核心能力就是能够将数据get中收集到的所有依赖，在set中一次性发布出去。在react场景中，就是要**将状态与组件渲染建立联系**，一旦状态变化，所有使用到此状态的组件都需要重新渲染，而这一切的关键就是observer。  
用法如下：(demo:实现一个更改全局角色的功能，RoleManage组件负责更改，UserInfo组件负责展示)  
src/demos/UserInfo.jsx
```
import { observer } from "mobx-react";
// 导入rootStore
import rootStore from './../store';
// 拿到对应的子Store
const { userStore } = rootStore;

class UserInfo extends Component {
  render() {
    //(1) 触发get,收集依赖(ps:当前组件已加入MobX的购物车)
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
// (关键)observer HOC包裹住组件，将MobX强大的响应式更新能力赋予react组件。
export default observer(UserInfo)
```
src/demos/RoleManage.jsx
```
import rootStore from './../store'

const { userStore } = rootStore;

class RoleManage extends Component {
  handleUpdateRoleType = ()=>{
    //(2) 使用一个action去触发数据set，在set中发布依赖（触发组件更新,ps:Mobx要清空购物车啦）
    userStore.changeRoleType(2)
  }
  render() {
    return <Button onClick={this.handleUpdateRoleType}>更改角色</Button>
  }
}
export default RoleManage;
```
#### 2.2 Provider、inject
作用：刚才的例子中，大家可以看到全局Store的引入方式是文件的方式引入的。
```
import rootStore from './../store'

const { userStore } = rootStore;
```
这种方式繁琐且不利于维护，假如store文件重新组织，引入的地方需要处处更改与check。所以，有没有方式，在项目开发中Store只需**一次注入**，就可以在所有组件内非常便捷的引用呢？  
答案就是使用 Provider、inject。  
让我们重构上边的例子:
src/index.jsx
```
import App from "./App";

import { Provider } from 'mobx-react'
import store from './store'
//利用Provider将Store注入全局
ReactDOM.render(
    <Provider {...store}>
        <App/>
    </Provider>,
  document.getElementById("root")
);
```
src/demos/UserInfo.jsx
```
class UserInfo extends Component {
  render() {
    //通过props的方式在render函数中引用
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

// inject是高阶函数，所以inject('store')返回值还是个函数，最终入参是组件
export default inject('userStore')(observer(UserInfo))
```
**Provider及inject**看上去与react官方推出的**context Api**用法非常相似，要解决的问题也基本一致。  
事实上，最新版的mobx-react，前者就是基于后者去做的封装，这也从侧面说明，这俩Api现在来看，并**不是开发react应用的必需品**。所以MobX官方在推出针对React平台的轻量包（mobx-react-lite）时，首先就把这俩api排除在外了。    
但笔者认为，你如果使用的是**class组件，Provider及inject依然建议使用**，因为class组件内使用contextApi并不十分方便，但如果你用的**hooks，则大可不必再使用Provider及inject了**，得益于useContext的方便简洁，大大降低了使用他们的必要性（具体用法，后边会讲到）。
### 2.3 MobX + Hooks
函数组件+hooks是目前开发React应用的首选方式。MobX顺应趋势，推出了新的hook Api，这已经成为使用MobX的主流方式。  
#### 2.3.1 使用全局Store 
**自定义useStore**替换Provider、inject
下边示例笔者会统一采用mobx-react-lite这个轻量包来编写。前边提到这个包并不提供Provider、inject，但是没有关系，有React官方提供的createContext及useContext就足够了。
下边我们自己动手封装一个好用的useStore-hook。  
src/store/index.js
```
...

//创建rootStore的Context
export const rootStoreContext = React.createContext(rootStore)

/**
 * @description 提供hook方式，方便组件内部获取Store
 * @param {*} storeName 组件名字。作用类似inject(storeName)，不传默认返回rootStore
 */

export const useStore = (storeName) => {
  const rootStore = React.useContext(rootStoreContext)
  if (storeName) {
    const childStore = rootStore[storeName]
    if (!childStore) {
      throw new Error('根据传入storeName，找不到对应的子store')
    }
    return childStore
  } 
  return rootStore
}
```
src/index.jsx
```
- import { Provider } from 'mobx-react'

+ import rootStore, {rootStoreContext} from './store'
+ const { Provider } = rootStoreContext

ReactDOM.render(
     <Provider value={rootStore}>
          <App/>
      </Provider>,
      document.getElementById("root")
```
src/demos/UserInfo.jsx
```
//换用更轻量的lite包
- import { observer } from "mobx-react";
+ import { observer } from "mobx-react-lite";
  import { Row, Col, Space } from "antd";

+ import { useStore } from '../store';

// 函数式组件
const UserInfo = ()=> {
    //使用自定义useStore获取全局store
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
```
假如日常项目中，只希望MobX负责**全局的状态管理**，以上内容就完全够用了。下边我会介绍MobX+hook在**局部状态管理**方面的强大能力。  
***全局状态管理***：store在组件外定义，经常放在全局一个单独的store文件夹。适合管理一些公共或者相对某模块是公共的状态。  
***局部状态管理***：store常常定义在组件内部，适用于复杂的组件设计场景，用来解决组件多层嵌套下的状态层层传递、组件状态多且更新复杂等问题。
#### 2.3.2 创建一个局部的Store
先介绍两个hook
##### useLocalObservable
作用：通过hook的方式声明一个组件内的Store，返回传入**普通对象的响应式版本**，并在函数组件之后的每一次渲染中保持对这个响应式对象的唯一引用（这点与useState是一致的）（*useLocalStore是这个api的前身，但是将要废弃，这里不做介绍*）。
##### useObserver
作用：前边讲的observer是HOC的方式，只能在外部通过包裹整个组件的方式去使用。想要在**组件内部实现局部状态管理**，在类组件中必须通过内置的Observer组件以renderProps的方式去解决，但在函数式中，hook一定是解决问题的首选，所以可以理解为**useObserver是Observer的hook版实现**。
示例：useLocalObservable + useObserver实现一个局部的状态管理
src/demos/UserInfoScopeStore.jsx
```
import { useLocalObservable, useObserver } from "mobx-react-lite";
import { Row, Col, Space,Button } from "antd";

const UserInfo = ()=> {
    //定义组件内的响应式Store
    const store = useLocalObservable(()=>({
      name:'xxx',
      changeName(text){
        this.name = text
      }
    }))
    // 对比以下两种组件内局部状态视图更新方式。
    // useObserver 
    return useObserver(()=> <Row justify="space-between">
    <Col></Col>
    <Col span={5} className='border'>
      <Space align='center'>
        <span>当前用户:</span>
        <h2>{store.name}</h2>
        <Button onClick={()=>store.changeName('小米')}>修改</Button>
      </Space>
    </Col>
  </Row>)
  // or Observer
  return <Observer>
          {() => <Row justify="space-between">
            <Col></Col>
            <Col span={5} className='border'>
              <Space align='center'>
                <span>当前用户:</span>
                <h2>{store.name}</h2>
                <Button onClick={() => store.changeName('小米')}>修改</Button>
              </Space>
            </Col>
          </Row>}
     </Observer>
}
export default UserInfo
```
简单总结：（1）observer HOC的方式适合组件的整体更新场景（2）useObserver or Observer 都可用来处理局部的组件内更新场景，区别前者是hook的方式，只支持函数式组件，后者使用renderProps的方式，类与函数组件都兼容。
##### 3. 开发者工具
[chrome插件](https://chrome.google.com/webstore/detail/mobx-developer-tools/pfgnfdagidkfgccljigdamigbcnndkod)
## 三、Q&A
1. **IE项目能不能用？**  
V4版本默认可用，V5及以上如果需要兼容不支持Proxy的IE / React Native，请在应用初始化修改全局配置useProxies  
```
import { configure } from "mobx"
// 如果需要兼容ie或rn，请通过全局配置，禁止使用代理
configure({ useProxies: "never" })
```

2. **为什么MobX新的V6版本，不再推荐类的装饰器语法，而是建议用makeObservable的方式去修饰Store？**  
不再推荐装饰器的理由：因为装饰器语法尚未定案，纳入 ES 标准的时间遥遥无期，且未来制定的标准可能与当前的装饰器实现方案有所不同。所以出于兼容性，MobX 6中不推荐使用装饰器，并建议使用 makeObservable / makeAutoObservable 代替。但项目中如果使用的是 TS，笔者认为可以基本忽略影响，毕竟装饰器确实使用起来更简洁一些。

3. **为什么我的组件并没有随着Store数据的更新而更新？**  
  (1)忘记了observer，useObserver的包裹(大部分原因都是这个)。
  (2)defineProperty的响应式方案会有一些针对[数组和对象的限制](https://cn.mobx.js.org/best/react.html)，需要格外注意，必要时候需要使用mobx提供的set方法来解决。
  (3)只要你始终传递响应式对象的引用，observer就可以很好的工作，如果只是传递属性值，就造成了响应式丢失，常发生在使用ES6解构的场景，或只传个响应式对象的属性进去。如果读者了解vue3，那么其中的[toRefs](https://www.vue3js.cn/docs/zh/api/refs-api.html#torefs)就是为了解决类似的问题，但是Mobx中你可以通过下边的例子避免这种情况。
    ```
    //错误 ❌
    const TimerView = observer(({ secondsPassed }) => <span>Seconds passed: {secondsPassed}</span>)

    React.render(<TimerViewer secondPassed={myTimer.secondsPassed} />, document.body)

    // 正确 🙆
    const TimerView = observer(({ myTimer }) => <span>Seconds passed: {myTimer.secondsPassed}</span>)

    React.render(<TimerViewer secondPassed={myTimer} />, document.body)
    ```

  4. **必须要通过action去更新Store？**  
  原理上不必要，原则上必要。你直接**mutable**的方式直接更改Store也是能够触发响应式更新，但是mobx强烈不建议你这样做，因为你会丢失以下好处：
    (1) 能够清晰表达出一个函数修改状态的意图，有**利于项目维护**
    (2) action结合开发者工具，提供了非常**有用的调试**信息
  当启用**严格模式**时，修改store状态需要强制使用action，参见全局配置enforceActions。MobX并不像redux那样，从原理上就限制了state的更新方式，只能靠这种约定的方式去限制。所以**强烈建议开启此选项**。

  5. **频繁使用observer，会不会出现性能问题？**  
  当组件相关的 observable 发生变化时，组件将自动重新渲染，反之，它能够确保在没有相关更改时组件不会重新渲染。真正做到了组件的按需渲染，在实践中，这使得 MobX 应用程序开箱即用地进行了很好的优化，它们通常不需要任何额外的代码来防止过度渲染。

  6. **MobX相比Redux最大的优势是什么？**  
  具体来说：MobX的开箱即用，简洁灵活，对现有项目侵入小，这都是相比Redux的优势方面。
  抽象来讲：MobX相比Redux，它天然对实体模型是友好的，它在内部巧妙的借助拦截代理把数据做了observable转换，让开发者在使用层面依旧感知到的是实体模型，但是它却拥有了响应式能力，这就是mobx最厉害的地方，它适合抽象[**领域模型**](https://zh.mobx.js.org/defining-data-stores.html#%E9%A2%86%E5%9F%9F%E5%AF%B9%E8%B1%A1)！
## 结尾
以上所有例子都可在这个[github仓库](https://github.com/FEyudong/mobx-study.git)找到。 
# END THANKS～





