"use strict";

/////////////////////////////
// Imports

import "../css/reset.css";
import "../css/style.css";
import "../css/queries.css";

/////////////////////////////
// Elements
const rulesBtn = document.getElementById("rules-btn");
const closeBtn = document.getElementById("close-btn");
const rulesEl = document.getElementById("rules");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const leftBtn = document.getElementById("move-left");
const rightBtn = document.getElementById("move-right");

/////////////////////////////
// Variables

let score = 0;

const brickRowCount = 9;
const brickColumnCount = 5;

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
  w: 80,
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

/////////////////////////////
// Event-listeners
// click open rules button
rulesBtn.addEventListener("click", () => {
  rulesEl.classList.add("show");
});

// click close rules button
closeBtn.addEventListener("click", () => {
  rulesEl.classList.remove("show");
});

// move left button is pressed
leftBtn.addEventListener("mousedown", () => {
  paddle.dx = -paddle.speed;
});

// move left button is released
leftBtn.addEventListener("mouseup", () => {
  paddle.dx = 0;
});

// move right button is pressed
rightBtn.addEventListener("mousedown", () => {
  paddle.dx = paddle.speed;
});

// move right button is released
rightBtn.addEventListener("mouseup", () => {
  paddle.dx = 0;
});

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
    score = 0;
  }

  // paddle collision
  if (
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.w &&
    ball.y + ball.size > paddle.y
  ) {
    ball.dy *= -1;
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

          increaseScore();

          // console.log("Ball: ", ball.x, ball.y);
          // console.log("Brick: ", brick.x, brick.y);

          // change direction
          // collision is on top or bottom
          if (
            (ball.y - ball.size < brick.y &&
              ball.y + ball.size - 5 < brick.y) ||
            (ball.y + ball.size > brick.y + brick.h &&
              ball.y - ball.size + 5 > brick.y + brick.h)
          ) {
            ball.dy *= -1;
          }
          // collision is on left or right
          else {
            ball.dx *= -1;
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
    score = 0;
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
  // move everything
  movePaddle();
  moveBall();

  // draw everything
  draw();

  // animate
  requestAnimationFrame(update);
}
