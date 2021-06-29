import React from 'react'
import UserStore from './models/User'

class RootStore {
  constructor() {
    this.userStore = new UserStore(this)
  }
}

const rootStore = new RootStore()

export default rootStore

//rootStore CTX
export const rootStoreContext = React.createContext(rootStore)

/**
 * @description 提供hook方式，方便组件内部获取Store
 * @param {*} storeName 组件名字。作用类似inject(storeName)，不传默认返回rootStore
 */
//通过传入store的名字，
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