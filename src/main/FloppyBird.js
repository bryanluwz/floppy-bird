export class FloppyBird {
	constructor(canvasWidth, canvasHeight, playerSize, fps, img = null) {
		this.playerSize = playerSize;
		this.hithoxPercentage = 0.5;
		this.hitboxSize = playerSize * this.hithoxPercentage;

		// Up is negative, down is positive
		this.gravity = 0.8;
		this.lift = -16;
		this.velocity = 0;	// How much the bird moves up (no horizantal velocity)
		this.fps = fps;

		this.img = img;

		this.isDead = false;
		this.isFlying = false;

		this.x = 0;
		this.y = 0;

		this.canvasWidth = canvasWidth;
		this.canvasHeight = canvasHeight;

		this.start();
	}

	up() {
		if (!this.isFlying) {
			this.isFlying = true;
		}
		this.velocity = this.lift;
	}

	// Resize
	updateCanvasSize(canvasWidth, canvasHeight) {
		this.canvasWidth = canvasWidth;
		this.canvasHeight = canvasHeight;

		if (this.canvasWidth > this.playerSize * 15) {
			this.x = this.canvasWidth / 8 - this.playerSize / 2;
		}
		else {
			this.x = 0.5 * this.playerSize;
		}
	}

	updatePlayerSize(playerSize) {
		this.playerSize = playerSize;
		this.hitboxSize = playerSize * this.hithoxPercentage;
	}

	// Reset
	resetVelocity() {
		this.velocity = 0;
	}

	resetPlayer() {
		this.start();
	}

	start() {
		this.isDead = false;
		this.isFlying = false;

		if (this.canvasWidth > this.playerSize * 15) {
			this.x = this.canvasWidth / 8 - this.playerSize / 2;
		}
		else {
			this.x = 0.5 * this.playerSize;
		}

		this.y = this.canvasHeight / 2 - this.playerSize / 2;
	}

	update() {
		// Check if started already
		if (!this.isFlying || this.isDead) {
			return;
		}

		// Update position based on velocity and gravity
		this.velocity += this.gravity;
		this.y += this.velocity;

		// Stop at bottom
		if (this.y > this.canvasHeight - this.hitboxSize) {
			this.y = this.canvasHeight - this.hitboxSize;
			this.velocity = 0;

			if (!this.isDead) {
				this.isDead = true;
			}
		}

		// Stop at top
		if (this.y < 0 + this.hitboxSize - this.playerSize) {
			this.y = 0 + this.hitboxSize - this.playerSize;
			this.velocity = 0;

			if (!this.isDead) {
				this.isDead = true;
			}
		}
	}
}

export class Pipe {
	constructor(x, y, width, height, img, fps, velocity) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.img = img;

		this.fps = fps;
		this.velocity = velocity;

		this.start();
	}

	checkOutOfCanvas() {
		return this.x + this.width < 0;
	}

	updateX(x) {
		this.x = x;
	}

	update() {
	}

	start() {

	}
}

export class PipePair {
	constructor(x, y, width, height, img, fps, gap) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.img = img;
		this.gap = gap;

		this.fps = fps;

		this.velocity = 160 / fps;	// Horizontal velocity

		this.pipes = [];
		this.isScored = false;

		this.start();
	}

	checkOutOfCanvas() {
		// true if all pipes are out of canvas
		return this.pipes.every(pipe => pipe.checkOutOfCanvas());
	}

	update() {
		this.x -= this.velocity;
		this.pipes.forEach(pipe => {
			pipe.updateX(this.x);
		}
		);
	}

	start() {
		// Two pipes will be in the pipes array
		// One pipe will be on top of the other
		// The distance between the pipes are fixed (more or less)
		this.pipes.push(new Pipe(this.x, this.y - this.height, this.width, this.height, this.img["top"], this.fps));
		this.pipes.push(new Pipe(this.x, this.y + this.gap, this.width, this.height, this.img["bottom"], this.fps));
		this.isScored = false;
	}
}