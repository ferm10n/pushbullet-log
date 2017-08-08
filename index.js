// const https = require('https')
const assert = require('assert')

class PushbulletLog {
  constructor (opts = {
    prependDate: true
  }) {
    this.prependDate = !!opts.prependDate
    assert.ok(opts.token, 'Token is required')
    assert.ok(opts.channel, 'Token is required')
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
