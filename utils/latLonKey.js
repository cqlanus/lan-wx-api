const latLonKey = ({ lat, lon }) => `${(+lat).toFixed(3)}|${(+lon).toFixed(3)}`

module.exports = latLonKey
