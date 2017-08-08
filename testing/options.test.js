import test from 'ava'
const PL = require('../index')

test('required options', t => {
  t.notThrows(() => {
    return new PL({
      token: 'test',
      channel: 'test'
    })
  }, 'correct options')

  t.notThrows(() => {
    return new PL({
      token: 'test',
      channels: {
        log: 'test',
        warn: 'test',
        error: 'test'
      }
    })
  }, 'correct options, multiple channels')

  t.throws(() => {
    return new PL()
  }, Error, 'no options')

  t.throws(() => {
    return new PL({
      channel: 'test'
    })
  }, Error, 'missing token')

  t.throws(() => {
    return new PL({
      token: 'test'
    })
  }, Error, 'missing channel')
})

test('channels', t => {
  let p = new PL({
    token: 'test',
    channels: {
      log: 'logChannel',
      warn: 'warnChannel',
      error: 'errorChannel'
    }
  })
  t.is(p.channels.log, 'logChannel')
  t.is(p.channels.warn, 'warnChannel')
  t.is(p.channels.error, 'errorChannel')

  p = new PL({
    token: 'testToken',
    channel: 'logChannel'
  })
  t.is(p.token, 'testToken', 'token is set')
  t.is(p.channels.warn, 'logChannel', 'default warn channel is log channel')
  t.is(p.channels.error, 'logChannel', 'default error channel is log channel')
})

// test('enabling prependDate prepends the date', t => {
//   const pblog = freshlyRequire('../index')
//   pblog.
// })
