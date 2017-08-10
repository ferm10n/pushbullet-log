const mockRequest = function () {
  const req = (opts, rcb) => {
    rcb({
      on: (type, handler) => {
        if (type === 'data') handler()
        else req.listeners[type] = handler
      }
    })
    req.options = opts
    return {
      write: data => { req.payload = data },
      end: () => { req.end = true }
    }
  }
  req.payload = null
  req.end = false
  req.listeners = {}
  return req
}

module.exports = {
  mockRequest: mockRequest
}
