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
  t.false(p.compact)
  t.true(p.useConsole)
})

test('required options', t => {
  t.notThrows(() => {
    return new PL({ token: 'test' })
  }, 'correct options, multiple channels')

  t.throws(() => {
    return new PL()
  }, Error, 'no options')
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
    prependDate: true,
    useConsole: false
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
    compact: true,
    useConsole: false
  })
  p.makePush = (title, message) => {
    t.is(message, '{"a":"b"}')
  }
  p.log({a: 'b'})
})

test('useConsole', t => {
  t.plan(7)

  const oldLog = console.log
  const oldWarn = console.warn
  const oldError = console.error

  const p = new PL({
    token: 'testToken',
    channel: 'testChannel',
    useConsole: true
  })

  // original console is intact
  t.is(p.originalConsole.log, oldLog)
  t.is(p.originalConsole.warn, oldWarn)
  t.is(p.originalConsole.error, oldError)

  // p should call original console
  p.originalConsole = {
    log: l => { t.is(l, 'test log') },
    warn: w => { t.is(w, 'test warn') },
    error: e => { t.is(e, 'test error') }
  }

  p.makePush = () => {}
  t.true(p.useConsole)
  p.log('test log')
  p.warn('test warn')
  p.error('test error')

  console.log = oldLog
  console.warn = oldWarn
  console.error = oldError
})

test('label', t => {
  t.plan(2)
  const p = new PL({
    token: 'testToken',
    useConsole: false,
    label: 'TestApp'
  })
  t.is(p.label, 'TestApp')
  p.makePush = (title, message) => {
    t.is(title, 'TestApp LOG: test log')
  }
  p.log('test log')
})

test('production only', t => {
  t.plan(1)
  const oldRequest = PL._request
  const oldDns = PL._dns
  PL._request = () => { t.fail('should not have happened') }
  PL._dns = { lookup: (name, cb) => { cb() } }
  const p = new PL({
    token: 'testToken',
    pushOnProductionOnly: true
  })
  p.originalConsole.log = () => {
    t.pass()
  }
  p.log('test')

  PL._request = oldRequest
  PL._dns = oldDns
})
