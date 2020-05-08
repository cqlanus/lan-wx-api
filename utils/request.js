const fetch = require('node-fetch')

const request = async (url, opts, sendJSON = true) => {
  const res = await fetch(url, opts)
  if (sendJSON) {
    const json = await res.json()
    return json
  }
  return res
}

module.exports = request
