const suncalc = require('suncalc')
const Astro = require('astronomy-engine')
const { addDays } = require('date-fns')

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
  getTimes = (date, lat, lon, type) => {
    try {
      const args = [date, +lat, +lon]
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
      const { phase, ...rest } = suncalc.getMoonIllumination(date)
      return {
        ...rest,
        phase,
        phaseName: this.getPhaseName(phase)
      }
    } catch (err) {
      throw new Error(`ASTRO - GET MOON PHASE ERROR: ${err.message}`)
    }
  }

  getPositions = (date, lat, lon, type) => {
    try {
      const args = [date, +lat, +lon]
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

  getAllPositions = (date, lat, lon) => {
    const observer = new Astro.Observer(+lat, +lon, 0)
    const bodies = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
    return bodies.reduce((acc, body) => {
      let equ_2000 = Astro.Equator(body, date, observer, false, true);
      let equ_ofdate = Astro.Equator(body, date, observer, true, true);
      let hor = Astro.Horizon(date, observer, equ_ofdate.ra, equ_ofdate.dec, 'normal');
      return {
        ...acc,
        [body.toLowerCase()]: {
          ra: equ_2000.ra,
          dec: equ_2000.dec,
          alt: hor.altitude,
          az: hor.azimuth,
        }
      }
    }, { date })
  }

  getAllTimes = (dateParam, lat, lon) => {
    const observer = new Astro.Observer(+lat, +lon, 0)
    const date = dateParam
    const bodies = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
    return bodies.reduce((acc, body) => {
      const rise = Astro.SearchRiseSet(Astro.Body[body], observer, +1, date, 300);
      const set = Astro.SearchRiseSet(Astro.Body[body], observer, -1, date, 300);
      const culm = Astro.SearchHourAngle(Astro.Body[body], observer, 0, date);
      
      return {
        ...acc,
        [body.toLowerCase()]: {
          rise: rise.date,
          set: set.date,
          culm: {
            time: culm.time.date,
            coords: culm.hor
          },
        }
      }
    }, {})
  }

  getSummary = async (date, lat, lon) => {
    const type = 'all'
    const times = await this.getTimes(date, lat, lon, type)
    const position = await this.getPositions(date, lat, lon, type)
    const moonphase = await this.getMoonPhase(date)
    const bodies = await this.getAllPositions(date, +lat, +lon)

    return { times, position, moonphase, bodies, }
  }

  getSummaryReport = async (date, lat, lon) => {
    const summary = await this.getSummary(date, lat, lon)
    const tomorrow = await this.getSummary(addDays(date, 1), lat, lon)
    return { ...summary, tomorrow }
  }


  getNextMoonPhases = (date, numDays) => {
    const arr = Array.from({ length: numDays }, (_, i) => i)
    return arr.reduce((acc, idx) => {
      if (idx === 0) { return [ Astro.SearchMoonQuarter(date) ] }
      return [ ...acc, Astro.NextMoonQuarter(acc[idx - 1]) ]
    }, []).map(({ quarter, time: { date: qtrDate } }) => ({ quarter, date: qtrDate }))
  }

  getMoonPhases = async (date) => {
    const currentPhase = Astro.MoonPhase(date)
    const nextQuarters = this.getNextMoonPhases(date, 10)
    return { date, currentPhase, nextQuarters }
  }
}

const astro = new Astronomy()

module.exports = astro
