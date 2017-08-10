import test from 'ava'

function freshlyRequire (m) {
  delete require.cache[require.resolve(m)]
  return require(m)
}

const mockRequest = (opts, rcb) => {
  mockRequest.payload = null
  mockRequest.end = false
  mockRequest.listeners = {}
  rcb({
    on: (type, handler) => {
      if (type === 'data') handler()
      else mockRequest.listeners[type] = handler
    }
  })
  mockRequest.options = opts
  return {
    write: data => { mockRequest.payload = data },
    end: () => { mockRequest.end = true }
  }
}

test('https request', t => {
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

test('awaits completion', t => {
  freshlyRequire('https').request = mockRequest
  const PL = freshlyRequire('../index')
  const p = new PL({
    token: 'test',
    channel: 'test',
    useConsole: false
  })

  const logPromise = p.log('test')
  t.is(logPromise.toString(), '[object Promise]')
  setTimeout(() => {
    mockRequest.listeners.end()
  }, 10)
  return logPromise
})
