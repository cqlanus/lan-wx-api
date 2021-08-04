const fs = require('fs').promises
const request = require('../utils/request')
const datasets = ['normals-daily', 'daily-summaries']

const mergeResults = (results) => {
  const resultObject = results.reduce((merged, { dataTypes }) => {
    const objectifiedDatatypes = dataTypes.reduce((obj, type) => {
      return {
        ...obj,
        [type.id]: type
      }
    }, {})
    return {
      ...merged,
      ...objectifiedDatatypes
    }
  }, {})
  return Object.values(resultObject)
}

const tags = [ 'temperature', 'soil', 'wind', 'precipitation', 'snow', 'hail', 'fog', 'freezing', 'evap', 'ice', 'degree day', 'minimum', 'maximum', 'average', 'probability', 'heating', 'cooling', 'growing'  ]
const addTags = datatype => {
  const { name } = datatype
  return tags.reduce((acc, t) => {
    if (name.toLowerCase().includes(t)) {
      const currentTags = acc.tags || []
      return {
        ...acc,
        tags: [ ...currentTags, t  ]
      }
    }
    return acc
  }, datatype)
}

const createTagStrcuture = datatypes => {
  return datatypes.reduce((acc, dt) => {
    tags.forEach(tag => {
      if (dt.name.toLowerCase().includes(tag)) {
        const existing = acc[tag] || []
        acc = {
          ...acc,
          [tag]: [ ...existing, dt ]
        }
      }
    })
    return acc
  }, {})
}

const getDatasets = async () => {
  const url = (dataset) => `https://www.ncei.noaa.gov/access/services/search/v1/data?dataset=${dataset}&format=json`

  const promises = datasets.map(async set => {
    const setUrl = url(set)
    const { results } = await request(setUrl)
    const merged = mergeResults(results)
    const filename = `../lib/data/${set}-datatypes.json`
    const formatted = merged
          .map(({ id, name }) => ({ id, name }))
          .map(addTags)

    const tagStruct = createTagStrcuture(formatted)
    console.log({ tagStruct: tagStruct.temperature })
    const final = {
      tags: tagStruct,
      dataTypes: formatted
    }
    await fs.writeFile(filename, JSON.stringify(final))
  })
  await Promise.all(promises)
  console.log({ done: 1 })
}

getDatasets()
