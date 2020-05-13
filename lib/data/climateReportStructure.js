module.exports = {
  temperature: {
    getLine: l => /^TEMPERATURE/.test(l),
    max: {
      line: 25,
      index: 2,
      breaks: {
        title: [ 0, 16 ],
        observed: [ 16, 21 ],
        time: [ 23, 30 ],
        recordValue: [ 31, 34 ],
        recordYear: [ 38, 42 ],
        normalValue: [ 43, 46 ],
        departure: [ 49, 53 ],
        lastYear: [ 59, 62 ]
      }
    },
    min: {
      line: 26,
      index: 3,
      breaks: {
        title: [ 0, 16 ],
        observed: [ 16, 21 ],
        time: [ 23, 30 ],
        recordValue: [ 31, 34 ],
        recordYear: [ 38, 42 ],
        normalValue: [ 43, 46 ],
        departure: [ 49, 53 ],
        lastYear: [ 59, 62 ]
      }

    },
    avg: {
      line: 27,
      index: 4,
      breaks: {
        title: [ 0, 16 ],
        observed: [ 16, 21 ],
        normalValue: [ 43, 46 ],
        departure: [ 49, 53 ],
        lastYear: [ 59, 62 ]
      }
    }
  },
  precipitation: {
    getLine: l => /^PRECIPITATION/.test(l),
    forDay: {
      line: 30,
      index: 1,
      breaks: {
        title: [ 0, 16 ],
        observed: [ 16, 23 ],
        recordValue: [ 33, 37 ],
        recordYear: [ 37, 42 ],
        normalValue: [43, 49],
        departure: [ 50, 56],
        lastYear: [ 59, 65 ]
      }
    },
    mtd: {
      line: 31,
      index: 2,
      breaks: {
        title: [ 0, 16 ],
        observed: [ 16, 23 ],
        normalValue: [43, 49],
        departure: [ 50, 56],
        lastYear: [ 59, 65 ]
      }
    },
    since1: {
      line: 32,
      index: 3,
      breaks: {
        title: [ 0, 16 ],
        observed: [ 16, 23 ],
        normalValue: [43, 49],
        departure: [ 50, 56],
        lastYear: [ 59, 65 ]
      }
    },
    since2: {
      line: 33,
      index: 4,
      breaks: {
        title: [ 0, 16 ],
        observed: [ 16, 23 ],
        normalValue: [43, 49],
        departure: [ 50, 56],
        lastYear: [ 59, 65 ]
      }
    }
  },
  snowfall: {
    getLine: l => /^SNOWFALL/.test(l),
    forDay: {
      line: 36,
      index: 1,
      breaks: {
        title: [ 0, 16 ],
        observed: [ 16, 23 ],
        recordValue: [ 33, 37 ],
        recordYear: [ 37, 42 ],
        normalValue: [43, 49],
        departure: [ 50, 56],
        lastYear: [ 59, 65 ]
      }
    },
    mtd: {
      line: 37,
      index: 2,
      breaks: {
        title: [ 0, 16 ],
        observed: [ 16, 23 ],
        normalValue: [43, 49],
        departure: [ 50, 56],
        lastYear: [ 59, 65 ]
      }
    },
    since1: {
      line: 38,
      index: 3,
      breaks: {
        title: [ 0, 16 ],
        observed: [ 16, 23 ],
        normalValue: [43, 49],
        departure: [ 50, 56],
        lastYear: [ 59, 65 ]
      }
    },
    since2: {
      line: 39,
      index: 4,
      breaks: {
        title: [ 0, 16 ],
        observed: [ 16, 23 ],
        normalValue: [43, 49],
        departure: [ 50, 56],
        lastYear: [ 59, 65 ]
      }
    }
  },
  hdd: {
    getLine: l => /HEATING/.test(l),
    forDay: {
      line: 44,
      index: 1,
      breaks: {
        title: [ 0, 16 ],
        observed: [ 16, 21 ],
        normalValue: [43, 49],
        departure: [ 50, 56],
        lastYear: [ 59, 65 ]
      }
    },
    mtd: {
      line: 45,
      index: 2,
      breaks: {
        title: [ 0, 16 ],
        observed: [ 16, 21 ],
        normalValue: [43, 49],
        departure: [ 50, 56],
        lastYear: [ 59, 65 ]
      }
    },
    since1: {
      line: 46,
      index: 3,
      breaks: {
        title: [ 0, 16 ],
        observed: [ 16, 23 ],
        normalValue: [41, 49],
        departure: [ 49, 56],
        lastYear: [ 56, 65 ]
      }
    },
    since2: {
      line: 47,
      index: 4,
      breaks: {
        title: [ 0, 16 ],
        observed: [ 16, 23 ],
        normalValue: [41, 49],
        departure: [ 49, 56],
        lastYear: [ 56, 65 ]
      }
    }
  },
  cdd: {
    getLine: l => /COOLING/.test(l),
    forDay: {
      line: 50,
      index: 1,
      breaks: {
        title: [ 0, 16 ],
        observed: [ 16, 21 ],
        normalValue: [43, 49],
        departure: [ 50, 56],
        lastYear: [ 59, 65 ]
      }
    },
    mtd: {
      line: 51,
      index: 2,
      breaks: {
        title: [ 0, 16 ],
        observed: [ 16, 21 ],
        normalValue: [43, 49],
        departure: [ 50, 56],
        lastYear: [ 59, 65 ]
      }
    },
    since1: {
      line: 52,
      index: 3,
      breaks: {
        title: [ 0, 16 ],
        observed: [ 16, 21 ],
        normalValue: [41, 49],
        departure: [ 49, 56],
        lastYear: [ 56, 65 ]
      }
    },
    since2: {
      line: 53,
      index: 4,
      breaks: {
        title: [ 0, 16 ],
        observed: [ 16, 21 ],
        normalValue: [41, 49],
        departure: [ 49, 56],
        lastYear: [ 56, 65 ]
      }
    }
  },
  tomorrow: {
    getLine: l => /TOMORROW/.test(l),
    maxTemp: {
      getLine: l => /MAXIMUM TEMPERATURE/.test(l),
      breaks: {
        normalValue: [ 25, 30 ],
        recordValue: [ 36, 40 ],
        recordYear: [ 44, 50 ]
      }
    },
    minTemp: {
      getLine: l => /MINIMUM TEMPERATURE/.test(l),
      breaks: {
        normalValue: [ 25, 30 ],
        recordValue: [ 36, 40 ],
        recordYear: [ 44, 50 ]
      }
    }
  },
  sun: {
    getLine: l => /SUNRISE AND SUNSET/.test(l),
    day1: {
      index: 1,
      breaks: {
        date: [ 0, 11 ],
        sunrise: [ 30, 42 ],
        sunset: [ 52, 65 ]
      }
    },
    day2: {
      index: 2,
      breaks: {
        date: [ 0, 11 ],
        sunrise: [ 30, 42 ],
        sunset: [ 52, 65 ]
      }
    }
  }
}
