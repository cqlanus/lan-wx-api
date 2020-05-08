const fetch = require('node-fetch')

const request = async (url, opts) => {
  const res = await fetch(url, opts)
  const json = await res.json()
  return json
}

module.exports = request
