(() => {
	"use strict";

	/* global core2d */

	const { Color, Command, Core2D, Rect, Sprite } = core2d;

	const PUSHABLE_TAG = "pushable";
	const SPEED_SIZE_RATIO = 0.25;
	const STAR_BLINK_CHANCE = 10;
	const STAR_DENSITY = 100;

	class BaseTile extends Sprite {
		constructor(id) {
			super();
			this.setImage(id);
		}
	}

	class ClickableSprite extends Sprite {
		constructor() {
			super();
			this.addTag("clickable");
			this.setSolid();
		}

		onClick() {
			// no default behavior
		}

		onHoverIn() {
			// no default behavior
		}

		onHoverOut() {
			// no default behavior
		}
	}

	class ControllableSprite extends Sprite {
		constructor() {
			super();
			this.controller = Core2D.getController();
			this.step = 2;
		}

		setStep(step) {
			this.step = step;
			return this;
		}

		sync() {
			if (this.controller.keyDown(Command.LEFT) && this.left > 0) {
				this.x -= this.step;
			}

			if (this.controller.keyDown(Command.RIGHT) && this.right < this.scene.width) {
				this.x += this.step;
			}

			if (this.controller.keyDown(Command.UP) && this.top > 0) {
				this.y -= this.step;
			}

			if (this.controller.keyDown(Command.DOWN) && this.bottom < this.scene.height) {
				this.y += this.step;
			}

			return Sprite.prototype.sync.call(this);
		}
	}

	class CursorSprite extends Sprite {
		constructor() {
			super();
			this.hovering = null;
			this.pointer = Core2D.getPointer();
			this.setSolid();
		}

		check(sprite) {
			const FOCUS = new Rect(this.getLeft(), this.getTop(), 1, 1);
			return sprite.hasCollision(FOCUS);
		}

		onCollision(sprite) {
			if (sprite.hasTag("clickable") && this.check(sprite)) {
				if (this.hovering != sprite) {
					if (this.hovering) {
						this.hovering.onHoverOut();
					}

					this.hovering = sprite;
					sprite.onHoverIn();
				}
			}
		}

		update() {
			this.setPosition(this.pointer);

			if (this.hovering) {
				if (!this.hasCollision(this.hovering)) {
					this.hovering.onHoverOut();
					this.hovering = null;
				} else if (this.pointer.getPush()) {
					this.hovering.onClick();
				}
			}
		}
	}

	class Fog extends Sprite {
		init() {
			this.scene.add(new FogLayer()
				.setImageId("fogSprite0")
				.setSpeedX(-1));

			this.scene.add(new FogLayer()
				.setImageId("fogSprite1")
				.setSpeedX(1)
				.setRight(this.scene.right));
		}
	}

	class FogLayer extends Sprite {
		init() {
			this.setLayerIndex(2)
				.setHeight(this.scene.height)
				.setWidth(this.scene.width * 2);
		}

		update() {
			if (this.speedX < 0 && this.right == this.scene.right || this.speedX > 0 && this.left == this.scene.left) {
				const SIGNAL = this.speedX / Math.abs(this.speedX);
				this.x -= this.scene.width * SIGNAL;
			}
		}
	}

	class FontSprite extends Sprite {
		constructor(text = "") {
			super();
			this.font = "";
			this.text = text;
		}

		render(context) {
			Sprite.prototype.render.call(this, context) && this._parse(context);
		}

		setFont(font) {
			this.font = font;
		}

		setText(text) {
			this._text = text;
			this._parse();
			return this;
		}

		get text() {
			return this._text;
		}

		set text(text) {
			this.setText(text);
		}

		_parse(context) {
			const SPACE = 4;
			const SPACING = 0;
			let height = 0;
			let width = 0;
			let x = 0;
			let y = 0;

			for (let i = 0; i < this._text.length; ++i) {
				let character = this._text[i];

				if (character == " ") {
					x += SPACE + SPACING;
				} else if (character == "\n") {
					x = 0;
					y += height + SPACING;
				} else {
					const IMAGE = Core2D.image(character + this.font + "Font");

					if (context) {
						context.drawImage(IMAGE, this.x + this.scene.x + x, this.y + this.scene.y + y, IMAGE.width, IMAGE.height);
					}

					x += IMAGE.width + SPACING;

					if (x > width) {
						width = x;
					}

					if (IMAGE.height > height) {
						height = IMAGE.height;
					}
				}
			}

			this.setWidth(width);
			this.setHeight(y + height);
		}
	}

	class JumperSprite extends Sprite {
		constructor(scene) {
			super(scene);
			this.accelerationY = 0.5;
			this.canGoLeft = true;
			this.canGoRight = true;
			this.canJump = false;
			this.controller = Core2D.getController();
			this.jumpCommand = Command.A;
			this.jumpSpeed = -8;
			this.solid = true;
			this.step = 2;
		}

		setJumpCommand(jumpCommand) {
			this.jumpCommand = jumpCommand;
			return this;
		}

		setJumpSpeed(jumpSpeed) {
			this.jumpSpeed = jumpSpeed;
			return this;
		}

		setStep(step) {
			this.step = step;
			return this;
		}

		jump() {
			this.canJump = false;
			this.setSpeedY(this.jumpSpeed);
			this.onJump();
		}

		onCollision(sprite) {
			const collision = this.getCollision(sprite);

			if (collision.bottom) {
				if (this.speedY > 0) {
					this.setSpeedY(0);
					this.setBottom(sprite.top - 1);
					this.canJump = true;
				}

				this.onBottomCollision(sprite);
			} else if (collision.top) {
				if (this.speedY < 0) {
					this.setSpeedY(0);
					this.setTop(sprite.bottom + 1);
				}

				this.onTopCollision(sprite);
			} else if (collision.left) {
				if (!sprite.hasTag(PUSHABLE_TAG)) {
					this.canGoLeft = false;
				}

				this.setLeft(sprite.right + 1);
				this.onLeftCollision(sprite);
			} else if (collision.right) {
				if (!sprite.hasTag(PUSHABLE_TAG)) {
					this.canGoRight = false;
				}

				this.setRight(sprite.left - 1);
				this.onRightCollision(sprite);
			}
		}

		sync() {
			if (this.solid) {
				if (this.canJump && this.controller.keyPush(this.jumpCommand)) {
					this.jump();
				}

				if (this.canGoLeft && this.controller.keyDown(Command.LEFT)) {
					this.x -= this.step;
					this.canGoRight = true;
					this.onLeft();
				} else if (this.canGoRight && this.controller.keyDown(Command.RIGHT)) {
					this.x += this.step;
					this.canGoLeft = true;
					this.onRight();
				} else {
					this.onIdle();
				}

				if (!this.collided) {
					this.canGoLeft = true;
					this.canGoRight = true;
					this.canJump = false;
				}
			}

			return Sprite.prototype.sync.call(this);
		}

		onJump() {
			// no default behavior
		}

		onIdle() {
			// no default behavior
		}

		onLeft() {
			// no default behavior
		}

		onRight() {
			// no default behavior
		}

		onLeftCollision(sprite) {
			// no default behavior
			return sprite;
		}

		onRightCollision(sprite) {
			// no default behavior
			return sprite;
		}

		onTopCollision(sprite) {
			// no default behavior
			return sprite;
		}

		onBottomCollision(sprite) {
			// no default behavior
			return sprite;
		}
	}

	class RandomRectTransition extends Sprite {
		init() {
			this.columns = 16;
			this.rows = 8;
			this.setColor(Color.Black);
			this.setWidth(this.scene.width / this.columns);
			this.setHeight(this.scene.height / this.rows);
			this.rects = [];

			for (let i = 0; i < this.columns * this.rows; ++i) {
				this.rects.push(i);
			}
		}

		sync() {
			if (!this.rects.length) {
				return true;
			}

			const number = this.rects.splice(Core2D.random(this.rects.length - 1), 1);
			const column = number % this.columns;
			const row = Math.floor(number / this.columns);
			this.x = column * this.width;
			this.y = row * this.height;
			return Sprite.prototype.sync.call(this);
		}
	}

	class Star extends Sprite {
		init() {
			this.addTag("star").setBoundary();
		}

		offBoundary() {
			if (this.right < this.scene.left) {
				this.setLeft(this.scene.right);
			} else if (this.left > this.scene.right) {
				this.setRight(this.scene.left);
			}

			if (this.bottom < this.scene.top) {
				this.setTop(this.scene.bottom);
			} else if (this.top > this.scene.bottom) {
				this.setBottom(this.scene.top);
			}
		}

		update() {
			this.setVisible(Core2D.random(STAR_BLINK_CHANCE * this.width) > 0);
		}
	}

	class Starfield extends Sprite {
		constructor() {
			super();
			this.colors = [Color.White];
		}

		init() {
			for (let i = 0; i < STAR_DENSITY; ++i) {
				const SIZE = 1 + Core2D.random(1);

				this.scene.add(new Star()
					.setColor(this.colors[Core2D.random(this.colors.length - 1)])
					.setX(Core2D.random(this.scene.width))
					.setY(Core2D.random(this.scene.height))
					.setWidth(SIZE)
					.setHeight(SIZE)
					.setSpeedX(this.speedX * SIZE * SPEED_SIZE_RATIO)
					.setSpeedY(this.speedY * SIZE * SPEED_SIZE_RATIO));
			}
		}

		setColors(colors) {
			this.colors = colors;
			return this;
		}
	}

	const exports = {
		BaseTile,
		ClickableSprite,
		ControllableSprite,
		CursorSprite,
		Fog,
		FontSprite,
		JumperSprite,
		RandomRectTransition,
		Starfield,
	};

	if ("object" == typeof(module)) {
		module.exports = exports;
	} else if ("object" == typeof(window)) {
		if (!window.core2d) {
			throw "Core2D must be imported before plugin";
		}

		window.core2d.plugin = exports;
	}
})();
