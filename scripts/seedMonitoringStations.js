const fs = require('fs').promises
const request = require('../utils/request')

const BASE = 'https://s3-us-west-1.amazonaws.com//files.airnowtech.org/airnow/today'

const STRUCTURE = [
    'aqsid',
    'param',
    'site_code',
    'site_name',
    'status',
    'agency_id',
    'agency_name',
    'epa_region',
    'latitude',
    'longitude',
    'elevation',
    'gmt_offset',
    'country_code',
    'blank1',
    'blank2',
    'msa_code',
    'msa_name',
    'state_code',
    'state_name',
    'county_code',
    'county_name',
    'blank3',
    'blank4',
]

const processStations = data => {
    return data.split('\n')
        // .filter(line => line.match(/illinois/gi))
        .map(line => {
            const obj = line.trim().split('|')
                .reduce((acc, item, idx) => {
                    const key = STRUCTURE[idx]
                    return {
                        ...acc,
                        [STRUCTURE[idx]]: ['latitude', 'longitude'].includes(key) ? +item : item
                    }
                }, {})
            /* eslint-disable-next-line */
            const { blank1, blank2, blank3, blank4, ...nonBlank } = obj
            return nonBlank

        })
}
const getStation = async () => {
    const file = 'monitoring_site_locations.dat'
    const url = `${BASE}/${file}`
    const data = await request(url, {}, false)
    const text = await data.text()
    const formatted = processStations(text)
    const filename = './lib/data/monitoring-stations.json'

    await fs.writeFile(filename, JSON.stringify(formatted))
}

getStation()
