const nws = require('../services/nws')
const climateStructure = require('../lib/data/climateReportStructure.js')

const parseLineValues = (line, breaks) => {
  return Object.entries(breaks).reduce((finalValue, [ key, value ]) => {
    const [ start, end ] = value
    const thing = line.slice(start, end).trim()
    return {
      ...finalValue,
      [key]: thing
    }
  }, {})
}

const parseCategory = (array, { getLine, ...category }) => {
  const categoryLine = array.findIndex(getLine)
  return Object.entries(category).reduce(( finalValue, [ subCategory, meta ] ) => {
    const { index, breaks } = meta
    const line = categoryLine + index
    const lineValues = parseLineValues(array[line], breaks)
    return {
      ...finalValue,
      [subCategory]: lineValues
    }
  }, {})
}

const parseClimateReport = async () => {
  const climateText = await nws.getClimateReport()
  // const climateText = await fs.readFile('lib/data/climate-report-test.txt', { encoding: 'utf8' })
  const array = climateText.split('\n')
  const categories = Object.entries(climateStructure).reduce((finalValue, entry) => {
    const [ key, category ] = entry
    const categoryValues = parseCategory(array, category)
      return {
        ...finalValue,
        [key]: categoryValues
      }
  }, {})

  console.log({ categories: categories.hdd })
  return categories
}

module.exports = parseClimateReport
