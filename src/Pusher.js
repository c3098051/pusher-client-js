/*
 * @Author: Jeff Jung (c3098051@gmail.com) 
 * @Date: 2018-02-28 10:37:44 
 * @Last Modified by: Jeff Jung
 * @Last Modified time: 2018-02-28 23:47:19
 */
// @flow
import _filter from 'lodash/filter'
import _findLast from 'lodash/findLast'

import Channel from './Channel'

const DEFAULT_URL = 'ws://localhost:8080/ws'
const HANDSHAKE = 'handshake'
const SUBSCRIBE = 'subscribe'
const UNSUBSCRIBE = 'unsubscribe'
const CLOSE = 'close'

type PusehrRequestKey = HANDSHAKE | SUBSCRIBE | UNSUBSCRIBE | CLOSE

type PusherRequest = {
  key: PusehrRequestKey,
  value: any
}

type PusherMessage = {
  channel: string,
  event: string,
  data: any,
}

type PusherConfig = {
    cluster: string,
    auto_reconnect: bool,
    timeout: number,
    log: bool,
    secure: bool,
}

const RECONNECT_TIMEOUT_DEFAULT = 2 * 1000
const defaultConfig = {
  cluster: 'default_cluster',
  auto_reconnect: true,
  timeout: RECONNECT_TIMEOUT_DEFAULT,
  log: false,
  secure: false, // not implemented yet 
}

export default class PusherSubscriber {
    URL: string
    config: PusherConfig = {}
    ws: WebSocket

    pendingChannels: Array<string> = []
    channels: Array<Channel> = []

    constructor(URL: string, config: PusherConfig) {
      this.URL = URL || DEFAULT_URL
      this.config = {
        ...defaultConfig,
        ...config,
      }
      this.newWebSocket()

      this.newWebSocket = this.newWebSocket.bind(this)
      this.subscribe = this.subscribe.bind(this)
      this.unsubscribe = this.unsubscribe.bind(this)
    }

    newWebSocket() {
      this.ws = new WebSocket(`${this.URL}?cluster=${this.config.cluster}`)
      this.registerSocketListener()
    }

    channel(chanName: string): Channel {
      const channel = _findLast(this.channels, c => (c.channel === chanName))
      if (channel) {
        return channel // found channel
      }
      this.logger(`cannot find channel name: ${chanName}, adding new channel`)

      // new channel
      const newChannel = new Channel(chanName)
      this.channels.push(newChannel)
      return newChannel
    }

    subscribe(chanName: string): Channel {
      this.logger(`subscribe, channel: ${chanName}`)

      const channel = this.channel(chanName)
      if (this.ws.readyState !== WebSocket.OPEN) {
        // don't need to send to server, 
        // because onconnect event, it all the channel subscription request, 
        // will be sent to the server
        return channel
      }

      // send request to server
      const req = {
        key: SUBSCRIBE,
        value: chanName,
      }
      this.ws.send(JSON.stringify(req))
      return channel
    }

    unsubscribe(chanName: string): void {
      this.logger(`unsubscribe, channel: ${chanName}`)

      // remove channel from channels
      this.channels = _filter(this.channels, c => (c.channel !== chanName))

      // just return is okay
      if (this.ws.readyState !== WebSocket.OPEN) {
        // don't need to send unsubscript request to server
        // because when state is disconnected, 
        // all the previous subscriptions for this client will be gone
        return
      }

      // send request to server
      const req: PusherRequest = {
        key: UNSUBSCRIBE,
        value: chanName,
      }
      this.ws.send(JSON.stringify(req))
    }

    close() {
      this.logger('close() is explicitly called')

      const req: PusherRequest = {
        key: CLOSE,
        value: true,
      }
      this.ws.send(JSON.stringify(req))
      this.ws.close()
    }

    // this should be called, after new Websocket is called.
    registerSocketListener() {
      this.ws.onopen = () => { this.onOpen() }
      this.ws.onclose = () => { this.onClose() }
      this.ws.onerror = () => { this.onError() }
      this.ws.onmessage = (e) => { this.onMessage(e) }
    }

    // callback for websocket
    onOpen() {
      this.logger('onopen')

      // if there is channels, need to subscribe
      this.channels.forEach((c) => {
        this.subscribe(c.channel)
      })
    }

    // callback for websocket
    onClose() {
      this.logger('onclose')

      // should reconnect, if auto_reconnet is true.. 
      if (this.config.auto_reconnect) {
        this.logger('try auto reconnect in ', this.config.timeout)
        setTimeout(this.newWebSocket, this.config.timeout)
      }
    }

    // callback for websocket
    onError() {
      this.logger('onerror')
      // do something on error?
    }

    // callback for websocket
    onMessage(e: MessageEvent) {
      this.logger(`onmessage, data: ${e.data}`)

      const msg: PusherMessage = JSON.parse(e.data)
      if (!msg.channel || msg.channel === '') {
        return
      }
      const channel = this.channel(msg.channel)
      channel.onMessage(msg.event, msg.data)
    }

    // simple logger, if log options is set to false,
    // don't print on console..
    logger(message: string) {
      if (!this.config.log) {
        return
      }
      console.log('[pusher] ', message)
    }
}
