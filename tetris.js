const COLS = 10
const ROWS = 20
const BLOCK_SIZE = 30
const COLORS = ['cyan', 'blue', 'orange', 'yellow', 'green', 'purple', 'red']
//形状定义
const SHAPES = [
  [[1, 1, 1, 1]],
  [[1, 1, 1], [1]],
  [[1, 1, 1], [0, 0, 1]],
  [[1, 1], [1, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1]]
]

class Piece {
  constructor(x, y, color, shape) {
    this.x = x
    this.y = y
    this.color = color
    this.shape = shape
  }
  
  rotate() {
    const m = this.shape.length     //rows  
    const n = this.shape[0].length  //cols
    let matrix = Array.from({ length: n }, () => Array(m).fill(0))
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        matrix[j][m - 1 - i] = this.shape[i][j]
      }
    }
    this.shape = matrix
  }

  move(dx, dy) {
    this.x += dx
    this.y += dy
  }

  static getRandomPiece() {
    //获取随机方块
    const shapeIndex = Math.floor(Math.random() * SHAPES.length)
    const colorIndex = Math.floor(Math.random() * COLORS.length)
    return new Piece(
      Math.floor(COLS / 2) - Math.floor(SHAPES[shapeIndex][0].length / 2),
      0,
      colorIndex,
      SHAPES[shapeIndex]
    )
  }
}

class Board {
  constructor(ctx, nextPieceCtx) {
    this.ctx = ctx
    this.nextPieceCtx = nextPieceCtx
    this.gameBoard = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  }

  draw() {
    //绘制游戏
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    this.drawBoard()
  }

  drawBoard() {
    //绘制整个游戏板
    this.gameBoard.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.ctx.fillStyle = COLORS[value - 1]
          this.ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
          this.ctx.strokeStyle = 'black';
          this.ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
        }
      })
    })
  }

  drawPiece(piece) {
    //绘制方块
    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.ctx.fillStyle = COLORS[piece.color]
          this.ctx.fillRect((piece.x + x) * BLOCK_SIZE, (piece.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
          this.ctx.strokeStyle = 'black'
          this.ctx.strokeRect((piece.x + x) * BLOCK_SIZE, (piece.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
        }
      })
    })
  }

  drawNextPiece(piece) {
    //绘制下一个方块
    this.nextPieceCtx.clearRect(0, 0, this.nextPieceCtx.canvas.width, this.nextPieceCtx.canvas.height)
    const scale = 0.8
    const blockSize = BLOCK_SIZE * scale
    const offsetX = (this.nextPieceCtx.canvas.width - piece.shape[0].length * blockSize) / 2
    const offsetY = (this.nextPieceCtx.canvas.height - piece.shape.length * blockSize) / 2

    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.nextPieceCtx.fillStyle = COLORS[piece.color];
          this.nextPieceCtx.fillRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize, blockSize)
          this.nextPieceCtx.strokeStyle = 'black';
          this.nextPieceCtx.strokeRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize, blockSize)
        }
      })
    })
  }
}

class Game {

  constructor() {
    //获取dom
    this.startBtn = document.getElementById('start-btn')
    this.pauseBtn = document.getElementById('pause-btn')
    this.restartBtn = document.getElementById('restart-btn')
    this.scoreElement = document.getElementById('score')
    this.levelElement = document.getElementById('level')
    this.canvas = document.getElementById('game-board')
    this.ctx = this.canvas.getContext('2d')
    this.nextPieceCanvas = document.getElementById('next-piece')
    if (!this.nextPieceCanvas) {
      console.error("Can't find 'next-piece' canvas element")
    }
    this.nextPieceCtx = this.nextPieceCanvas.getContext('2d')
    this.board = null
    this.score = 0
    this.level = 1
    this.gameLoop = null
    this.gameState = "stopped"
    this.currentPiece = null
    this.nextPiece = null
    
    this.init()
  }

  init() {
    this.board = new Board(this.ctx, this.nextPieceCtx)
    this.currentPiece = Piece.getRandomPiece()
    this.nextPiece = Piece.getRandomPiece()
    document.addEventListener('keydown', this.handleKeyPress.bind(this))
    this.startBtn.addEventListener('click', this.startGame.bind(this))
    this.pauseBtn.addEventListener('click', this.togglePause.bind(this))
    this.restartBtn.addEventListener('click', this.restartGame.bind(this))
    this.draw()
  }

  startGame() {
    if (this.gameState === 'stopped') {
      this.gameState = 'playing'
      this.gameLoop = setInterval(() => this.update(), 1000 / this.level)
      this.startBtn.textContent = '继续'
    } else if (this.gameState === 'paused') {
      this.gameState = 'playing'
      this.gameLoop = setInterval(() => this.update(), 1000 / this.level)
    }
  }

  togglePause() {
    if (this.gameState === 'playing') {
      this.gameState = 'paused'
      clearInterval(this.gameLoop);
      this.pauseBtn.textContent = '继续'
    } else if (this.gameState === 'paused') {
      this.gameState = 'playing'
      this.gameLoop = setInterval(() => this.update(), 1000 / this.level)
      this.pauseBtn.textContent = '暂停'
    }
  }

  restartGame() {
    clearInterval(this.gameLoop)
    this.board = new Board(this.ctx, this.nextPieceCtx)
    this.score = 0
    this.level = 1
    this.updateScore()
    this.updateLevel()
    this.currentPiece = Piece.getRandomPiece()
    this.nextPiece = Piece.getRandomPiece()
    this.gameState = 'stopped'
    this.startBtn.textContent = '开始'
    this.pauseBtn.textContent = '暂停'
    this.draw()
  }

  update() {
    if (!this.moveDown()) {
      this.placePiece()
      this.clearLines()
      if (this.checkGameOver()) {
        this.gameState = 'gameover'
        clearInterval(this.gameLoop)
        alert('Game Over！')
        return
      }
      this.currentPiece = this.nextPiece
      this.nextPiece = Piece.getRandomPiece()
    }
    this.draw()
  }

  draw() {
    this.board.draw()
    this.board.drawPiece(this.currentPiece)
    this.board.drawNextPiece(this.nextPiece)
  }

  moveLeft() {
    this.currentPiece.move(-1, 0)
    if (this.hasCollision()) {
      this.currentPiece.move(1, 0)
      return false
    }
    return true
  }

  moveRight() {
    this.currentPiece.move(1, 0)
    if (this.hasCollision()) {
      this.currentPiece.move(-1, 0)
      return false
    }
    return true
  }

  moveDown() {
    this.currentPiece.move(0, 1)
    if (this.hasCollision()) {
      this.currentPiece.move(0, -1)
      return false
    }
    return true
  }

  rotatePiece() {
    const originalShape = this.currentPiece.shape 
    this.currentPiece.rotate()
    if (this.hasCollision()) {
      this.currentPiece.shape = originalShape
      return false
    }
    return true
  }

  hasCollision() {
    return this.currentPiece.shape.some((row, dy) =>
      row.some((value, dx) =>
        value > 0 &&
        (this.currentPiece.y + dy >= ROWS  ||
          this.currentPiece.x + dx < 0     ||
          this.currentPiece.x + dx >= COLS ||
          (this.currentPiece.y + dy >= 0 && this.board.gameBoard[this.currentPiece.y + dy][this.currentPiece.x + dx] > 0))
      )
    )
  }

  placePiece() {
    this.currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.board.gameBoard[this.currentPiece.y + y][this.currentPiece.x + x] = this.currentPiece.color + 1
        }
      })
    })
  }

  clearLines() {
    // let linesCleared = 0
    // for (let y = ROWS - 1; y >= 0; y--) {
    //   if (this.board.gameBoard[y].every(cell => cell > 0)) {
    //     this.board.gameBoard.splice(y, 1)
    //     this.board.gameBoard.unshift(Array(COLS).fill(0))
    //     linesCleared++;
    //     y++ // 检查同一行（现在是新行）
    //   }
    // }
    let linesCleared = 0
    this.board.gameBoard.forEach((row, y) => {
      if (row.every((cell) => cell > 0)) {
        this.board.gameBoard.splice(y, 1)
        this.board.gameBoard.unshift(Array(COLS).fill(0))
        linesCleared++
      }
    })
    if (linesCleared > 0) {
      this.updateScore(linesCleared)
      this.updateLevel()
    }
  }

  updateScore(linesCleared) {
    const basePoints = [0, 40, 100, 300, 1200]
    const comboMultiplier = Math.min(linesCleared, 4)
    this.score += basePoints[comboMultiplier] * this.level
    this.scoreElement.textContent = `分数: ${this.score}`
  }

  updateLevel() {
    this.level = Math.floor(this.score / 1000) + 1
    this.levelElement.textContent = `等级: ${this.level}`
    clearInterval(this.gameLoop)
    if (this.gameState === 'playing') {
      this.gameLoop = setInterval(() => this.update(), 1000 / this.level)
    }
  }

  checkGameOver() {
    return this.board.gameBoard[0].some(cell => cell > 0)
  }

  handleKeyPress(event) {
    if (this.gameState !== 'playing') return

    switch (event.keyCode) {
      case 37: // Left
        this.moveLeft()
        break
      case 39: // Right
        this.moveRight()
        break
      case 40: // Down
        this.moveDown()
        break
      case 38: // Up
        this.rotatePiece()
        break
      case 32: // Space
        let n =true
        while (n) n = this.moveDown()
        break
    }
    this.draw()
  }
}

const game = new Game()
