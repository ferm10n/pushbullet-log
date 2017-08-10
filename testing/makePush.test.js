import test from 'ava'

function freshlyRequire (m) {
  delete require.cache[require.resolve(m)]
  return require(m)
}

test('https request', t => {
  const mockRequest = (opts, rcb) => {
    mockRequest.payload = null
    mockRequest.end = false
    rcb({
      on: (type, handler) => { handler() }
    })
    mockRequest.options = opts
    return {
      write: data => { mockRequest.payload = data },
      end: () => { mockRequest.end = true }
    }
  }
  freshlyRequire('https').request = mockRequest
  const PL = freshlyRequire('../index')
  const p = new PL({
    token: 'testToken',
    channel: 'logChannel',
    useConsole: false
  })
  p.log('testTitle', 'testBody')
  t.deepEqual(mockRequest.options, {
    host: 'api.pushbullet.com',
    path: '/v2/pushes',
    port: '443',
    method: 'POST',
    headers: {
      'Access-Token': 'testToken',
      'Content-Type': 'application/json'
    }
  }, 'expected https options')
  t.true(mockRequest.end, 'request was ended')
  t.is(typeof mockRequest.payload, 'string')
  const parsedPayload = JSON.parse(mockRequest.payload)
  t.deepEqual(parsedPayload, {
    body: 'testBody',
    title: 'LOG: testTitle',
    type: 'note',
    channel_tag: 'logChannel'
  })
})

// test('awaits completion', t => {
//
// })
