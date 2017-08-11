# pushbullet-log
[![Build Status](https://travis-ci.org/ferm10n/pushbullet-log.svg?branch=master)](https://travis-ci.org/ferm10n/pushbullet-log)
[![Coverage Status](https://coveralls.io/repos/github/ferm10n/pushbullet-log/badge.svg?branch=master)](https://coveralls.io/github/ferm10n/pushbullet-log?branch=master)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Dependencies](https://david-dm.org/ferm10n/pushbullet-log/status.svg)](https://david-dm.org/ferm10n/pushbullet-log)

**Receive alerts and console messages as push notifications**

Give your nodejs applications a voice by connecting it to Pushbullet. Never miss an error, crash, or log message. Get alerts delivered to Android, iOS, desktop and more in real time! Useful for monitoring the health and status of your app.

# Installation
pushbullet-log was written for Node.js 8+

`npm install pushbullet-log`

# Usage
## Setup
...is easy! To start receiving real time status logs from your application, you'll need to
- Create an account with [Pushbullet](https://www.pushbullet.com/) (if you don't already have one)
- Get your API access token from the [Account Settings](https://www.pushbullet.com/#settings/account) page
- *(Optional)* Create a [channel](https://www.pushbullet.com/my-channel) (or channels, if you wanna get fancy). I usually like one for stdout, and stderr. The tag field is what you want to use in your app

## Basics
Here's the bare minimum:
```
const pbl = new (require('pushbullet-log'))({ token: 'YOUR-API-TOKEN' })

p.log('send a push notification from nodejs!')

// p.warn('send a warning from nodejs!')
// p.error('send an error message from nodejs!', new Error())
```
Or a more advanced setup:
```
pbl.overrideConsole()

console.log('Application online!')

try {
  throw new Error('pushed error!')
} catch (err) {
  console.error(err)
}
```
...which will deliver pushes like this:

![pushbullet-log in action](https://github.com/ferm10n/pushbullet-log/raw/master/example.png)

## Options
Here are the options you can control, and what they do:
```
const opts = {
  token: 'REQUIRED-TOKEN',  // use the one you got from pushbullet
  useConsole: true,         // forward log/warn/error to PushbulletLog to console?
  compact: false,           // should objects be prettyfied?
  prependDate: false,       // should dates be added to the beginning of logs?
  label: 'App Name'         // when set, the titles to your pushes will be prepended with this
  channels: {               // the channels to use for log, warn, and error
    log: 'LOG-CHANNEL',
    warn: 'WARNING0-CHANNEL',
    error: 'ERROR-CHANNEL'
  },
}
```
You do not have to set a different channel for log, warn, and error. However, `channels.log` must be set at least, and each member of `channels` you don't set will default to `channels.log`
Instead of setting `channels`, you can just set just `channel`. Log, warn, and error will all use the same channel you specified.

## Advanced Usage
### Send custom pushes
PushbulletLog automatically sets the title and body of your push notifications. If you'd like to have more control, you can use `makePush('custom title', 'custom body', severity)`

**NOTE: severity must be either 'log', 'warn', or 'error', as it is used to determine the channel to push to.**
### Override Console
You can override console.log/warn/error and have all errors and logs elsewhere in your application be delivered as push notifications simply by calling ```pbl.overrideConsole()```

Any successive calls to console.log/warn/error will be proxied to pbl.log/warn/error
### Get notified when your application goes offline
```
// Notify on uncaughtException / crash
process.on('uncaughtException', async err => {
  await pbl.error('FATALITY!', err.stack) // await is needed so the push is sent before closing
  process.exit(-1)
})

// catch SIGINT and SIGHUP
require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
}).on('SIGINT', () => { process.emit('SIGINT') })
process.on('SIGINT', () => { process.emit('SIGHUP') }) // treat SIGINT as SIGHUP
process.on('SIGHUP', async () => {
  await pbl.log('App is shutting down')
  process.exit(0)
})
```
Calls to log/warn/error returns a promise which resolves when the push is sent, or if the push failed (it resolves in either case).

### Bypass pushing console messages
After calling `overrideConsole()`, you might want to use the console without pushing to pushbullet. To do this, you can do: `pbl.originalConsole.log('log message not pushed')`. The values of `originalConsole` were the original values of `console` when you created the instance of pushbullet-log.

# Limitations
- Obviously since it connects with pushbullet, an internet connection is required. If there is none present when log/warn/error is called, then a connection error will be written to console.error and the default console is used.
- Pushbullet's API limits the ammount of requests that can be made each month.
When this limit is reached, an error will be logged to console.error each time
an attempt fails. The monthly quota for Free Pushbullet accounts is 500 messages per month

# License
This software is licensed under the [MIT License](https://github.com/ferm10n/pushbullet-log/blob/master/LICENSE)

Copyright © 2017 John Sanders (ferm10n)
