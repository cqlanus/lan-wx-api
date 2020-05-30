module.exports = {
  temp: {
    parse: val => +( Number(val) * 0.1 ).toFixed(2),
    types: [ /tmin/, /tmax/, /tavg/, /dutr/ ],
    unit: 'degF',
  },
  degreeDay: {
    parse: val => Number(val),
    types: [ /htdd/, /cldd/, /grdd/ ],
    unit: 'degF',
  },
  precip: {
    parse: val => +( Number(val) * 0.01 ).toFixed(2),
    types: [ /prcp-(?!pctall)/ ],
    unit: 'in',
  },
  snow: {
    parse: val => +( Number(val) * 0.1 ).toFixed(2),
    types: [ /snow-(?!pctall)/ ],
    unit: 'in',
  },
  snowDepth: {
    parse: val => Number(val),
    types: [ /snwd-(?!pctall)/ ],
    unit: 'in',
  },
  probability: {
    parse: val => +( Number(val) * 0.1 ).toFixed(2),
    types: [ /pctall/ ],
    unit: 'percent',
  },
}
