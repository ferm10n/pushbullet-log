import test from 'ava'

function freshlyRequire (m) {
  delete require.cache[require.resolve(m)]
  return require(m)
}

test('https request', t => {
  let options
  let payload
  let end = false
  const mockRequest = (opts, rcb) => {
    rcb({
      on: (type, handler) => { handler() }
    })
    options = opts
    return {
      write: data => { payload = data },
      end: () => { end = true }
    }
  }
  freshlyRequire('https').request = mockRequest
  const PL = freshlyRequire('../index')
  const p = new PL({
    token: 'testToken',
    channel: 'logChannel'
  })
  p.log('testTitle', 'testBody')
  t.deepEqual(options, {
    host: 'api.pushbullet.com',
    path: '/v2/pushes',
    port: '443',
    method: 'POST',
    headers: {
      'Access-Token': 'testToken',
      'Content-Type': 'application/json'
    }
  }, 'expected https options')
  t.true(end, 'request was ended')
  t.is(typeof payload, 'string')
  const parsedPayload = JSON.parse(payload)
  t.deepEqual(parsedPayload, {
    body: 'testBody',
    title: 'LOG: testTitle',
    type: 'note',
    channel_tag: 'logChannel'
  })
})
