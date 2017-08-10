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

module.exports = {
  freshlyRequire: freshlyRequire,
  mockRequest: mockRequest
}
