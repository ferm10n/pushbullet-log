const mockRequest = function () {
  const listeners = {}
  let options = {}
  const req = (opts, rcb) => {
    rcb({
      on: (type, handler) => {
        if (type === 'data') handler()
        else listeners[type] = handler
      }
    })
    Object.assign(options, opts)
    return {
      write: data => { req.payload = data },
      end: () => { req.ended = true }
    }
  }
  req.options = options
  req.payload = null
  req.ended = false
  req.listeners = listeners
  return req
}

module.exports = {
  mockRequest: mockRequest
}
