import test from 'ava'
const PL = require('../index')

test('defaults', t => {
  const p = new PL({
    token: 'test',
    channel: 'logChannel'
  })
  t.false(p.prependDate)
  t.is(p.channels.warn, 'logChannel', 'default warn channel is log channel')
  t.is(p.channels.error, 'logChannel', 'default error channel is log channel')
  t.true(p.compact)
})

test('required options', t => {
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
})

test('prependDate', t => {
  t.plan(3)
  const p = new PL({
    token: 'testToken',
    channel: 'testChannel',
    prependDate: true
  })
  t.true(p.prependDate)
  p.makePush = (title, message) => {
    const split = message.split('\n')
    t.is(split[1], 'stuff', 'original message')
    t.is(new Date(split[0]).toString(), split[0], 'date present')
  }
  p.log('test', 'stuff')
})

test('compact', t => {
  t.plan(1)
  const p = new PL({
    token: 'testToken',
    channel: 'testChannel',
    compact: true
  })
  p.makePush = (title, message) => {
    t.is(message, '{\n  "a": "b"\n}')
  }
  p.log({a: 'b'})
})
