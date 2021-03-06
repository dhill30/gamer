// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();


function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

function GameEngine() {
    this.entities = [];
    this.showOutlines = false;
    this.ctx = null;
    this.click = null;
    this.mouse = { x: 400, y: 400 };
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
    this.timer = new Timer();
    console.log('game initialized');
}

GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    console.log('starting input');
    var that = this;
    that.space = false;
    that.shift = false;

    var getXandY = function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;
        return { x: x, y: y };
    }

    this.ctx.canvas.addEventListener("keydown", function (e) {
        if (String.fromCharCode(e.which) === ' ') that.space = !that.space;
        if (event.shiftKey) that.shift = !that.shift;
        if (e.keyCode == '38' || e.keyCode == '87') that.up = true;
        if (e.keyCode == '40' || e.keyCode == '83') that.down = true;
        if (e.keyCode == '37' || e.keyCode == '65') that.left = true;
        if (e.keyCode == '39' || e.keyCode == '68') that.right = true;
        e.preventDefault();
    }, false);

    this.ctx.canvas.addEventListener("keyup", function (e) {
        if (e.keyCode == '38' || e.keyCode == '87') that.up = false;
        if (e.keyCode == '40' || e.keyCode == '83') that.down = false;
        if (e.keyCode == '37' || e.keyCode == '65') that.left = false;
        if (e.keyCode == '39' || e.keyCode == '68') that.right = false;
        e.preventDefault();
    }, false);

    this.ctx.canvas.addEventListener("mousemove", function (e) {
        that.mouse = getXandY(e);
    }, false);

    this.ctx.canvas.addEventListener("click", function (e) {
        that.clickmouse = true;
    }, false);

    console.log('input started');
}

GameEngine.prototype.addEntity = function (entity) {
    console.log('added entity');
    this.entities.push(entity);
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    this.ctx.restore();
}

GameEngine.prototype.update = function () {
    var entitiesCount = this.entities.length;

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.entities.length - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            this.entities.splice(i, 1);
        }
    }
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
    this.clickmouse = false;
}

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Entity(game, x, y, rot = 0) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.rotation = rot;
    this.removeFromWorld = false;
}

Entity.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
}

Entity.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
}

Entity.prototype.collideRight = function () {
    return (this.x + this.radius) > 1280;
}

Entity.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
}

Entity.prototype.collideBottom = function () {
    return (this.y + this.radius) > 720;
}

Entity.prototype.hurt = function (other) {
    if (this.enemy && other.player) {
        var rotdif = 0;
        if (other.rotation < this.rotation) rotdif = this.rotation - other.rotation;
        else rotdif = other.rotation - this.rotation;
        if ((rotdif > 3*Math.PI/4 && rotdif < 5*Math.PI/4) || (rotdif > 7*Math.PI/4) || (rotdif < Math.PI/4))
            return distance(this, other) < this.range + other.faces;
        return distance(this, other) < this.range + other.sides;
    }
    else if (this.player && other.enemy)
        return distance(this, other) < this.range + other.faces;
    return distance(this, other) < this.range + other.radius;
}

Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
        this.game.ctx.arc();
    }
}

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    //offscreenCtx.strokeStyle = "red";
    //offscreenCtx.strokeRect(0,0,size,size);
    return offscreenCanvas;
}
