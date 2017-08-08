const https = require('https')
const assert = require('assert')

class PushbulletLog {
  constructor (opts = {
    prependDate: true
  }) {
    this.prependDate = !!opts.prependDate
    assert.ok(opts.token, 'Token is required')
    this.token = opts.token

    // determine channels
    if (!opts.channels) opts.channels = {}
    if (opts.channel && !opts.channels.log) opts.channels.log = opts.channel
    assert.ok(opts.channels.log, 'Log channel is required')
    if (!opts.channels.warn) opts.channels.warn = opts.channels.log
    if (!opts.channels.error) opts.channels.error = opts.channels.log
    this.channels = opts.channels // apply
  }
  pushConsole (severity, thingsToLog) {
    let title = severity + ': '
    let messageArray = []

    if (thingsToLog.length === 0) return

    if (typeof thingsToLog[0] === 'string') title += thingsToLog.shift()

    while (thingsToLog.length > 0) {
      const thingToLog = thingsToLog.shift()
      if (typeof thingToLog === 'object') {
        messageArray.push(JSON.stringify(thingToLog))
      } else messageArray.push(String(thingToLog))
    }
    let messageString = messageArray.join(', ')
    if (this.prependDate) messageString = Date().toString() + '\n' + messageString
    this.makePush(title, messageString, severity)
  }
  makePush (title, message, severity) {
    const opts = {
      host: 'api.pushbullet.com',
      path: '/v2/pushes',
      port: '443',
      method: 'POST',
      headers: {
        'Access-Token': this.token,
        'Content-Type': 'application/json'
      }
    }
    const payload = {
      type: 'note',
      title: title,
      body: message,
      channel_tag: this.channels[severity.toLowerCase()]
    }
    const req = https.request(opts, response => {
      response.on('data', () => {}) // needed for the other events to fire for some reason
      response.on('error', () => {})
      response.on('end', () => {})
    })
    req.write(JSON.stringify(payload))
    req.end()
  }

  log () { this.pushConsole('LOG', [].slice.call(arguments)) }
  warn () { this.pushConsole('WARN', [].slice.call(arguments)) }
  error () { this.pushConsole('ERROR', [].slice.call(arguments)) }
}

module.exports = PushbulletLog
