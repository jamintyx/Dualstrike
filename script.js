const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// Set audio volumes
["sniper", "rifle", "smg"].forEach(id => {
  const audio = document.getElementById("sound-" + id);
  if (audio) {
    audio.volume = id === "sniper" ? 1 : id === "rifle" ? 0.6 : 0.3;
  }
});

class Player {
  constructor(x, y, color, controls, shootKey, weaponKeys, reloadKey) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.controls = controls;
    this.shootKey = shootKey;
    this.weaponKeys = weaponKeys;
    this.reloadKey = reloadKey;

    this.width = 30;
    this.height = 30;
    this.speed = 3;
    this.health = 350;
    this.cooldown = 0;
    this.reloadTime = 0;
    this.selectedWeapon = "rifle";
    this.bullets = [];

    this.weapons = {
      rifle: { cooldown: 20, maxAmmo: 10, ammo: 10, reloadFrames: 90, damage: 10 },
      smg: { cooldown: 5, maxAmmo: 25, ammo: 25, reloadFrames: 60, damage: 5 },
      sniper: { cooldown: 90, unlimited: true, damage: 350 }
    };
  }

  move() {
    if (keys[this.controls.up]) this.y -= this.speed;
    if (keys[this.controls.down]) this.y += this.speed;
    if (keys[this.controls.left]) this.x -= this.speed;
    if (keys[this.controls.right]) this.x += this.speed;
    this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
    this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));
  }

  switchWeapons() {
    if (keys[this.weaponKeys.rifle]) this.selectedWeapon = "rifle";
    if (keys[this.weaponKeys.smg]) this.selectedWeapon = "smg";
    if (keys[this.weaponKeys.sniper]) this.selectedWeapon = "sniper";
  }

  reload() {
    const weapon = this.weapons[this.selectedWeapon];
    if (weapon.unlimited) return;
    if (keys[this.reloadKey] && weapon.ammo < weapon.maxAmmo && this.reloadTime === 0) {
      this.reloadTime = weapon.reloadFrames;
    }
    if (this.reloadTime > 0) {
      this.reloadTime--;
      if (this.reloadTime === 0) weapon.ammo = weapon.maxAmmo;
    }
  }

  shoot() {
    const weapon = this.weapons[this.selectedWeapon];
    if (this.cooldown === 0 && keys[this.shootKey] && this.reloadTime === 0) {
      if (weapon.unlimited || weapon.ammo > 0) {
        this.bullets.push({
          x: this.x + this.width / 2,
          y: this.y + this.height / 2,
          dx: this.color === 'red' ? 6 : -6,
          damage: weapon.damage
        });
        this.cooldown = weapon.cooldown;
        if (!weapon.unlimited) weapon.ammo--;

        // 🔊 Play weapon sound
        const audio = document.getElementById("sound-" + this.selectedWeapon);
        if (audio) {
          audio.currentTime = 0;
          audio.play();
        }
      }
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
        opponent.health -= b.damage;
        this.bullets.splice(i, 1);
      }
    });
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    const weapon = this.weapons[this.selectedWeapon];
    ctx.fillStyle = "white";
    ctx.font = "12px monospace";
    ctx.fillText(`HP: ${this.health}`, this.x, this.y - 5);
    ctx.fillText(`${this.selectedWeapon.toUpperCase()}`, this.x, this.y - 20);

    if (!weapon.unlimited) {
      ctx.fillText(`Ammo: ${weapon.ammo}/${weapon.maxAmmo}`, this.x, this.y - 35);
      if (this.reloadTime > 0) ctx.fillText("Reloading...", this.x, this.y - 50);
    }

    this.bullets.forEach(b => {
      ctx.fillStyle = this.color;
      ctx.fillRect(b.x, b.y, 5, 5);
    });
  }
}

// Player Setup
const player1 = new Player(50, 300, "red", {
  up: "w", down: "s", left: "a", right: "d"
}, "f", { rifle: "1", smg: "2", sniper: "3" }, "r");

const player2 = new Player(720, 300, "blue", {
  up: "arrowup", down: "arrowdown", left: "arrowleft", right: "arrowright"
}, "l", { rifle: "8", smg: "9", sniper: "0" }, "shift");

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (player1.health <= 0 || player2.health <= 0) {
    ctx.fillStyle = "yellow";
    ctx.font = "30px monospace";
    ctx.fillText(player1.health <= 0 ? "Blue Wins!" : "Red Wins!", 300, 280);
    return;
  }

  player1.switchWeapons();
  player2.switchWeapons();

  player1.move(); player2.move();
  player1.reload(); player2.reload();
  player1.shoot(); player2.shoot();
  player1.updateBullets(player2);
  player2.updateBullets(player1);

  player1.draw(); player2.draw();

  requestAnimationFrame(drawGame);
}

drawGame();

