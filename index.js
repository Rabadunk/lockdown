const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const score = document.querySelector('#score')
const finalScore = document.querySelector('#finalScore')
const startGameBtn = document.querySelector('#startGameBtn')
const card = document.querySelector('#card')

canvas.width = innerWidth;
canvas.height = innerHeight;
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }


    draw() {
        // ctx.beginPath();
        // ctx.arc(
        //     this.x,
        //     this.y,
        //     this.radius,
        //     0,
        //     Math.PI * 2, false
        // );
        // ctx.fillStyle = this.color;
        // ctx.fill();
        const img = new Image();
        img.src = "./kiwi.png"

        ctx.drawImage(img, this.x - (this.radius*1.5)/2, this.y - this.radius/2, this.radius*1.5, this.radius)
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {  
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(
            this.x,
            this.y,
            this.radius,
            0,
            Math.PI * 2, false
        );
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    fade() {
        ctx.save();
        ctx.globalAlpha = 0.1
        ctx.beginPath();
        ctx.arc(
            this.x,
            this.y,
            this.radius,
            0,
            Math.PI * 2, false
        );
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.draw();
    }


    updateFade() {
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.fade();
        this.alpha -= 0.01;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {  
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {

        const img = new Image();
        img.src = "./covid.png"
        // ctx.beginPath();
        // ctx.arc(
        //     this.x,
        //     this.y,
        //     this.radius,
        //     0,
        //     Math.PI * 2, false
        // );
        // ctx.fillStyle = this.color;
        // ctx.fill();

        ctx.drawImage(img, this.x - this.radius, this.y - this.radius, this.radius*2, this.radius*2);
    }

    update() {
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.draw();
    }

}



let bullets = [];
let enemies = [];
let particles = [];
let newPoints = 0;

function init() {
    score.innerHTML = 0;
    finalScore.innerHTML = 0;
    bullets = [];
    enemies = [];
    particles = [];
    newPoints = 0;
}

const player = new Player(centerX, centerY, 100, 'white');
player.draw();



addEventListener('click', (event) => {
    console.log("click");

    // Getting velocity for bullet
    const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
    const velocity = {
        x: Math.cos(angle) * 3,
        y: Math.sin(angle) * 3
    }
    bullets.push(new Projectile(centerX, centerY, 5, '#00ff1e', velocity))

})

startGameBtn.addEventListener('click', () => {
    init();
    animate();
    spawnEnemies();
    card.style.display = 'none';
})

function spawnEnemies() {
    setInterval( () => {
        const radius = 30 * Math.random() + 10;
        const color = '#00ff1e';

        let x, y;

        if(Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        
        // Getting velocity for enemy
        const angle = Math.atan2(centerY - y, centerX - x);
        let rand = Math.random();
        const velocity = {
            
            x: Math.cos(angle) * rand * 2 ,
            y: Math.sin(angle) * rand * 2
        }
        enemies.push(new Enemy(x, y, radius, color, velocity));
    },1000)
}

let animationId;
function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1';
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    particles.forEach((particle, index) => {
        if(particle.alpha <= 0) {
            particles.splice(index, 1);
        } else {
            particle.updateFade();
        }

    })

    bullets.forEach((bullet, bIndex) => {
        bullet.update();

        if(bullet.x - bullet.radius < 0 ||
            bullet.x - bullet.radius > canvas.width ||
            bullet.y - bullet.radius > canvas.height ||
            bullet.y + bullet.radius < 0) {
            setTimeout(() => {
                bullets.splice(bIndex, 1)
            }, 0)
        }
    })
    enemies.forEach((enemy, index) => {
        enemy.update();

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist - enemy.radius - 50 < 1) {
            setTimeout(() => {
                cancelAnimationFrame(animationId);
                finalScore.innerHTML = newPoints;
                card.style.display = 'flex';
            })
            
        }

        bullets.forEach((bullet, bIndex) => {
            const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);

            // handle collision
            if (dist - enemy.radius - bullet.radius < 1) {



                for(let i = 0; i < 8; i++) {
                    particles.push(new Projectile(bullet.x, bullet.y, Math.random() * 4, 'red', {
                        x: (Math.random() -0.5) * Math.random() * 5,
                        y: (Math.random() - 0.5) * Math.random() * 5
                    }))
                }

                if (enemy.radius - 10 > 10) {
                    newPoints += 10;
                    score.innerHTML = newPoints;
                    gsap.to(enemy, {
                        radius:enemy.radius - 10
                    })
                    bullets.splice(bIndex, 1)
                } else {
                    newPoints += 50;
                    score.innerHTML = newPoints;
                    setTimeout(() => {
                        enemies.splice(index, 1)
                        bullets.splice(bIndex, 1)
                    }, 0)
                }

            }
        })
    })

    player.draw();

}
