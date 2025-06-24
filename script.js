const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

class Player {
  constructor(x, y, color, controls, shootKey) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.controls = controls;
    this.shootKey = shootKey;
    this.width = 30;
    this.height = 30;
    this.speed = 3;
    this.health = 100;
    this.cooldown = 0;
    this.bullets = [];
  }

  move() {
    if (keys[this.controls.up]) this.y -= this.speed;
    if (keys[this.controls.down]) this.y += this.speed;
    if (keys[this.controls.left]) this.x -= this.speed;
    if (keys[this.controls.right]) this.x += this.speed;
    this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
    this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));
  }

  shoot() {
    if (this.cooldown === 0 && keys[this.shootKey]) {
      this.bullets.push({ x: this.x + this.width / 2, y: this.y + this.height / 2, dx: this.color === 'red' ? 5 : -5 });
      this.cooldown = 20;
    }
    if (this.cooldown > 0) this.cooldown--;
  }

  updateBullets(opponent) {
    this.bullets.forEach((b, i) => {
      b.x += b.dx;
      if (b.x < 0 || b.x > canvas.width) {
        this.bullets.splice(i, 1);
      } else if (
        b.x > opponent.x &&
        b.x < opponent.x + opponent.width &&
        b.y > opponent.y &&
        b.y < opponent.y + opponent.height
      ) {
        opponent.health -= 10;
        this.bullets.splice(i, 1);
      }
    });
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "white";
    ctx.fillText(`HP: ${this.health}`, this.x, this.y - 5);
    this.bullets.forEach(b => {
      ctx.fillStyle = this.color;
      ctx.fillRect(b.x, b.y, 5, 5);
    });
  }
}

const player1 = new Player(50, 300, "red", {
  up: "w",
  down: "s",
  left: "a",
  right: "d"
}, "f");

const player2 = new Player(720, 300, "blue", {
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright"
}, "l");

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (player1.health <= 0 || player2.health <= 0) {
    ctx.fillStyle = "yellow";
    ctx.font = "30px sans-serif";
    ctx.fillText(player1.health <= 0 ? "Blue Wins!" : "Red Wins!", 320, 280);
    return;
  }

  player1.move();
  player2.move();

  player1.shoot();
  player2.shoot();

  player1.updateBullets(player2);
  player2.updateBullets(player1);

  player1.draw();
  player2.draw();

  requestAnimationFrame(drawGame);
}

drawGame();

