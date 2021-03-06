const https = require('https')
const assert = require('assert')
const dns = require('dns')

const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error
}

class PushbulletLog {
  constructor (opts = {
    prependDate: true
  }) {
    const defaults = {
      useConsole: true,
      compact: false,
      prependDate: false
    }
    opts = Object.assign(defaults, opts, { originalConsole: originalConsole })

    assert.ok(opts.token, 'Token is required')

    if (!opts.channels) opts.channels = {}
    if (opts.channel && !opts.channels.log) opts.channels.log = opts.channel

    if (!opts.channels.warn) opts.channels.warn = opts.channels.log
    if (!opts.channels.error) opts.channels.error = opts.channels.log

    // opts now has all needed values

    Object.assign(this, opts)
  }

  pushConsole (severity, thingsToLog) {
    if (this.useConsole) {
      this.originalConsole[severity.toLowerCase()].apply(console, thingsToLog)
    }
    let title = ''
    let messageArray = []

    if (thingsToLog.length === 0) return

    if (this.label) title += this.label + ' '
    title += severity + ': '
    if (typeof thingsToLog[0] === 'string') title += thingsToLog.shift()

    const spacing = this.compact ? '' : '  '
    while (thingsToLog.length > 0) {
      let thingToLog = thingsToLog.shift()
      if (thingToLog instanceof Error) thingToLog = thingToLog.stack // stack is what matters, not the error object
      if (typeof thingToLog === 'object') {
        messageArray.push(JSON.stringify(thingToLog, null, spacing))
      } else messageArray.push(String(thingToLog))
    }
    let messageString = messageArray.join(', ')
    if (this.prependDate) messageString = Date().toString() + '\n' + messageString

    const shouldPush = !this.pushOnProductionOnly ||
      (this.pushOnProductionOnly && process.env.NODE_ENV === 'production')

    if (shouldPush) return this.makePush(title, messageString, severity)
    else return Promise.resolve()
  }

  makePush (title, message, severity) {
    let logResolution
    const logPromise = new Promise(resolve => { logResolution = resolve })
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
      channel_tag: this.channels[severity.toLowerCase()] // will be undefined if user doesn't give any channels
    }
    PushbulletLog._dns.lookup('api.pushbullet.com', err => {
      if (err) {
        this.originalConsole.error('Pushbullet error', err)
        logResolution()
      } else {
        const req = PushbulletLog._request(opts, response => {
          response.on('data', () => {}) // needed for the other events to fire for some reason
          response.on('error', err => {
            this.originalConsole.error(err)
            logResolution()
          })
          response.on('end', logResolution)
        })

        req.write(JSON.stringify(payload))
        req.end()
      }
    })
    return logPromise
  }

  overrideConsole () {
    const self = this
    console.log = function () { self.log.apply(self, arguments) }
    console.warn = function () { self.warn.apply(self, arguments) }
    console.error = function () { self.error.apply(self, arguments) }
  }

  log () { return this.pushConsole('LOG', [].slice.call(arguments)) }
  warn () { return this.pushConsole('WARN', [].slice.call(arguments)) }
  error () { return this.pushConsole('ERROR', [].slice.call(arguments)) }
}

// used for testing
PushbulletLog._dns = dns
PushbulletLog._request = https.request

module.exports = PushbulletLog
