;(function () {
  var parameters = PluginManager.parameters('GameSpeedAccelerator')
  var defaultSpeed = Number(parameters['defaultSpeed']) || 1.0
  var speedStep = Number(parameters['speedStep']) || 0.5

  // 初始化游戏加速器
  window.$gameSpeed = {
    prevToggleSpeed: 1.0,
    speedMultiplier: defaultSpeed,
    setSpeed: function (speed) {
      this.speedMultiplier = Math.max(0.5, Math.min(20.0, speed))
      this.updateTitle()
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

  if (typeof Zaun !== 'undefined' && Zaun.Performance && SceneManager.determineRepeatNumber) {
    // rmmz + Zaun
    var _SceneManager_determineRepeatNumber = SceneManager.determineRepeatNumber
    SceneManager.determineRepeatNumber = function (deltaTime) {
      return _SceneManager_determineRepeatNumber.call(this, deltaTime) * $gameSpeed.getSpeed()
    }
    SceneManager.initGraphics = function () {
      if (!Graphics.initialize()) throw new Error('Failed to initialize graphics.')
      Graphics.setTickHandler(this.update.bind(this))
    }
  } else if (SceneManager.determineRepeatNumber) {
    // rmmz
    var _SceneManager_determineRepeatNumber = SceneManager.determineRepeatNumber
    SceneManager.determineRepeatNumber = function (deltaTime) {
      // 将 deltaTime 乘以速度倍率
      var adjustedDeltaTime = deltaTime * $gameSpeed.getSpeed()

      // 调用原始方法
      return _SceneManager_determineRepeatNumber.call(this, adjustedDeltaTime)
    }
  } else {
    // rpgmv
    var fnCode = SceneManager.updateMain.toString()
    fnCode = fnCode.replace(
      /this\._accumulator\s*\+=\s*fTime/,
      'this._accumulator += fTime * $gameSpeed.getSpeed()',
    )
    eval('SceneManager.updateMain = ' + fnCode)
  }

  document.addEventListener('keydown', function (e) {
    if (!e.shiftKey) return

    switch (e.key.toLowerCase()) {
      case 'z': // Z键 - 切换正常速度
        var currentSpeed = $gameSpeed.getSpeed()
        if (currentSpeed !== 1) {
          $gameSpeed.setSpeed(1.0)
          $gameSpeed.prevToggleSpeed = currentSpeed
        } else {
          $gameSpeed.setSpeed($gameSpeed.prevToggleSpeed)
        }
        e.preventDefault()
        break
      case 'x': // X键 - 减速
        $gameSpeed.setSpeed($gameSpeed.getSpeed() - speedStep)
        e.preventDefault()
        break
      case 'c': // C键 - 加速
        $gameSpeed.setSpeed($gameSpeed.getSpeed() + speedStep)
        e.preventDefault()
        break
    }
  })
})()
