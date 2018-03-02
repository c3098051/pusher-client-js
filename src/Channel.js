/*
 * @Author: Jeff Jung (c3098051@gmail.com) 
 * @Date: 2018-02-28 10:37:59 
 * @Last Modified by: Jeff Jung
 * @Last Modified time: 2018-02-28 23:45:21
 */
// @flow
export default class Channel {
  channel: String = ''
  events: {
    [eventName: string]: Function
  } = {}

  constructor(chanName: string) {
    this.channel = chanName
    this.events = {}
  }

  bind(eventName: string, callback: Function) {
    this.events[eventName] = callback
  }

  unbind(eventName: string) {
    delete (this.events[eventName])
  }

  onMessage(eventName: string, data: any) {
    const f = this.events[eventName]
    if (f) {
      f(data)
    }
  }

  unbind_all() {
    this.events = {}
  }
}

