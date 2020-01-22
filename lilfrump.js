function Frump(game) {
    this.idle = new Animation(ASSET_MANAGER.getAsset("./img/LilFrumpSheet.png"), 0, 0, 200, 200, 0.4, 2, true, false);
    this.walk = new Animation(ASSET_MANAGER.getAsset("./img/LilFrumpSheet.png"), 0, 200, 200, 200, 0.1, 8, true, false);
    this.attack = new Animation(ASSET_MANAGER.getAsset("./img/LilFrumpSheet.png"), 200, 0, 200, 200, 0.1, 3, false, false);
    this.die = new Animation(ASSET_MANAGER.getAsset("./img/LilFrumpSheet.png"), 0, 1200, 200, 200, 0.1, 3, false, false);
    this.dead = new Animation(ASSET_MANAGER.getAsset("./img/LilFrumpSheet.png"), 400, 1200, 200, 200, 1, 1, false, false);
    this.swordIdle = new Animation(ASSET_MANAGER.getAsset("./img/LilFrumpSheet.png"), 0, 400, 200, 200, 0.4, 2, true, false);
    this.swordWalk = new Animation(ASSET_MANAGER.getAsset("./img/LilFrumpSheet.png"), 0, 600, 200, 200, 0.1, 8, true, false);
    this.swordAttack = new Animation(ASSET_MANAGER.getAsset("./img/LilFrump.png"), 400, 400, 200, 330, 0.1, 5, false, false);
    this.knifeIdle = new Animation(ASSET_MANAGER.getAsset("./img/LilFrumpSheet.png"), 0, 800, 200, 200, 0.4, 2, true, false);
    this.knifeWalk = new Animation(ASSET_MANAGER.getAsset("./img/LilFrumpSheet.png"), 0, 1000, 200, 200, 0.1, 8, true, false);
    this.knifeAttack = new Animation(ASSET_MANAGER.getAsset("./img/LilFrumpSheet.png"), 400, 800, 200, 200, 0.05, 3, false, false);
    this.radius = 38;
    this.player = true;
    this.velocity = { x: 0, y: 0 };
    this.acceleration = 100;
    this.maxSpeed = 250;
    this.currentHealth = new health(this, 10);

    //new stuff
    this.alive = true;
    this.isDead = false;
    this.currentWeapon = "unarmed";
    Entity.call(this, game, 400, 400);
}

Frump.prototype = new Entity();
Frump.prototype.constructor = Frump;

Frump.prototype.update = function () {
    if (this.game.spawn) this.game.addEntity(new Enemy(this.game));
    if (this.game.shift) this.currentWeapon = "knife";
    if (this.game.space) this.currentWeapon = "sword";
    if (!this.game.shift & !this.game.space) this.currentWeapon = "unarmed";
    if (this.game.clickmouse) this.attacking = true;
    if (this.attacking) {
        if(this.currentWeapon == "unarmed"){
            if (this.attack.isDone()) {
                this.attack.elapsedTime = 0;
                this.attacking = false;
                this.radius = 38;
            }
        }
        if(this.currentWeapon == "knife"){
            if (this.knifeAttack.isDone()) {
                this.knifeAttack.elapsedTime = 0;
                this.attacking = false;
                this.radius = 38;
            }
        }
        if(this.currentWeapon == "sword"){
            if (this.swordAttack.isDone()) {
                this.swordAttack.elapsedTime = 0;
                this.attacking = false;
                this.radius = 38;
            }
        }        
    }
    // extra janky death system
    if(this.currentHealth <= 0) this.alive = false;
    if(this.alive == false){
        this.maxSpeed == 0;
        this.velocity == 0;
        this.acceleration == 0;
        if (this.die.isDone()) {
            this.die.elapsedTime = 0;
            this.isDead == true;
        }
    }
    
    //old code

    // if (this.game.clickmouse && this.game.space) this.attacking = true;
    // if (this.attacking) {
    //     //this.radius = 68;
    //     if (this.swordAttack.isDone()) {
    //         this.swordAttack.elapsedTime = 0;
    //         this.attacking = false;
    //         this.radius = 38;
    //     }
    // }

    if (this.game.up) this.velocity.y -= this.acceleration;
    if (this.game.down) this.velocity.y += this.acceleration;
    if (this.game.left) this.velocity.x -= this.acceleration;
    if (this.game.right) this.velocity.x += this.acceleration;

    if (this.collideLeft() || this.collideRight()) {
        this.currentHealth -= 1;
        this.velocity.x = -this.velocity.x * (1/friction);
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
    }
    if (this.collideTop() || this.collideBottom()) {
        this.currentHealth -= 1;
        this.velocity.y = -this.velocity.y * (1/friction);
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
    }

    

    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > this.maxSpeed) {
        var ratio = this.maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    this.velocity.x -= friction * this.game.clockTick * this.velocity.x;
    this.velocity.y -= friction * this.game.clockTick * this.velocity.y;

    Entity.prototype.update.call(this);
}

Frump.prototype.draw = function (ctx) {
    this.rotation = Math.atan2(this.game.mouse.y - this.y, this.game.mouse.x - this.x) + Math.PI/2;

    //handle death animations, kind of
    if(this.alive == false){
        //for the dying animation
        this.die.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation);
    }
    else if(this.isDead == true){
        //supposed to just play the last frame of the death animation
        this.dead.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation);
        
    }
    else{
        if (this.attacking) {
            if (this.currentWeapon == "unarmed") this.attack.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation);
            if (this.currentWeapon == "knife") this.knifeAttack.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation);
            if (this.currentWeapon == "sword") this.swordAttack.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation);
        }
        else {
            if (this.game.up || this.game.left || this.game.down || this.game.right) {
                if (this.currentWeapon == "unarmed") this.walk.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation);
                if (this.currentWeapon == "knife") this.knifeWalk.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation);
                if (this.currentWeapon == "sword") this.swordWalk.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation);
            }
            else {
                if (this.currentWeapon == "unarmed") this.idle.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation);
                if (this.currentWeapon == "sword") this.swordIdle.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation);
                if (this.currentWeapon == "knife") this.knifeIdle.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation);
            }
        }
    }
    Entity.prototype.draw.call(this);
}
