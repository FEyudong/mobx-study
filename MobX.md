# MobX 使用指南

## 概览篇

### 简介

MobX 是一个专注于做状态管理的库，在 React 世界的流行程度仅次于拥有官方背景的 Redux。但 MobX 有自己独特的优势，它通过运用透明的函数式响应编程使状态管理变得简单、高效、自由。

### MobX 哲学

任何源自应用状态的东西都应该自动地获得。

### 核心原理

利用**defineProperty**(v6)或**Proxy**(<=v5)拦截对象属性的变化，实现数据的**Observable**，在 get 中依赖收集，set 中触发监听函数。  
假如你之前关注过 Vue.js、Knockout 等的一些 MVVM 框架的响应式原理，那么你应该会感到非常熟悉。是的，它们的原理如出一辙。

### 核心概念

不仅是原理，基础概念、顶层的 api 设计也十分相似。Vue.js 中 data、computed、watch，几乎可以与 Mobx 中的[observable-state](https://zh.mobx.js.org/observable-state.html)、[computed](https://zh.mobx.js.org/computeds.html)、[reaction](https://zh.mobx.js.org/reactions.html)等概念一一对应。最大的不同是，MobX 通过 actions 约束对 state 的更新方式，实现了对状态的管理这一重要步骤。整体运行流程如下图所示。

![alt 运行流程](https://zh.mobx.js.org/assets/zh.flow.png)

### 安装

mobx 这个包，提供了 mobx 所有的与具体框架平台无关的基础 Api。比如（observable、makeObservable、action）。

```
npm i mobx
```

如果在 react 中使用，需要添加针对 react 开发的包 mobx-react

```
npm i mobx mobx-react
```

如果你在 react 开发中，只使用函数式组件，没有使用类组件，那么可以将 mobx-react 替换为一个更轻量的包 mobx-react-lite。

```
npm i mobx mobx-react-lite

/* 
相比mobx-react这个全量包，去掉了对class components的支持，并且移除了provider、inject（原因：MobX提供的这两个HOC在React官方已经提供了React.createContext之后变得不是那么必要了）
*/
```

## 实践篇

### 1. 创建 Store

相比直接使用**普通对象**，MobX 更推荐使用**类**的方式去创建 Store，主要原因是 class 对 TS 的类型系统更友好，更容易被索引实现自动补全等功能。  
方式一、直接使用普通对象的方式 （不推荐）

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

方式二、使用类 + 装饰器 （V6 版本之前的推荐方式）

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

方式三、使用类 + makeObservable （V6 版本的推荐方式）（原因可以在Q&A章节找到）  

```
import { makeObservable,observable,computed,action } from 'mobx'

class UserStore{
  constructor(){
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
    /* 无需显示的声明，会自动应用合适的MobX-Api去修饰。比如
    （1）值字段会被推断为observable、
    （2）get 修饰的方法，会推断为computed、
    （3）普通方法，会自动应用action 
    （4）如果你有自定义调整某些字段的需求，请参考此方法的[其他入参](https://zh.mobx.js.org/observable-state.html#makeautoobservable)
    */
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
```

实现 Store 间通信  
例子：在一个角色管理的模块，自己是管理员权限，权力大到甚至能够更改自己的角色类型，那么真这样操作时，就需要将RoleManageStore的修改更改同步到UserStore，这时就涉及到多个Store间通信。  
思路：用一个顶层的 rootStore，实现多个Store间的状态读取，方法调用。

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
      userStore.changeRoleType(type)//同步UserStore
    }else{
      //更改别人的角色类型
      ...
    }
  }
}
// 新建一个上层Store，方便Stores间沟通
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
#### observer
作用：自动订阅在react组件渲染期间被使用到的可观察对象。当任意可观察对象变化发生时，组件就会自动进行重新渲染。  
前边在概览篇提到过MobX的核心能力就是能够将数据get中收集到的所有依赖，在set中一次性发布出去。在react场景中，就是要将状态与组件渲染建立联系，一旦状态变化，所有使用到此状态的组件都需要重新渲染，而这一切的关键就是observer。
```

```


