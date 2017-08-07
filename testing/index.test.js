import test from 'ava'
const PushLog = require('../index')

function freshlyRequire (m) {
  delete require.cache[require.resolve(m)]
  return require(m)
}

test('does nothing when nothing is logged', t => {
  const pl = new PushLog()
  pl.makePush = () => { t.fail('should not have acted') }
  pl.log()
  pl.warn()
  pl.error()
  t.pass()
})

test('severity is set', t => {
  t.plan(3)
  const pblog = new PushLog()

  pblog.makePush = (l, m, s) => { t.is(s, 'LOG') }
  pblog.log('test')

  pblog.makePush = (l, m, s) => { t.is(s, 'WARN') }
  pblog.warn('test')

  pblog.makePush = (l, m, s) => { t.is(s, 'ERROR') }
  pblog.error('test')
})

test('usage forms', t => {
  t.plan(8)
  let pl = new PushLog()

  pl.makePush = (title, message) => {
    t.is(title, 'LOG: ')
    t.is(message.replace(/\s/mgi,''), '{"a":"b"}')
  }
  pl.log({a:'b'}) // LOG, {"a":"b"}

  pl.makePush = (title, message) => {
    t.is(title, 'LOG: test')
    t.is(message, '')
  }
  pl.log('test') // LOG: test, ''

  pl.makePush = (title, message) => {
    t.is(title, 'LOG: test')
    t.is(message, '5')
  }
  pl.log('test', 5) // LOG: test, '5'

  pl.makePush = (title, message) => {
    t.is(title, 'LOG: test')
    t.is(message, '5, 5')
  }
  pl.log('test', 5, 5) // LOG: test, '5, 5'
})

// test('enabling prependDate prepends the date', t => {
//   const pblog = freshlyRequire('../index')
//   pblog.
// })
