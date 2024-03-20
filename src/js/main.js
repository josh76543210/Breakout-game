/*"use strict";

/////////////////////////////
// Imports

import "../css/reset.css";
import "../css/style.css";
import "../css/queries.css";

/////////////////////////////
// Elements*/
const rulesBtn = document.getElementById("rules-btn");
const closeBtn = document.getElementById("close-btn");
const rulesEl = document.getElementById("rules");
const newGameBtn = document.getElementById("new-game-btn");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const leftBtn = document.getElementById("move-left");
const rightBtn = document.getElementById("move-right");

/////////////////////////////
// Variables

// amount of angle change when ball hits paddle
const bounceSensitivity = 1;

const paddleWidth = 80;

let score = 0;
let gameStart = false;
let gameOver = false;
let gameWin = false;

let brickDestroyed = false;

const brickRowCount = 9;
const brickColumnCount = 5;

// create textbox props
const textBox = {
  x: canvas.width / 2 - 150,
  y: canvas.height / 2 - 40,
  w: 300,
  h: 80,
  text: {
    content: "Start New Game",
    x: canvas.width / 2 - 85,
    y: canvas.height / 2 + 8,
  },
};

// create ball props
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 10,
  speed: 4,
  dx: 4,
  dy: -4,
};

// create brick props
const brickInfo = {
  w: 70,
  h: 20,
  padding: 10,
  offsetX: 45,
  offsetY: 60,
  visible: true,
};

// create paddle props
const paddle = {
  x: canvas.width / 2 - 40,
  y: canvas.height - 20,
  w: paddleWidth,
  h: 10,
  speed: 8,
  dx: 0,
};

// create brick props
const bricks = [];
for (let i = 0; i < brickRowCount; i++) {
  bricks[i] = [];
  for (let j = 0; j < brickColumnCount; j++) {
    const x = i * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
    const y = j * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
    bricks[i][j] = { x, y, ...brickInfo };
  }
}

/////////////////////////////
// Run
update();
// setInterval(() => {
//   console.log(document.activeElement);
// }, 100);

/////////////////////////////
// Event-listeners
// click start new game button
newGameBtn.addEventListener("click", (e) => {
  gameStart = true;
  gameOver = false;
  gameWin = false;
  originBallAndPaddle();

  removeCanvasEvents();

  // draw everything
  draw();

  // start game after 3 seconds
  setTimeout(update, 3000);

  // remove button
  e.target.classList.add("hidden");
});

// click open rules button
rulesBtn.addEventListener("click", () => {
  rulesEl.classList.add("show");
});

// click close rules button
closeBtn.addEventListener("click", () => {
  rulesEl.classList.remove("show");
});

// click move left button
leftBtn.addEventListener("click", () => {
  paddle.dx = -paddle.speed;
});

// click move right button
rightBtn.addEventListener("click", () => {
  paddle.dx = paddle.speed;
});

// move left button is pressed
// leftBtn.addEventListener("touchdown", () => {
//   paddle.dx = -paddle.speed;
// });
// leftBtn.addEventListener("mousedown", () => {
//   paddle.dx = -paddle.speed;
// });
// leftBtn.addEventListener("focusin", () => {
//   paddle.dx = -paddle.speed;
//   console.log("LEFT");
// });

// move left button is released
// leftBtn.addEventListener("touchup", () => {
//   paddle.dx = 0;
// });
// leftBtn.addEventListener("mouseup", () => {
//   paddle.dx = 0;
// });
// leftBtn.addEventListener("focusout", () => {
//   paddle.dx = 0;
//   console.log("NOT LEFT");
// });

// move right button is pressed
// rightBtn.addEventListener("touchdown", () => {
//   paddle.dx = paddle.speed;
// });
// rightBtn.addEventListener("mousedown", () => {
//   paddle.dx = paddle.speed;
// });
// rightBtn.addEventListener("focusin", () => {
//   paddle.dx = paddle.speed;
// });

// move right button is released
// rightBtn.addEventListener("touchup", () => {
//   paddle.dx = 0;
// });
// rightBtn.addEventListener("mouseup", () => {
//   paddle.dx = 0;
// });
// rightBtn.addEventListener("focusout", () => {
//   paddle.dx = 0;
// });

// key is down
document.addEventListener("keydown", (e) => {
  // right arrow key
  if (e.key === "Right" || e.key === "ArrowRight") {
    paddle.dx = paddle.speed;
    rightBtn.classList.add("btn--control-active");
  }
  // left arrow key
  if (e.key === "Left" || e.key === "ArrowLeft") {
    paddle.dx = -paddle.speed;
    leftBtn.classList.add("btn--control-active");
  }
});

// key is lifted
document.addEventListener("keyup", (e) => {
  if (
    e.key === "Right" ||
    e.key === "ArrowRight" ||
    e.key === "Left" ||
    e.key === "ArrowLeft"
  ) {
    paddle.dx = 0;
    rightBtn.classList.remove("btn--control-active");
    leftBtn.classList.remove("btn--control-active");
  }
});

/////////////////////////////
// Functions
// draw ball on canvas
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
  ctx.fillStyle = "#0095dd";
  ctx.fill();
  ctx.closePath();
}

// draw paddle on canvas
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.fillStyle = "#0095dd";
  ctx.fill();
  ctx.closePath();
}

// draw score on canvas
function drawScore() {
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, canvas.width - 100, 30);
}

// draw "game over" on canvas
function drawGameOver() {
  ctx.fillStyle = "#000";
  ctx.font = "bold 45px Arial";
  ctx.fillText("Game Over", canvas.width / 2 - 120, 400);
}

// draw "you win" on canvas
function drawWin() {
  ctx.fillStyle = "#000";
  ctx.font = "bold 45px Arial";
  ctx.fillText("You Win!", canvas.width / 2 - 90, 400);
}

// draw bricks on canvas
function drawBricks() {
  bricks.forEach((column) => {
    column.forEach((brick) => {
      ctx.beginPath();
      ctx.rect(brick.x, brick.y, brick.w, brick.h);
      ctx.fillStyle = brick.visible ? "#0095dd" : "transparent";
      ctx.fill();
      ctx.closePath();
    });
  });
}

// move paddle on canvas
function movePaddle() {
  paddle.x += paddle.dx;

  // wall detection
  if (paddle.x + paddle.w > canvas.width) {
    paddle.x = canvas.width - paddle.w;
  }
  if (paddle.x < 0) {
    paddle.x = 0;
  }
}

//move ball on canvas
function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // wall collision (right/left)
  if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) {
    ball.dx *= -1;
  }

  // wall collision (top/bottom)
  if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
    ball.dy *= -1;
  }

  // wall collision (bottom) - lose the game
  if (ball.y + ball.size > canvas.height) {
    showAllbricks();
    originBallAndPaddle();
    score = 0;
    gameOver = true;
  }

  // paddle collision
  if (
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.w &&
    ball.y + ball.size > paddle.y
  ) {
    ball.dy *= -1;
    // range the contact with paddle from -1 to 1 (0 is middle of paddle)
    const paddleContact = (ball.x - paddle.x - 100) / 100;
    // console.log(paddleContact);
    ball.dx += paddleContact * bounceSensitivity;
  }

  // brick collision
  bricks.forEach((column) => {
    column.forEach((brick) => {
      if (brick.visible) {
        if (
          ball.x + ball.size > brick.x && // left brick side check
          ball.x - ball.size < brick.x + brick.w && // right brick side check
          ball.y + ball.size > brick.y && // top brick side check
          ball.y - ball.size < brick.y + brick.h // bottom brick side check
        ) {
          // hide brick
          brick.visible = false;
          brickDestroyed = true;

          increaseScore();

          if (
            brick.y + brick.h - (ball.y - ball.size) > 6 &&
            ball.y + ball.size - brick.y > 6
          ) {
            ball.dx *= -1;
            brickDestroyed = false;
          } else {
            ball.dy *= -1;
            brickDestroyed = false;
          }
        }
      }
    });
  });
}

// increase score
function increaseScore() {
  score++;

  // check of win
  if (score === brickRowCount * brickColumnCount) {
    showAllbricks();
    originBallAndPaddle();
    score = 0;
    gameWin = true;
  }
}

// make all bricks appear
function showAllbricks() {
  bricks.forEach((column) => {
    column.forEach((brick) => (brick.visible = true));
  });
}

// draw all elements on canvas
function draw() {
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBall();
  drawPaddle();
  drawScore();
  drawBricks();
}

// update canvas drawing and animation
function update() {
  if (!gameStart) {
    return;
  }

  if (gameOver) {
    // console.log("GAMEOVER");

    // showGameStartBox();

    // show new game button
    newGameBtn.classList.remove("hidden");

    // write game-over message on canvas
    drawGameOver();

    return;
  }

  if (gameWin) {
    // console.log("You Win!");

    // showGameStartBox();

    // show new game button
    newGameBtn.classList.remove("hidden");

    // write win message on canvas
    drawWin();

    return;
  }

  // console.log("update");

  // move everything
  movePaddle();
  moveBall();

  // draw everything
  draw();

  // animate
  requestAnimationFrame(update);
}

function canvasClick(e) {
  // canvas offset
  const canvasLeft = canvas.offsetLeft + canvas.clientLeft;
  const canvasTop = canvas.offsetTop + canvas.clientTop;

  // mouse position on canvas
  const x = e.pageX - canvasLeft;
  const y = e.pageY - canvasTop;
  // console.log("page", x, y);

  // if mouse is on button
  if (155 < x && x < 344 && 162 < y && y < 211) {
    gameStart = true;
    gameOver = false;
    gameWin = false;
    originBallAndPaddle();

    removeCanvasEvents();

    // draw everything
    draw();

    // start game after 3 seconds
    setTimeout(update, 3000);
  }
}

// function canvasMove(e) {
//   // canvas offset
//   const canvasLeft = canvas.offsetLeft + canvas.clientLeft;
//   const canvasTop = canvas.offsetTop + canvas.clientTop;

//   // mouse position on canvas
//   const x = e.pageX - canvasLeft;
//   const y = e.pageY - canvasTop;
//   // console.log("page", x, y);

//   // if mouse is on button
//   if (155 < x && x < 344 && 162 < y && y < 211) {
//     canvas.style.cursor = "pointer";
//   } else {
//     canvas.style.cursor = "default";
//   }
// }

// remove canvas events
function removeCanvasEvents() {
  canvas.removeEventListener("click", canvasClick);
  // document.removeEventListener("onmousemove", canvasMove);
  // canvas.style.cursor = "default";
}

// show game-start-box
function showGameStartBox() {
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw start-game-box
  ctx.beginPath();
  ctx.rect(textBox.x, textBox.y, textBox.w, textBox.h);
  ctx.fillStyle = "#0095dd";
  ctx.fill();
  ctx.closePath();
  // draw start-game-text
  ctx.fillStyle = "#fff";
  ctx.font = "bold 24px Arial";
  ctx.fillText(textBox.text.content, textBox.text.x, textBox.text.y);

  // add hover cursor to start-game-box
  // document.addEventListener("onmousemove", canvasMove);
  // Listen for mouse clicks
  canvas.addEventListener("click", canvasClick);
}

// position ball and paddle to origin
function originBallAndPaddle() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = 4;
  ball.dy = -4;

  paddle.x = canvas.width / 2 - 40;
  paddle.y = canvas.height - 20;
  paddle.dx = 0;
}
