/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

// This function runs when the Game Screen is ON
function gamePlay() {
  // Floating Text effects
  for (let i = 0; i < floatingTexts.length; i += 1) {
    floatingTexts[i].update()
    floatingTexts[i].render()
  }

  // Particle effects
  for (let i = 0; i < particles.length; i += 1) {
    if (particles[i]) {
      particles[i].render()
      particles[i].update()
    }
  }

  // Draw Timer! (Comment this blob of code if you don't want timer)
  if (Koji.config.strings.enableTimer && gameTimerEnabled) {
    gameTimer -= 1 / frameRate()
    drawTimer()
  }

  // Spawn a ball every second
  ;(() => {
    ballTimer += 1 / frameRate()
    if (ballTimer >= 1.5) {
      balls.push(
        new Ball(
          {
            x: width / 2,
            y: 0 - objSize * 2,
          },
          { radius: objSize * ballSize },
          { shape: 'circle', image: random(ballTypes).image, rotate: true }
        )
      )

      ballTimer = 0
    }
  })()

  // InGame UI
  wheels.forEach(wheel => {
    wheel.show()
    wheel.rotate()
  })

  balls.forEach(ball => {
    ball.show()
    ball.update()
  })

  // Score draw
  const scoreX = width - objSize / 2
  const scoreY = objSize / 3
  textSize(objSize * 2)
  fill(Koji.config.colors.scoreColor)
  textAlign(RIGHT, TOP)
  text(score, scoreX, scoreY)

  // Lives draw
  const lifeSize = objSize
  for (let i = 0; i < lives; i += 1) {
    image(
      imgLife,
      lifeSize / 2 + lifeSize * i,
      lifeSize / 2,
      lifeSize,
      lifeSize
    )
  }

  cleanup()
}
