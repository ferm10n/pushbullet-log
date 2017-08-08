// const https = require('https')
const assert = require('assert')

class PushbulletLog {
  constructor (opts = {
    prependDate: true
  }) {
    this.prependDate = !!opts.prependDate
    assert.ok(opts.token, 'Token is required')

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

    this.makePush(title, messageArray.join(', '), severity)
  }
  makePush (title, message, severity) {
    throw new Error('nope')
  }

  log () { this.pushConsole('LOG', [].slice.call(arguments)) }
  warn () { this.pushConsole('WARN', [].slice.call(arguments)) }
  error () { this.pushConsole('ERROR', [].slice.call(arguments)) }
}

module.exports = PushbulletLog
