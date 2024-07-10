'use strict';

// setup canvas and elements
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext("2d", { willReadFrequently: true });

// The size of body is preferred over that of window because it does not round the size
// Rounding the size up, and giving this size to the canvas will result in scrollbars
// Math.floor is used so that canvas is never greater than body, eliminating possible scrollbars
const bodySize = document.body.getBoundingClientRect();
let width = canvas.width = Math.floor(bodySize.width);
let height = canvas.height = Math.floor(bodySize.height);

// rotating the canvas when orientation changes
screen.orientation.addEventListener('change', () => {
  // canvas is saved and applied since changing the width and height of the canvas resets the canvas
  const canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // 'resize' event is listened to because:
  // When you rotate your device, body adapts to the change thanks to CSS, but canvas does not.
  // This results in an overflowing wide canvas, and the window tries to contain it, thus a bigger window.
  // So, by equalizing canvas size with body size, we're eliminating a wide canvas, thus an over-sized window.

  // After the change event occurs, resize event occurs once or twice
  // If it occurs once: Window just normally rotates
  // If it occurs twice: One occasion in which window contains the wide canvas, and then another occasion in which canvas is ignored
  // In either case, overflowing canvas is ignored
  window.addEventListener('resize', () => {
    rotateTheCanvas(canvasData);
    window.addEventListener('resize', () => {
      rotateTheCanvas(canvasData);
    }, { once: true });
  }, { once: true });
});
function rotateTheCanvas(canvasData) {
  const bodySize = document.body.getBoundingClientRect();
  width = canvas.width = Math.floor(bodySize.width);
  height = canvas.height = Math.floor(bodySize.height);
  ctx.putImageData(canvasData, 0, 0);
}

const counter = document.getElementById('counter');
counter.innerText = 0;

const instrumentsWrapper = document.getElementById('instruments');

const incrementByTenBtn = document.getElementById('increment-by-ten');
const incrementByHundredBtn = document.getElementById('increment-by-hundred');
// adding functionality to buttons
const addTenFunc = addAnAmountOfBallsToTheGame.bind(globalThis, 10);
const addHundredFunc = addAnAmountOfBallsToTheGame.bind(globalThis, 100);
incrementByTenBtn.addEventListener('click', addTenFunc);
incrementByTenBtn.addEventListener('mousedown', holdToDoSomeFunction.bind(globalThis, addTenFunc, 'mouseup'));
// { passive: true} option is added to 'touchstart' event listeners to allow the browser to optimize scrolling
incrementByTenBtn.addEventListener('touchstart', holdToDoSomeFunction.bind(globalThis, addTenFunc, 'touchend'), { passive: true});
incrementByHundredBtn.addEventListener('click', addHundredFunc);
incrementByHundredBtn.addEventListener('mousedown', holdToDoSomeFunction.bind(globalThis, addHundredFunc, 'mouseup'));
incrementByHundredBtn.addEventListener('touchstart', holdToDoSomeFunction.bind(globalThis, addHundredFunc, 'touchend'), { passive: true});

const increaseEvilSizeBtn = document.getElementById('increase-evil-size');
const decreaseEvilSizeBtn = document.getElementById('decrease-evil-size');
// adding functionality to buttons
const multiplyByTwoFunc = multiplyEvilSize.bind(globalThis, 2);
const multiplyByAHalfFunc = multiplyEvilSize.bind(globalThis, 1 / 2);
increaseEvilSizeBtn.addEventListener('click', multiplyByTwoFunc);
increaseEvilSizeBtn.addEventListener('mousedown', holdToDoSomeFunction.bind(globalThis, multiplyByTwoFunc, 'mouseup'));
increaseEvilSizeBtn.addEventListener('touchstart', holdToDoSomeFunction.bind(globalThis, multiplyByTwoFunc, 'touchend'), { passive: true});
decreaseEvilSizeBtn.addEventListener('click', multiplyByAHalfFunc);
decreaseEvilSizeBtn.addEventListener('mousedown', holdToDoSomeFunction.bind(globalThis, multiplyByAHalfFunc, 'mouseup'));
decreaseEvilSizeBtn.addEventListener('touchstart', holdToDoSomeFunction.bind(globalThis, multiplyByAHalfFunc, 'touchend'), { passive: true});

// event handler for mouse holding events
function holdToDoSomeFunction (someFunction, timeToStop) {
  const intervalID = setInterval(someFunction, 200);
  // timeToStop is an event name like 'mouseup' and 'touchend'
  document.addEventListener(timeToStop, clearInterval.bind(globalThis, intervalID), { once: true });
}

const toggleCollisionDetectionBtn = document.getElementById('toggle-collision-detection');
// adding functionality to the button
toggleCollisionDetectionBtn.addEventListener('click', toggleCollisionDetection);
let allowCollisionDetection = true;
function toggleCollisionDetection() {
  allowCollisionDetection = !allowCollisionDetection;
  if (allowCollisionDetection) {
    toggleCollisionDetectionBtn.innerText = 'Turn off collision detection';
    return;
  }
  toggleCollisionDetectionBtn.innerText = 'Turn on collision detection';
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
    toggleGameStateBtn.innerText = 'Pause';
    animationRequestID = requestAnimationFrame(blackenThenDrawThenSchedule);
    return;
  }
  toggleGameStateBtn.innerText = 'Continue';
  cancelAnimationFrame(animationRequestID);
}

const toggleInstrumentsBtn = document.getElementById('toggle-instruments');
// elements that will be hidden eventually
const doNotHideList = document.querySelectorAll('.do-not-hide');
// adding functionality to the button
toggleInstrumentsBtn.addEventListener('click', toggleInstruments);
let instrumentsState = 1;
function toggleInstruments() {
  switch (++instrumentsState) {
    case 1: // Show partially
      toggleInstrumentsBtn.innerText = 'More';
      for (const element of doNotHideList) {
        element.classList.add('do-not-hide');
      }
      break;
    case 2: // Show All
      toggleInstrumentsBtn.innerText = 'Hide';
      instrumentsWrapper.classList.remove('displayNoneChildren');
      break;
    case 3: // Hide All
      toggleInstrumentsBtn.innerText = 'Show';
      instrumentsWrapper.classList.add('displayNoneChildren');
      for (const element of doNotHideList) {
        element.classList.remove('do-not-hide');
      }
      // break is not used so that default is executed
    default: instrumentsState = 0;
  }
}

const fpsElement = document.getElementById('fps');
let totalFrame = 0, timeElapsed = 0;

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
    // steps needed to crash into the boundaries
    this.stepsUntilCollisionX = this.horizontalDirection === 'right' ? this.calculateStepsUntilCollisionRight() : this.calculateStepsUntilCollisionLeft();
    this.stepsUntilCollisionY = this.verticalDirection === 'down' ? this.calculateStepsUntilCollisionDown() : this.calculateStepsUntilCollisionUp(); 
    this.velXWithVector = this.horizontalDirection === 'right' ? velX : -velX;
    this.velYWithVector = this.verticalDirection === 'down' ? velY : -velY; 
    this.id = idTotal++;
    // the ball is saved on its ID
    ballsWithID[this.id] = this;
    // we first update(), then draw(), which means if you do not draw in the beginning, you will skip 1 frame
    this.draw();
  }

  // calculateStepsUntilCollisionHorizontal
  calculateStepsUntilCollisionLeft () {
    return Math.ceil((this.x - this.size) / this.velX);
  }
  calculateStepsUntilCollisionRight () {
    return Math.ceil((width - (this.x + this.size)) / this.velX);
  }
  // calculateStepsUntilCollisionVertical
  calculateStepsUntilCollisionUp () {
    return Math.ceil((this.y - this.size) / this.velY);
  }
  calculateStepsUntilCollisionDown () {
    return Math.ceil((height - (this.y + this.size)) / this.velY);
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
  }

  drawAndUpdate() {
    // order is so, because otherwise some space is seen between two colliding balls
    this.update();
    this.draw();
  }

  update() {
    if (this.stepsUntilCollisionX > 1) {
      this.x += this.velXWithVector;
      this.stepsUntilCollisionX--;
    } else if (this.stepsUntilCollisionX === 1) {
      this.collideWithXBoundaries();
      this.stepsUntilCollisionX--;
    } else {
      // equal to 0, or the unlikely case: less than 0 (for example: if the radius is greater than window width)
      if (this.horizontalDirection === 'right') {
        // change direction
        this.horizontalDirection = 'left';
        this.velXWithVector *= -1;
        this.x += this.velXWithVector;
        this.stepsUntilCollisionX = this.calculateStepsUntilCollisionLeft();
      } else {
        // change direction
        this.horizontalDirection = 'right';
        this.velXWithVector *= -1;
        this.x += this.velXWithVector;
        this.stepsUntilCollisionX = this.calculateStepsUntilCollisionRight();
      }
    }

    if (this.stepsUntilCollisionY > 1) {
      this.y += this.velYWithVector;
      this.stepsUntilCollisionY--;
    } else if (this.stepsUntilCollisionY === 1) {
      this.collideWithYBoundaries();
      this.stepsUntilCollisionY--;
    } else {
      // equal to 0
      if (this.verticalDirection === 'down') {
        // change direction
        this.verticalDirection = 'up';
        this.velYWithVector *= -1;
        this.y += this.velYWithVector;
        this.stepsUntilCollisionY = this.calculateStepsUntilCollisionUp();
      } else {
        // change direction
        this.verticalDirection = 'down';
        this.velYWithVector *= -1;
        this.y += this.velYWithVector;
        this.stepsUntilCollisionY = this.calculateStepsUntilCollisionDown();
      }
    }
  }

  collideWithXBoundaries() {
    this.horizontalDirection === 'right'
      ? this.x = width - this.size
      : this.x = this.size
    ;
  }
  collideWithYBoundaries() {
    this.verticalDirection === 'down'
      ? this.y = height - this.size
      : this.y = this.size
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
    // reference to the global directionsForEvil
    this.directionsForEvil = directionsForEvil;
    this.directionRight = this.directionsForEvil.arrowright || this.directionsForEvil.d;
    this.directionLeft = this.directionsForEvil.arrowleft || this.directionsForEvil.a;
    this.directionDown = this.directionsForEvil.arrowdown || this.directionsForEvil.s;
    this.directionUp = this.directionsForEvil.arrowup || this.directionsForEvil.w;
    // inital velocity is saved because mousedown events change it and mouseup events revert back to it
    this.initialVel = velX;
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
    /*
    // outer rectangle
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.rect(this.x - this.size, this.y - this.size, 2 * this.size, 2 * this.size);
    ctx.stroke();
    // x axis
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.moveTo(this.x - this.size, this.y);
    ctx.lineTo(this.x + this.size, this.y);
    ctx.stroke();
    // y axis
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.moveTo(this.x, this.y - this.size);
    ctx.lineTo(this.x, this.y + this.size);
    ctx.stroke();
    */
  }

  goLeft() {
    this.directionsForEvil.arrowleft = true;
    this.directionsForEvil.arrowright = false;
  }
  goRight() {
    this.directionsForEvil.arrowleft = false;
    this.directionsForEvil.arrowright = true;
  }
  goDown() {
    this.directionsForEvil.arrowdown = true;
    this.directionsForEvil.arrowup = false;
  }
  goUp() {
    this.directionsForEvil.arrowdown = false;
    this.directionsForEvil.arrowup = true;
  }
  stopHorizontally() {
    this.directionsForEvil.arrowleft = false;
    this.directionsForEvil.arrowright = false;
  }
  stopVertically() {
    this.directionsForEvil.arrowdown = false;
    this.directionsForEvil.arrowup = false;
  }

  updateEvil() {
    // current directions are saved to the corresponding object properties
    this.directionRight = this.directionsForEvil.arrowright || this.directionsForEvil.d;
    this.directionLeft = this.directionsForEvil.arrowleft || this.directionsForEvil.a;
    this.directionDown = this.directionsForEvil.arrowdown || this.directionsForEvil.s;
    this.directionUp = this.directionsForEvil.arrowup || this.directionsForEvil.w;

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
  const vel = random(7, 14);
  return new EvilCircle(
    // always drawn at least one ball width away from the edge of the canvas, to avoid drawing errors
    random(size, width - size),
    random(size, height - size),
    vel,
    vel,
    'red',
    size
  );
}

function multiplyEvilSize(num) {
  // if it's ever zero, make it 1
  evil.size = (evil.size * num) || 1;
}

// this object is referenced by 'evil', so when this is reassigned evil.directionsForEvil should also be reassigned
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
function resetDirections() {
  // reset the directions if focus is lost (in which case keyUp might not be triggered)
  // or mouseup or touchend is triggered
  evil.directionsForEvil = directionsForEvil = {
    arrowleft: false,
    a: false,
    arrowup: false, 
    w: false, 
    arrowright: false, 
    d: false, 
    arrowdown: false,
    s: false,
  };
}
function directionsToGoForEvilUsingKeys (e) {
  // if undefined, it is not a possible key
  // if true, changing true to true serves no purpose
  const keyTriggered = e.key.toLowerCase();
  if (directionsForEvil[keyTriggered] === false) {
    directionsForEvil[keyTriggered] = true;
  }
}
function directionsToAbandonForEvilUsingKeys (e) {
  // if undefined, it is not a possible key
  // if false, changing false to false serves no purpose
  const keyTriggered = e.key.toLowerCase();
  if (directionsForEvil[keyTriggered] === true) {
    directionsForEvil[keyTriggered] = false;
  }
}
function directionsToGoForEvilUsingMouse (mouseEvent) {
  // only pageX and pageY properties of the mouseEvent are used
  // 'page' is used instead of 'client' and 'offset' properties
  // because they include scrolling and also are compatible with mobile devices
  // it gives the offset of canvas because canvas starts at (0, 0)

  // Whether mouse is inside the X and Y axes of evilCircle
  let withinHorizontalBoundaries = false;
  let withinVerticalBoundaries = false;

  // horizontal
  if (mouseEvent.pageX > evil.x + evil.size) {
    evil.goRight();
  } else if (mouseEvent.pageX < evil.x - evil.size) {
    evil.goLeft();
  } else {
    withinHorizontalBoundaries = true;
  }

  // vertical
  if (mouseEvent.pageY > evil.y + evil.size) {
    evil.goDown();
  } else if (mouseEvent.pageY < evil.y - evil.size) {
    evil.goUp();
  } else {
    withinVerticalBoundaries = true;
  }

  // if outside boundaries, it's already dealt with
  if (withinHorizontalBoundaries) {
    if (withinVerticalBoundaries) {
      // within both boundaries
      approachMouseIfOutsideCircle();
    } else {
      // only withinHorizontalBoundaries, meaning horizontal stop
      evil.stopHorizontally();
    }
  } else if (withinVerticalBoundaries) {
    // only withinVerticalBoundaries, meaning vertical stop
    evil.stopVertically();
  }

  function approachMouseIfOutsideCircle() {
    const differenceX = mouseEvent.pageX - evil.x;
    const differenceY = mouseEvent.pageY - evil.y;
    const lengthOfHypotenuse = Math.sqrt(differenceX ** 2 + differenceY ** 2);
    // if the hypotenuse is bigger than the radius, it's outside the circle, otherwise inside it
    // case: outside the circle
    if (lengthOfHypotenuse > evil.size) {
      // Since we are within the boundaries, if mouseEvent.pageY === evil.y, this means we're on the X axis
      // There is no point on the X axis that radius does not reach
      // So it is not a possible case
      const downTheCenter = mouseEvent.pageY > evil.y;
      const leftOfTheCenter = mouseEvent.pageX < evil.x;
      if (leftOfTheCenter) {
        evil.goLeft()
      } else {
        evil.goRight()
      }

      if (downTheCenter) {
        evil.goDown()
      } else {
        evil.goUp();
      }
    } else {
      // case: inside the circle, don't move
      evil.stopHorizontally();
      evil.stopVertically();
    }
  }
}

// set directions using keys
document.addEventListener('keydown', directionsToGoForEvilUsingKeys);
document.addEventListener('keyup', directionsToAbandonForEvilUsingKeys);

function setCoordinates(currentCoordinates, coordinatesObj) {
  // coordinates obj is a MouseEvent obj, or a similar object with pageX and pageY properties
  // currentCoordinates should be bound so that coordinatesObj is the first parameter
  currentCoordinates.pageX = coordinatesObj.pageX;
  currentCoordinates.pageY = coordinatesObj.pageY;
}
// set directions using mouse
document.addEventListener('mousedown', (e) => {
  // if event originates from the instruments wrapper, then ignore it (bubbling)
  if (!instrumentsWrapper.contains(e.target)) {
    const currentCoordinates = {pageX: e.pageX, pageY: e.pageY};
    const setCurrentCoordinates = setCoordinates.bind(globalThis, currentCoordinates);
    document.addEventListener('mousemove', setCurrentCoordinates);
    const changeDirectionsFunc = directionsToGoForEvilUsingMouse.bind(globalThis, currentCoordinates);
    let animationRequestID = requestAnimationFrame(recursivelyChangeDirectionsFunc);
    
    // interval version of requestAnimationFrame
    function recursivelyChangeDirectionsFunc () {
      changeDirectionsFunc();
      animationRequestID = requestAnimationFrame(recursivelyChangeDirectionsFunc);
    }

    document.addEventListener('mouseup', (e) => {
      // timeout is to make clicks have an effect
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.removeEventListener('mousemove', setCurrentCoordinates);
          resetDirections();
          cancelAnimationFrame(animationRequestID);
        });
      });
    }, { once: true });
  }
});

// set directions touching the screen
document.addEventListener('touchstart', (e) => {
  // if event originates from the instruments wrapper, then ignore it (bubbling)
  if (!instrumentsWrapper.contains(e.target)) {
    const touch = e.touches[0];
    const currentCoordinates = {pageX: touch.pageX, pageY: touch.pageY};
    const setCurrentCoordinates = setCoordinates.bind(globalThis, currentCoordinates);
    document.addEventListener('touchmove', (e) => {
      setCurrentCoordinates(e.touches[0]);
    });
    const changeDirectionsFunc = directionsToGoForEvilUsingMouse.bind(globalThis, currentCoordinates);
    let animationRequestID = requestAnimationFrame(recursivelyChangeDirectionsFunc);

    // interval version of requestAnimationFrame
    function recursivelyChangeDirectionsFunc () {
      changeDirectionsFunc();
      animationRequestID = requestAnimationFrame(recursivelyChangeDirectionsFunc);
    }

    document.addEventListener('touchend', () => {
      // timeout is to make clicks have an effect
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.removeEventListener('touchmove', setCurrentCoordinates);
          resetDirections();
          cancelAnimationFrame(animationRequestID);
        });
      });
    }, { once: true });
  }
});

window.addEventListener('blur', resetDirections);

let totalOverlays = 0;
function blackenThenDrawThenSchedule() {
  const start = performance.now();
  // partially remove the trail
  ctx.fillStyle = 'rgb(0 0 0 / 33%)';
  if (++totalOverlays === 40) {
    ctx.fillStyle = 'rgb(0 0 0 / 50%)';
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