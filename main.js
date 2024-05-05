// setup canvas and elements
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
// Math.floor is used so that canvas is never greater than body, eliminating possible scrollbars
const bodySize = document.body.getBoundingClientRect();
let width = canvas.width = Math.floor(bodySize.width);
let height = canvas.height = Math.floor(bodySize.height);

const counter = document.getElementById('counter');
counter.innerText = 0;

const incrementByTenBtn = document.getElementById('increment-by-ten');
const incrementByHundredBtn = document.getElementById('increment-by-hundred');
// adding functionality to buttons
const addTenFunc = addAnAmountOfBallsToTheGame.bind(null, 10);
const addHundredFunc = addAnAmountOfBallsToTheGame.bind(null, 100);
incrementByTenBtn.addEventListener('click', addTenFunc);
incrementByTenBtn.addEventListener('mousedown', holdToDoSomeFunction.bind(null, addTenFunc));
incrementByHundredBtn.addEventListener('click', addHundredFunc);
incrementByHundredBtn.addEventListener('mousedown', holdToDoSomeFunction.bind(null, addHundredFunc));

const increaseEvilSizeBtn = document.getElementById('increase-evil-size');
const decreaseEvilSizeBtn = document.getElementById('decrease-evil-size');
// adding functionality to buttons
const multiplyByTwoFunc = multiplyEvilSize.bind(null, 2);
const multiplyByAHalfFunc = multiplyEvilSize.bind(null, 1 / 2);
increaseEvilSizeBtn.addEventListener('click', multiplyByTwoFunc);
increaseEvilSizeBtn.addEventListener('mousedown', holdToDoSomeFunction.bind(null, multiplyByTwoFunc));
decreaseEvilSizeBtn.addEventListener('click', multiplyByAHalfFunc);
decreaseEvilSizeBtn.addEventListener('mousedown', holdToDoSomeFunction.bind(null, multiplyByAHalfFunc));

// event handler for mouse holding events
function holdToDoSomeFunction (someFunction) {
  const intervalID = setInterval(someFunction, 200);
  document.addEventListener('mouseup', clearInterval.bind(null, intervalID), { once: true });
}

const toggleCollisionDetectionBtn = document.getElementById('toggle-collision-detection');
// adding functionality to the button
toggleCollisionDetectionBtn.addEventListener('click', toggleCollisionDetection);
let allowCollisionDetection = true;
function toggleCollisionDetection() {
  allowCollisionDetection = !allowCollisionDetection;
  if (allowCollisionDetection) {
    toggleCollisionDetectionBtn.innerText = "Turn off collision detection"
    return;
  }
  toggleCollisionDetectionBtn.innerText = "Turn on collision detection"
  // reset collision logs
  const ballsLength = balls.length;
  for (let i = 0; i < ballsLength; i++) {
    balls[i].collision = {};
  }
}

const toggleGameStateBtn = document.getElementById('toggle-game-state');
// adding functionality to the button
toggleGameStateBtn.addEventListener('click', toggleGameState);
let gameState = true;
// will be reassigned by requestAnimationFrame method
let animationRequestID;
function toggleGameState() {
  gameState = !gameState;
  if (gameState) {
    toggleGameStateBtn.innerText = "Pause";
    animationRequestID = requestAnimationFrame(blackenThenDrawThenSchedule);
    return;
  }
  toggleGameStateBtn.innerText = "Continue";
  cancelAnimationFrame(animationRequestID);
}

const fpsElement = document.getElementById('fps');
let totalFrame = timeElapsed = 0;

// function to generate random number
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// function to generate random color
function randomRGB() {
  return `rgb(${random(0, 255)} ${random(0, 255)} ${random(0, 255)})`;
}

class Shape {
  constructor(x, y, velX, velY, color, size) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
    this.color = color;
    this.size = size;
  }
}

// if a ball is in the balls array, it's in the game
let balls = [];
// { id1: ball1, id2: ball2 }
const ballsWithID = {};
let idTotal = 0;
class Ball extends Shape {
  constructor(x, y, velX, velY, color, size) {
    super(x, y, velX, velY, color, size);
    this.horizontalDirection = random(0, 1) ? 'right' : 'left';
    this.verticalDirection = random(0, 1) ? 'down' : 'up';
    this.collision = {};
    this.id = idTotal++;
    // the ball is saved on its ID
    ballsWithID[this.id] = this;
    // we first update(), then draw(), which means if you do not draw in the beginning, you will skip 1 frame
    this.draw();
  }
  
  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
  }

  update() {
    // If it is updated, do not update it again
    let xIsUpdated = false;
    let yIsUpdated = false;

    // should not exceed boundaries
    if ((this.horizontalDirection === 'right') && (this.x + this.size + this.velX > width)) {
      // go left
      this.horizontalDirection = 'left';
      this.x = width - this.size;
      xIsUpdated = true;
    } else if ((this.horizontalDirection === 'left') && (this.x - this.size - this.velX < 0)) {
      // go right
      this.horizontalDirection = 'right';
      this.x = this.size;
      xIsUpdated = true;
    }
    
    if ((this.verticalDirection === 'down') && (this.y + this.size + this.velY > height)) {
      // go up
      this.verticalDirection = 'up';
      this.y = height - this.size;
      yIsUpdated = true;
    } else if ((this.verticalDirection === 'up') && (this.y - this.size - this.velY < 0)) {
      // go down
      this.verticalDirection = 'down';
      this.y = this.size;
      yIsUpdated = true;
    }
    
    // 4 different cases: (X && Y), (only X), (only Y), none
    // If it's updated, there is no need to update the coordinate again.
    // If it's not updated, update it according to the velocity.
    if (xIsUpdated) {
      if (yIsUpdated) {
      } else {
        this.updateVertical();
      }
    } else if (yIsUpdated) {
      this.updateHorizontal();
    } else {
      this.updateHorizontal();
      this.updateVertical();
    }
  }

  drawAndUpdate() {
    // order is so, because otherwise some space is seen between two colliding balls
    this.update();
    this.draw();
  }

  updateHorizontal() {
    this.horizontalDirection === 'right'
      ? this.x += this.velX
      : this.x -= this.velX
    ;
  }
  
  updateVertical() {
    this.verticalDirection === 'down'
      ? this.y += this.velY
      : this.y -= this.velY
    ;
  }

  collisionDetect(indexOfThis) {
    const ballsLength = balls.length;
    const idOfThis = this.id;
    // start at the next Index
    for (let i = indexOfThis + 1; i < ballsLength; i++) {
      const ball = balls[i];
      const ballID = ball.id;
      const dx = this.x - ball.x;
      const dy = this.y - ball.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const collisionState = distance <= this.size + ball.size;
      const pastCollisionState = this.collision[ballID];
      
      if (collisionState) {
        // ThisBall (indexOfThis) hit Ball (i). It is noted to disallow multiple color changes for one collision
        if (!pastCollisionState) {
          ball.color = this.color = randomRGB();
          this.collision[ballID] = ball.collision[idOfThis] = true;
        }
      } else if (pastCollisionState) {
        // if statement is used for optimization:
        // Most of the time there is no collision, no collision means pastCollisionState is undefined
        // There is no need to delete something that is already deleted
        delete this.collision[ballID];
        delete ball.collision[idOfThis];
      }
    }
  }  
}

class EvilCircle extends Shape {
  constructor(x, y, velX, velY, color, size) {
    super(x, y, velX, velY, color, size);
    // we first update(), then draw(), which means if you do not draw in the beginning, you will skip 1 frame
    this.directionRight = directionsForEvil.arrowright || directionsForEvil.d;
    this.directionLeft = directionsForEvil.arrowleft || directionsForEvil.a;
    this.directionDown = directionsForEvil.arrowdown || directionsForEvil.s;
    this.directionUp = directionsForEvil.arrowup || directionsForEvil.w;
    this.drawEvil();
  }

  drawEvil() {
    // circle
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
    // outer circle (this distinguishes the evil one)
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.stroke();
  }

  updateEvil() {
    // current directions are saved to the corresponding object properties
    this.directionRight = directionsForEvil.arrowright || directionsForEvil.d;
    this.directionLeft = directionsForEvil.arrowleft || directionsForEvil.a;
    this.directionDown = directionsForEvil.arrowdown || directionsForEvil.s;
    this.directionUp = directionsForEvil.arrowup || directionsForEvil.w;

    // If it is updated, do not update it again
    let xIsUpdated = false;
    let yIsUpdated = false;

    // should not exceed boundaries
    if (this.directionRight && (this.x + this.size + this.velX > width)) {
      this.x = width - this.size;
      xIsUpdated = true;
    } else if (this.directionLeft && (this.x - this.size - this.velX < 0)) {
      this.x = this.size;
      xIsUpdated = true;
    }
  
    if (this.directionDown && (this.y + this.size + this.velY > height)) {
      this.y = height - this.size;
      yIsUpdated = true;
    } else if (this.directionUp && (this.y - this.size - this.velY < 0)) {
      this.y = this.size;
      yIsUpdated = true;
    }
  
    // 4 different cases: (X && Y), (only X), (only Y), none
    // If it's updated, there is no need to update the coordinate again.
    // If it's not updated, update it according to the velocity.
    if (xIsUpdated) {
      if (yIsUpdated) {
      } else {
        this.updateEvilVertical();
      }
    } else if (yIsUpdated) {
      this.updateEvilHorizontal();
    } else {
      this.updateEvilHorizontal();
      this.updateEvilVertical();
    }
    
  }

  updateEvilHorizontal() {
    if (this.directionRight) {
      this.x += this.velX
    } else if (this.directionLeft) {
      this.x -= this.velX
    }
    // if no keys are pressed then do not update it
  }

  updateEvilVertical() {
    if (this.directionDown) {
      this.y += this.velY;
    } else if (this.directionUp) {
      this.y -= this.velY;
    }
    // if no keys are pressed then do not update it
  }

  drawAndUpdateEvil() {
    this.updateEvil();
    this.drawEvil();
  }
}

function detectCollisionWithEvilCircle (eatenBall) {
  const dx = evil.x - eatenBall.x;
  const dy = evil.y - eatenBall.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const collisionState = distance <= evil.size + eatenBall.size;
  if (collisionState) {
    const idOfEatenBall = eatenBall.id;
    // Collisions are saved with ID, if a ball gets deleted this log should be forgotten
    for (const id in eatenBall.collision) {
      // id === the id of the ball that the eatenBall collided with
      // ballsWithID[id] === the ball that the eatenBall collided with
      delete ballsWithID[id].collision[idOfEatenBall];
    }
    // if a ball is eaten, decrement the counter (numeric coercion is implicitly done)
    counter.innerText--;
    // eaten ones are filtered out
    return false;
  }
  return true;
}

function addAnAmountOfBallsToTheGame(amountToAdd) {
  for (let i = 0; i < amountToAdd; i++) {
    balls.push(createARandomBall());
  }
  // increment the counter
  counter.innerText = Number(counter.innerText) + amountToAdd;
}
function createARandomBall() {
  const size = random(10, 40);
  return new Ball(
    // always drawn at least one ball width away from the edge of the canvas, to avoid drawing errors
    random(size, width - size),
    random(size, height - size),
    random(0, 10),
    random(0, 10),
    randomRGB(),
    size
  );
}
function createARandomEvilCircle() {
  const size = random(20, 30);
  return new EvilCircle(
    // always drawn at least one ball width away from the edge of the canvas, to avoid drawing errors
    random(size, width - size),
    random(size, height - size),
    random(7, 14),
    random(7, 14),
    'red',
    size
  );
}

function multiplyEvilSize(num) {
  // if it's ever zero, make it 1
  evil.size = (evil.size * num) || 1;
}

let directionsForEvil = {
  arrowleft: false,
  a: false,
  arrowup: false, 
  w: false, 
  arrowright: false, 
  d: false, 
  arrowdown: false,
  s: false,
};
function directionsToGoForEvil (e) {
  // if undefined, it is not a possible key
  // if true, changing true to true serves no purpose
  const keyTriggered = e.key.toLowerCase();
  if (directionsForEvil[keyTriggered] === false) {
    directionsForEvil[keyTriggered] = true;
  }
}
function directionsToAbandonForEvil (e) {
  // if undefined, it is not a possible key
  // if false, changing false to false serves no purpose
  const keyTriggered = e.key.toLowerCase();
  if (directionsForEvil[keyTriggered] === true) {
    directionsForEvil[keyTriggered] = false;
  }
}
document.addEventListener('keydown', directionsToGoForEvil);
document.addEventListener('keyup', directionsToAbandonForEvil);
window.addEventListener('blur', () => {
  // reset the directions if focus is lost (in which case keyUp might not be triggered)
  directionsForEvil = {
    arrowleft: false,
    a: false,
    arrowup: false, 
    w: false, 
    arrowright: false, 
    d: false, 
    arrowdown: false,
    s: false,
  };
});

let totalOverlays = 0;
function blackenThenDrawThenSchedule() {
  const start = performance.now();
  // partially remove the trail
  ctx.fillStyle = "rgb(0 0 0 / 33%)";
  if (++totalOverlays === 40) {
    ctx.fillStyle = "rgb(0 0 0 / 50%)";
    totalOverlays = 0;
  }
  ctx.fillRect(0, 0, width, height);
  
  evil.drawAndUpdateEvil();

  const ballsLength = balls.length;
  for (let i = 0; i < ballsLength; i++) {
    const ball = balls[i];
    ball.drawAndUpdate();
    // index is saved for optimization
    if (allowCollisionDetection) {
      ball.collisionDetect(i);
    };
  }

  balls = balls.filter(detectCollisionWithEvilCircle);

  const end = performance.now();
  timeElapsed+= (end - start) || 1;
  if (++totalFrame === 20) {
    // time elapsed is in ms, converted to seconds
    fpsElement.innerText = parseInt(totalFrame / timeElapsed * 1000);
    totalFrame = timeElapsed = 0;
  }

  if (++totalIterations === 50) {
    addAnAmountOfBallsToTheGame(1);
    totalIterations = 0;
  }

  animationRequestID = requestAnimationFrame(blackenThenDrawThenSchedule);
  // setTimeout(blackenThenDrawThenSchedule, 300);
}

// creating balls
const ballAmount = parseInt((canvas.width > canvas.height ? canvas.height : canvas.width) / 15);
addAnAmountOfBallsToTheGame(ballAmount);
const evil = createARandomEvilCircle();

// every nth iteration a ball will be added
// this is used instead of setInterval, because setInterval never stops, even when the page doesn't have the focus
let totalIterations = 0;

animationRequestID = requestAnimationFrame(blackenThenDrawThenSchedule);