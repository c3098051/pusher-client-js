/*
 * @Author: Jeff Jung (c3098051@gmail.com) 
 * @Date: 2018-02-28 23:11:12 
 * @Last Modified by: Jeff Jung
 * @Last Modified time: 2018-02-28 23:53:47
 */
// @flow

import Pusher from '../src/Pusher'

const p = new Pusher(null, {
  cluster: 'cluster',
  log: true,
})

const channel = p.subscribe('private-channel')
channel.bind('SellVcToCash.DisputedTransactionNotification', (data) => {
  console.log(`[example] callback for 'SellVcToCash.DisputedTransactionNotification', data: ${JSON.stringify(data)}`)
})

const channel2 = p.subscribe('private-channel.27')
channel2.bind('SellVcToCash.DisputedTransactionNotification', (data) => {
  console.log(`[example] callback for 'event2, data: ${JSON.stringify(data)}`)
})
