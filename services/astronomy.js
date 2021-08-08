const suncalc = require('suncalc')
const Astro = require('astronomy-engine')
const {
  addDays,
  subDays,
  addMinutes,
  eachDayOfInterval,
  eachHourOfInterval,
  compareAsc,
} = require('date-fns')
const nws = require('./nws')
const air = require('./air')

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

const MOON_PHASES_DEG = {
  new: 0,
  waxingCrescent: [0, 90],
  firstQuarter: 90,
  waxingGibbous: [90, 180],
  full: 180,
  waningGibbous: [180, 270],
  lastQuarterr: 270,
  waningCrescent: [270, 360]
}

const msInDay = 1000 * 60 * 60 * 24
const realDiff = (diff) => msInDay - diff

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

  getPhaseName = (phase, isRadians = true) => {
    const phases = isRadians ? MOON_PHASES : MOON_PHASES_DEG
    return Object.entries(phases).reduce((name, [key, val]) => {
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

  getTimeDuration = ms => {
    const hours = Math.floor(ms / 3.6e6)
    const minutes = Math.floor((ms % 3.6e6) / 6e4)
    const seconds = Math.floor((ms % 6e4) / 1000)
    return { hours, minutes, seconds }
  }

  compareDayLength = (d1, d2, dayNight = 'day') => {
    const mapping = {
      day: { startEnd: ['sunrise', 'sunset'] },
      night: { startEnd: ['night', 'nightEnd'] },
      nautical: { startEnd: ['nauticalDawn', 'nauticalDusk'] },
      civil: { startEnd: ['dawn', 'dusk'] },
    }
    const [start, end] = mapping[dayNight].startEnd
    const lengthOfDay1 = d1[end] - d1[start]
    const lengthOfDay2 = d2[end] - d2[start]
    const compared = lengthOfDay1 > lengthOfDay2 ? 'longer' : 'shorter'
    const diff = Math.abs(lengthOfDay1 - lengthOfDay2)
    const { hours, minutes, seconds } = this.getTimeDuration(diff)
    return { hours, minutes, seconds, compared }
  }

  getSunSummary = async (date, lat, lon) => {
    const times = await this.getTimes(date, lat, lon, 'sun')
    const allPositions = await this.getAllPositions(date, lat, lon)
    const { sun: position } = allPositions

    const yesterdayTimes = await this.getTimes(subDays(date, 1), lat, lon, 'sun')
    const tomorrowTimes = await this.getTimes(addDays(date, 1), lat, lon, 'sun')

    const diffWithTomorrow = this.compareDayLength(times, tomorrowTimes, 'day')
    const diffWithYesterday = this.compareDayLength(times, yesterdayTimes, 'day')

    const day = this.getTimeDuration(times.sunset - times.sunrise)
    const civil = this.getTimeDuration(realDiff(times.dusk - times.dawn))
    const lengths = { day, civil }
    const compared = {
      tomorrow: diffWithTomorrow,
      yesterday: diffWithYesterday,
    }
    return { times, position, compared, lengths }
  }

  getMoonSummary = async (date, lat, lon) => {
    const times = await this.getTimes(date, lat, lon, 'all')
    const allPositions = await this.getAllPositions(date, lat, lon)
    const { moon: position } = allPositions

    const yesterdayTimes = await this.getTimes(subDays(date, 1), lat, lon, 'all')
    const tomorrowTimes = await this.getTimes(addDays(date, 1), lat, lon, 'all')

    const diffWithTomorrow = this.compareDayLength(times, tomorrowTimes, 'night')
    const diffWithYesterday = this.compareDayLength(times, yesterdayTimes, 'night')

    const night = this.getTimeDuration(realDiff(times.night - times.nightEnd))
    const nautical = this.getTimeDuration(realDiff(times.nauticalDusk - times.nauticalDawn))
    const lengths = { night, nautical }
    const compared = {
      tomorrow: diffWithTomorrow,
      yesterday: diffWithYesterday,
    }
    return { times, position, compared, lengths }
  }

  getSummaryReport = async (date, lat, lon) => {
    const summary = await this.getSummary(date, lat, lon)
    const tomorrow = await this.getSummary(addDays(date, 1), lat, lon)
    return { ...summary, tomorrow }
  }


  getNextMoonPhases = (date, numDays) => {
    const arr = Array.from({ length: numDays }, (_, i) => i)
    return arr.reduce((acc, idx) => {
      if (idx === 0) { return [Astro.SearchMoonQuarter(date)] }
      return [...acc, Astro.NextMoonQuarter(acc[idx - 1])]
    }, []).map(({ quarter, time: { date: qtrDate } }) => ({ quarter, date: qtrDate }))
  }

  getMoonPhases = async (date) => {
    const currentPhase = Astro.MoonPhase(date)
    const nextQuarters = this.getNextMoonPhases(date, 10)
    const { fraction } = suncalc.getMoonIllumination(date)
    return {
      date,
      phase: {
        value: currentPhase,
        name: this.getPhaseName(currentPhase, false),
        illumination: fraction,

      },
      nextQuarters
    }
  }

  getTimesForInterval = (start, end, lat, lon) => {
    const dates = eachDayOfInterval({ start, end })
    return dates.map(date => ({ date, times: this.getTimes(date, lat, lon) }))
  }

  getPositionsForInterval = (start, end, lat, lon) => {
    const hours = eachHourOfInterval({ start, end })
    return hours.flatMap(date => ([date, addMinutes(date, 15), addMinutes(date, 30), addMinutes(date, 45)]))
      .map(date => ({ date, bodies: this.getAllPositions(date, lat, lon) }))
  }

  getCurrentConditions = async (date, lat, lon) => {
    try {
      const { cloudLayers, dewpoint } = await nws.getConditions({ lat, lon })

      const times = await this.getTimes(date, lat, lon)
      const { nauticalDusk, nauticalDawn, night, nightEnd } = times
      const isAfterNightStart = compareAsc(date, new Date(night)) > 0
      const isBeforeNightEnd = compareAsc(new Date(nightEnd), date) > 0
      const isNight = isAfterNightStart && isBeforeNightEnd
      const isAfterNauticalStart = compareAsc(date, new Date(nauticalDusk)) > 0
      const isBeforeNauticalEnd = compareAsc(new Date(nauticalDawn), date) > 0
      const isNauticalTwilight = isAfterNauticalStart && isBeforeNauticalEnd && !isNight

      const allPositions = await this.getAllPositions(date, lat, lon)
      const { moon: position } = allPositions
      const { phase: moonPhase } = this.getMoonPhases(date, lat, lon)

      const aqi = await air.getCurrent(lat, lon)

      return {
        cloudLayers,
        dewpoint,
        darkness: { isNight, isNauticalTwilight },
        moonPosition: position,
        moonPhase,
        aqi,
      }
    } catch (err) {
      throw new Error(`ASTRO - GET CURRENT CONDITIONS ERROR: ${err.message}`)
    }
  }
}

const astro = new Astronomy()

module.exports = astro
