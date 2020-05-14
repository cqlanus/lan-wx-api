const suncalc = require('suncalc')

const MOON_PHASES = {
  new: 0,
  waxingCrescent: [0, 0.25],
  firstQuarter: 0.25,
  waxingGibbous: [0.25, 0.5],
  full: 0.5,
  waningGibbous: [0.5, 0.75],
  lastQuarterr: 0.75,
  waningCrescent: [0.75, 1.0]
}

class Astronomy {
  getTimes = ({ lat, lon }, date, type) => {
    try {
      const args = [date.toDate(), +lat, +lon]
      switch (type) {
        case 'sun':
          return suncalc.getTimes(...args)
        case 'moon':
          return this.getMoonTimes(...args)
        default: {
          const sun = suncalc.getTimes(...args)
          const moon = this.getMoonTimes(...args)
          return { ...sun, ...moon }
        }
      }
    } catch (err) {
      throw new Error(`ASTRO - GET TIMES ERROR: ${err.message}`)
    }
  }

  getMoonTimes = (date, lat, lon) => {
    const { rise, set, ...rest } = suncalc.getMoonTimes(date, +lat, +lon)
    return {
      ...rest,
      moonrise: rise,
      moonset: set
    }
  }

  getPhaseName = (phase) => {
    return Object.entries(MOON_PHASES).reduce((name, [key, val]) => {
      if (Array.isArray(val)) {
        let [lowerBound, upperBound] = val
        if (phase > lowerBound && phase < upperBound) {
          return key
        }
      } else if (val === phase) {
        return key
      }
      return name
    }, '')
  }

  getMoonPhase = (date) => {
    try {
      const { phase, ...rest } = suncalc.getMoonIllumination(date.toDate())
      return {
        ...rest,
        phase,
        phaseName: this.getPhaseName(phase)
      }
    } catch (err) {
      throw new Error(`ASTRO - GET MOON PHASE ERROR: ${err.message}`)
    }
  }

  getPositions = ({ lat, lon }, date, type) => {
    try {
      const args = [date.toDate(), +lat, +lon]
      switch (type) {
        case 'sun':
          return suncalc.getPosition(...args)
        case 'moon':
          return this.getMoonPosition(...args)
        default: {
          const sun = suncalc.getPosition(...args)
          const moon = this.getMoonPosition(...args)
          return { ...sun, ...moon }
        }
      }
    } catch (err) {
      throw new Error(`ASTRO - GET POSITION ERROR: ${err.message}`)
    }
  }

  getMoonPosition = (date, lat, lon) => {
    const moonPos = suncalc.getMoonPosition(date, +lat, +lon)
    return Object.entries(moonPos).reduce((acc, [key, val]) => {
      return {
        ...acc,
        [`moon_${key}`]: val
      }
    }, {})
  }
}

const astro = new Astronomy()

module.exports = astro
