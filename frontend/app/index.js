/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable prefer-const */

// Strict Stuffs (EDITING THESE WILL MAKE GAME CRASH)
let myFont // The font we'll use throughout the app

let gameOver = false // If it's true the game will render the main menu
let gameBeginning = true // Should be true only before the user starts the game for the first time

let gameStart = false // Becomes true after a moment when game initializes

let canEnd = false

// Effects
let floatingTexts = []
let particles = []

// Game Objects (READ-ONLY)
let wheels = []
let balls = []

// Game Stuffs (READ-N-WRITE)
let ballTypes = []
let firedBalls = []
let particledBalls = []
let wheelSize
let ballSize
let swipe = null

// Buttons
let playButton
let soundButton
let leaderboardButton
let endButton

// Score data
let startingLives
let scoreGain
let highscoreGained
let highScore
let score = 0

// Data taken from Game Settings
let comboTexts = []

// Images
let imgWheels = []
let imgBalls = []
let imgLife
let imgBackground

// Audio
let sndMusic
let sndTap
let sndMatch
let sndEnd
let sndEnemyHit
let sndExplosion
let sndLostLife

let soundEnabled = true
let canMute = true

let soundImage
let muteImage

// Timers
let startingGameTimer
let gameTimer
let gameTimerEnabled = false

let ballTimer = 0

let gameOverRectangleHeight = 0 // for game over animation
let canScore = false

// Size stuff
let objSize // Base size modifier of all objects, calculated based on screen size

/**
 * @description Game size in tiles
 * using bigger numbers will decrease individual object sizes but allow more objects to fit the screen
 * Keep in mind that if you change this, you might need to change text sizes as well
 */
const gameSize = 18

// Mobile
let isMobile = false // check if it really is mobile
let isMobileSize = false // check if the browser is mobile size
let touching = false // Whether the user is currently touching/clicking
let isTouchEnded = false
let isiOS = false

let hammer // hammer.js

// Load assets
function preload() {
  // Load font from google fonts link provided in game settings
  const link = document.createElement('link')
  link.href = Koji.config.strings.fontFamily
  link.rel = 'stylesheet'
  document.head.appendChild(link)
  myFont = getFontFamily(Koji.config.strings.fontFamily)
  const newStr = myFont.replace('+', ' ')
  myFont = newStr

  // Load background if there's any
  if (Koji.config.images.background !== '') {
    imgBackground = loadImage(Koji.config.images.background)
  }

  // Load images
  imgWheels[0] = loadImage(Koji.config.images.wheelImage1)
  imgBalls[0] = loadImage(Koji.config.images.ballImage1)

  imgWheels[1] = loadImage(Koji.config.images.wheelImage2)
  imgBalls[1] = loadImage(Koji.config.images.ballImage2)

  imgBalls[2] = loadImage(Koji.config.images.ballImage3)

  imgLife = loadImage(Koji.config.images.lifeIcon)
  soundImage = loadImage(Koji.config.images.soundImage)
  muteImage = loadImage(Koji.config.images.muteImage)

  /**
   * Load Sounds here
   * Include a simple IF check to make sure there is a sound in config, also include a check when you try to play the sound, so in case there isn't one, it will just be ignored instead of crashing the game
   * Music is loaded in setup(), to make it asynchronous
   */
  if (Koji.config.sounds.tap) sndTap = loadSound(Koji.config.sounds.tap)
  if (Koji.config.sounds.match) sndMatch = loadSound(Koji.config.sounds.match)
  if (Koji.config.sounds.end) sndEnd = loadSound(Koji.config.sounds.end)
  if (Koji.config.sounds.enemyHit)
    sndEnemyHit = loadSound(Koji.config.sounds.enemyHit)
  if (Koji.config.sounds.explosion)
    sndExplosion = loadSound(Koji.config.sounds.explosion)
  if (Koji.config.sounds.life) sndLostLife = loadSound(Koji.config.sounds.life)

  // Load settings from Game Settings
  scoreGain = parseInt(Koji.config.strings.scoreGain)
  startingLives = parseInt(Koji.config.strings.lives)
  comboTexts = Koji.config.strings.comboText.split(',')
  startingGameTimer = parseInt(Koji.config.strings.gameTimer)
  lives = startingLives

  // Timer stuff
  if (startingGameTimer <= 0) {
    gameTimer = 99999
    gameTimerEnabled = false
  } else {
    gameTimer = startingGameTimer
    gameTimerEnabled = true
  }
}

// Instantiate objects here
function instantiate() {
  wheelSize = isMobileSize ? 4 : 7
  wheels[0] = new GameObject(
    {
      x: 0,
      y: height / 2 + height * 0.07,
    },
    { radius: objSize * wheelSize },
    { shape: 'circle', image: imgWheels[0], rotate: true, type: 0 }
  )
  wheels[1] = new GameObject(
    {
      x: width,
      y: height / 2 + height * 0.07,
    },
    { radius: objSize * wheelSize },
    { shape: 'circle', image: imgWheels[1], rotate: true, type: 1 }
  )

  ballTypes = [
    {
      type: 0,
      image: imgBalls[0],
    },
    {
      type: 1,
      image: imgBalls[1],
    },
    {
      type: 2,
      image: imgBalls[2],
    },
  ]

  // Set ball size
  ballSize = isMobileSize ? 1 : 1.5
}

// Setup your props
function setup() {
  width = window.innerWidth
  height = window.innerHeight

  // How much of the screen should the game take, this should usually be left as it is
  let sizeModifier = 0.75
  if (height > width) {
    sizeModifier = 1
  }

  createCanvas(width, height)

  // Magically determine basic object size depending on size of the screen
  objSize = floor(
    min(floor(width / gameSize), floor(height / gameSize)) * sizeModifier
  )

  isMobile = detectMobile()
  isMobileSize = detectMobileSize()
  isiOS = detectiOS()

  textFont(myFont) // set our font
  document.body.style.fontFamily = myFont

  playButton = new PlayButton()
  soundButton = new SoundButton()
  leaderboardButton = new LeaderboardButton()
  endButton = new EndButton()

  hammer = new Hammer(document.body, { preventDefault: false })
  hammer.get('swipe').set({
    direction: Hammer.DIRECTION_HORIZONTAL,
  })

  instantiate()

  gameBeginning = true

  /**
   * Load music asynchronously and play once it's loaded
   * This way the game will load faster
   */
  if (Koji.config.sounds.backgroundMusic)
    sndMusic = loadSound(Koji.config.sounds.backgroundMusic, () =>
      playMusic(sndMusic, 0.4, false)
    )
}

// An infinite loop that never ends in p5
function draw() {
  // Manage cursor - show it on main menu, and hide during game, depending on game settings
  if (!gameOver && !gameBeginning) {
    if (!Koji.config.strings.enableCursor) {
      noCursor()
    }
  } else {
    cursor(ARROW)
  }

  // Draw background or a solid color
  if (imgBackground) {
    background(imgBackground)
  } else {
    background(Koji.config.colors.backgroundColor)
  }

  // Draw UI
  if (gameOver || gameBeginning) {
    gameBeginningOver()
  } else {
    gamePlay()
  }

  soundButton.render()
}

// Handle Canvas Resize
if (!isiOS) {
    function windowResized() {
        resizeCanvas(windowWidth, windowHeight)

        width = window.innerWidth
        height = window.innerHeight

        // How much of the screen should the game take, this should usually be left as it is
        let sizeModifier = 0.75
        if (height > width) {
            sizeModifier = 1
        }

        // Magically determine basic object size depending on size of the screen
        objSize = floor(
            min(floor(width / gameSize), floor(height / gameSize)) * sizeModifier
        )

        soundButton.size = createVector(objSize, objSize)

        isMobileSize = detectMobileSize()

        // Size and Position settings
        wheelSize = isMobileSize ? 4 : 7
        ballSize = isMobileSize ? 1 : 1.5

        wheels[0].body.position.x = 0
        wheels[0].sizing.radius = objSize * wheelSize
        wheels[1].body.position.x = width
        wheels[1].sizing.radius = objSize * wheelSize

        balls.forEach(ball => {
            ball.sizing.radius = objSize * ballSize
            ball.body.position.x = width / 2
        })

        // handleResize() // 👈 create this function for advanced resize handling
    }
}

/**
 * Go through objects and see which ones need to be removed
 * A good practive would be for objects to have a boolean like removable, and here you would go through all objects and remove them if they have removable = true;
 */
function cleanup() {
  for (let i = 0; i < floatingTexts.length; i += 1) {
    if (floatingTexts[i].timer <= 0) {
      floatingTexts.splice(i, 1)
    }
  }

  for (let i = 0; i < balls.length; i += 1) {
    if (balls[i].removable) {
      balls.splice(i, 1)
    }
  }

  for (let i = 0; i < firedBalls.length; i += 1) {
    if (firedBalls[i].removable) {
      firedBalls.splice(i, 1)
    }
  }
}

// Call this when a lose life event should trigger
function loseLife() {
  // eslint-disable-next-line no-plusplus
  lives--

  if (lives <= 0) {
    gameOver = true
    checkHighscore()

    if (score > parseInt(Koji.config.strings.minimumScoreToSave)) {
      submitScore(score)
    }
  }
}

// Handle input
function touchStarted() {
  if (gameOver || gameBeginning) {
  }

  if (soundButton.checkClick()) {
    toggleSound()
    return
  }

  if (!gameOver && !gameBeginning) {
    // InGame
    touching = true

    if (canEnd) {
      gameOver = true

      if (score > parseInt(Koji.config.strings.minimumScoreToSave)) {
        submitScore(score)
      }
    }
  }
}

function touchEnded() {
  // This is required to fix a problem where the music sometimes doesn't start on mobile
  if (soundEnabled) {
    if (getAudioContext().state !== 'running') {
      getAudioContext().resume()
    }
  }

  touching = false
  isTouchEnded = true
}

// Key pressed and released
function keyPressed() {
  if (!gameOver && !gameBeginning) {
    // Ignore this complete if statement. It is just for testing purposes. You don't even need to remove this code anyway.
    if (Koji.config.strings.trialTesting) {
      if (key === '-') {
        loseLife()
      }

      if (keyCode === ENTER) {
        addScore(
          1,
          imgLife,
          {
            x: random(0, width),
            y: random(0, height),
          },
          10,
          { floatingText: true }
        )
      }

      if (key === ' ') {
        particlesEffect(
          imgLife,
          {
            x: width / 2,
            y: height / 2,
          },
          10
        )
      }
    }
  }
}

function keyReleased() {
  if (!gameOver && !gameBeginning) {
    if (
      !canEnd &&
      balls.length > 0 &&
      (keyCode === LEFT_ARROW || key === 'a')
    ) {
      balls[0].fire('left')
    }

    if (
      !canEnd &&
      balls.length > 0 &&
      (keyCode === RIGHT_ARROW || key === 'd')
    ) {
      balls[0].fire('right')
    }
  }
}

/**
 * Call this every time you want to start or reset the game
 * This is a good place to clear all arrays like enemies, bullets etc before starting a new game
 */
function init() {
  gameOver = false

  lives = startingLives
  highscoreGained = false
  score = 0

  gameTimer = startingGameTimer
  gameOverRectangleHeight = 0

  floatingTexts = []
  particles = []
  balls = []
  firedBalls = []
  wheels = []

  // Keep everyone at their original place
  instantiate()

  floatingTexts.push(
    new OldFloatingText(
      width / 2,
      height / 2 - height * 0.01,
      Koji.config.strings.gameStartedFloatingText,
      Koji.config.colors.floatingTextColor,
      objSize * 1.2,
      2
    )
  )

  canScore = false
  canEnd = false

  // set score to zero if score increases mistakenly
  setTimeout(() => {
    score = 0
    gameStart = true
  }, 1000)
}
