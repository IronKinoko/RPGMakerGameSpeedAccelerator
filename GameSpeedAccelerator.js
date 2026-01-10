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

  if (SceneManager.determineRepeatNumber) {
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
      'this._accumulator += fTime * $gameSpeed.getSpeed()'
    )
    eval('SceneManager.updateMain = ' + fnCode)
  }

  // 注册快捷键到 Input.keyMapper
  Input.keyMapper[90] = 'z' // Z键 - 正常速度
  Input.keyMapper[88] = 'x' // X键 - 减速
  Input.keyMapper[67] = 'c' // C键 - 加速

  // 处理速度快捷键
  var _SceneManager_updateInputData = SceneManager.updateInputData
  SceneManager.updateInputData = function () {
    _SceneManager_updateInputData.call(this)

    try {
      if (Input.isPressed('shift')) {
        if (Input.isTriggered('z')) {
          var currentSpeed = $gameSpeed.getSpeed()

          if (currentSpeed !== 1) {
            $gameSpeed.setSpeed(1.0)
            $gameSpeed.prevToggleSpeed = currentSpeed
          } else {
            $gameSpeed.setSpeed($gameSpeed.prevToggleSpeed)
          }
        } else if (Input.isTriggered('x')) {
          $gameSpeed.setSpeed($gameSpeed.getSpeed() - speedStep)
        } else if (Input.isTriggered('c')) {
          $gameSpeed.setSpeed($gameSpeed.getSpeed() + speedStep)
        }
      }
    } catch (error) {}
  }
})()
