/* eslint-disable no-global-assign */
/* eslint-disable no-unused-vars */

/* 
  global
  floor
  gameTimer
  textAlign
  Koji
  text
  textSize
  CENTER
  rect
  gameOverRectangleHeight
  fill
  sndEnd
  canEnd
  TOP
  objSize
  width
  height
  Smooth
*/

// To draw the timer in the right place
function drawTimer() {
  let timerMinutes = Math.floor(gameTimer / 60)
  let timerSeconds = Math.floor(gameTimer - timerMinutes * 60)

  if (timerMinutes < 10) {
    timerMinutes = `0${timerMinutes}`
  }
  if (timerSeconds < 10) {
    timerSeconds = `0${timerSeconds}`
  }

  let timerText = `${timerMinutes}:${timerSeconds}`
  const timerSize = objSize * 1.2
  let x = timerSize * 1.6
  let y = height - timerSize * 1.2

  textAlign(CENTER, TOP)

  if (gameTimer <= 0) {
    timerText = Koji.config.strings.gameOverText

    if (!canEnd) {
      canEnd = true
      if (sndEnd) sndEnd.play()
    }

    x = width / 2
    y = height / 2

    fill(Koji.config.colors.gameOverRectangleColor)

    gameOverRectangleHeight = Smooth(gameOverRectangleHeight, objSize * 6, 4)

    rect(
      0,
      height / 2 - gameOverRectangleHeight * 0.5,
      width,
      gameOverRectangleHeight
    )
    textAlign(CENTER, CENTER)
  }

  textSize(timerSize)
  fill(Koji.config.colors.timerText)
  text(timerText, x, y)
}
