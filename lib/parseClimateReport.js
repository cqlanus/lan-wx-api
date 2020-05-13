const climateStructure = require('./data/climateReportStructure.js')

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
    const { index, breaks, getLine: gLine } = meta
    const line = gLine ? array.findIndex(gLine) : categoryLine + index
    const lineValues = parseLineValues(array[line], breaks)
    return {
      ...finalValue,
      [subCategory]: lineValues
    }
  }, {})
}

const parseClimateReport = (climateText) => {
  const array = climateText.split('\n')
  const categories = Object.entries(climateStructure).reduce((finalValue, entry) => {
    const [ key, category ] = entry
    const categoryValues = parseCategory(array, category)
      return {
        ...finalValue,
        [key]: categoryValues
      }
  }, {})
  return categories
}

module.exports = parseClimateReport
