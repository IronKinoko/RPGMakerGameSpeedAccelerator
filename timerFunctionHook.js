;(function () {
  const defaultSpeed = 1

  const $gameSpeed = {
    prevToggleSpeed: 1.0,
    speedMultiplier: defaultSpeed,
    setSpeed: function (speed) {
      this.speedMultiplier = Math.max(0.5, Math.min(20.0, speed))
      this.updateTitle()
    },
    setSpeedDiff: function (diff) {
      this.setSpeed(this.speedMultiplier + diff)
    },
    toggleSpeed: function () {
      var currentSpeed = this.speedMultiplier
      if (currentSpeed !== 1) {
        this.setSpeed(1.0)
        this.prevToggleSpeed = currentSpeed
      } else {
        this.setSpeed(this.prevToggleSpeed)
      }
    },
    getSpeed: function () {
      return this.speedMultiplier
    },
    updateTitle: function () {
      var title = document.title.replace(/\s\[\d+\.\dx\]$/, '')
      var speedText = '[' + this.speedMultiplier.toFixed(1) + 'x]'
      document.title = title + ' ' + speedText
    },
  }

  let currentTime = performance.now()
  let prevNow
  const originPerformanceNow = performance.now.bind(performance)

  const updateCurrentTime = (now) => {
    if (!prevNow) {
      prevNow = now
      currentTime = now
    }
    const diff = now - prevNow
    currentTime = currentTime + diff * $gameSpeed.getSpeed()

    prevNow = now

    return currentTime
  }
  performance.now = function () {
    return updateCurrentTime(originPerformanceNow())
  }
  const originRequestAnimationFrame = window.requestAnimationFrame.bind(window)
  requestAnimationFrame = function (callback) {
    return originRequestAnimationFrame((now) => {
      callback(updateCurrentTime(now))
    })
  }

  const originSetTimeout = setTimeout
  setTimeout = function (callback, delay, ...args) {
    const adjustedDelay = Math.round(delay / $gameSpeed.getSpeed())
    return originSetTimeout(callback, adjustedDelay, ...args)
  }
  window.setTimeout = setTimeout

  const originSetInterval = setInterval
  setInterval = function (callback, delay) {
    const idRef = { current: null }
    function loop() {
      callback()
      idRef.current = setTimeout(loop, delay)
    }
    idRef.current = setTimeout(loop, delay)
    return idRef.current
  }
  window.setInterval = setInterval

  clearInterval = (function (originClearInterval) {
    return function (id) {
      if (typeof id === 'object' && id !== null && 'current' in id) {
        clearTimeout(id.current)
      } else {
        originClearInterval(id)
      }
    }
  })(clearInterval)
  window.clearInterval = clearInterval

  Date.now = function () {
    return performance.now()
  }

  $gameSpeed.setSpeed(defaultSpeed)

  originSetInterval(() => $gameSpeed.updateTitle(), 16)

  document.addEventListener('keydown', function (e) {
    const key = e.key.toLowerCase()

    if (!e.shiftKey) return
    if (key === 'c') {
      e.preventDefault()
      $gameSpeed.setSpeedDiff(0.5)
    } else if (key === 'x') {
      e.preventDefault()
      $gameSpeed.setSpeedDiff(-0.5)
    } else if (key === 'z') {
      e.preventDefault()
      $gameSpeed.toggleSpeed()
    }
  })
})()
