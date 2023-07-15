import { Component } from "react";
import { ContentDisplay } from "../components/others/";
import { createRef } from "react";
import { FloppyBird, PipePair } from "./FloppyBird";

const rootStyles = getComputedStyle(document.documentElement);
const victoryColor = rootStyles.getPropertyValue('--lavender-pastel-font-1');

export default class Main extends Component {
	constructor(props) {
		super(props);

		this.canvasRef = createRef();

		this.game = {
			player: null,
			pipes: [],
			score: 0,
		};

		this.fps = 50;

		this.state = {
			playerSize: 50,
			canNewPipeBeAdded: true
		};

		this.gameOverMessages = [
			"game over",
			"birb is ded",
			"birb is no more",
			"birb is kill",
			"birb is diagnosed with dead",
			"birb is no longer with us",
			"rip birb",
		];
		this.gameOverMessage = "";

		setInterval(() => {
			this.frameUpdate();
		}, 1000 / this.fps);
	}

	componentDidMount() {
		window.addEventListener('resize', this.handleResize);

		// Init game
		this.setState(this.handleResize, this.initGame);

		// What?? A warning?? I don't care
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);
	}

	// Handle screen resize
	handleResize = () => {
		const canvas = this.canvasRef.current;
		if (!canvas) return;

		canvas.width = window.innerWidth * 1;
		canvas.height = window.innerHeight * 1;

		const playerSize = Math.max(40, Math.min(50, canvas.width * 0.05));

		this.setState({ playerSize });

		// Rerender code here
		const player = this.game.player;
		if (!player) return;
		player.updateCanvasSize(canvas.width, canvas.height);
		player.updatePlayerSize(playerSize);
		player.resetVelocity();
	};

	// Render
	frameUpdate = () => {
		const canvas = this.canvasRef.current;
		if (!canvas) return;

		const context = this.canvasRef.current.getContext("2d");
		context.clearRect(0, 0, canvas.width, canvas.height);		// this.renderBackground();

		this.updatePlayer();
		this.renderPlayer();

		if (this.game.player.isFlying) {
			this.updatePipesArray();
			if (!this.game.player.isDead) {
				this.updatePipes();
			}
			this.renderPipes();
		}

		// Check if game is over
		if (this.game.player.isDead) {
			// Draw game over scene
			context.fillStyle = victoryColor;
			context.font = "bold 3em Poppins";
			context.textAlign = "center";
			context.fillText(this.gameOverMessage, canvas.width / 2, canvas.height / 2 - 30);

			context.font = "bold 1.5em Poppins";
			context.fillText(`You scored ${this.game.score} points`, canvas.width / 2, canvas.height / 2 + 10);
		}
		else {
			this.checkIfPlayerCollideWithPipes();
		}
	};

	renderPlayer = () => {
		const canvas = this.canvasRef.current;
		if (!canvas) return;

		const player = this.game.player;

		const context = canvas.getContext("2d");

		// Draw using players image
		context.fillStyle = "#000000";
		context.fillRect(player.x, player.y, player.playerSize, player.playerSize);
	};

	updatePlayer = () => {
		const player = this.game.player;

		player.update();
	};

	renderPipes = () => {
		// Draw the pipes using pipes image
		const canvas = this.canvasRef.current;
		if (!canvas) return;

		const pipes = this.game.pipes;

		const context = canvas.getContext("2d");

		// Draw using players image
		context.fillStyle = "#000000";
		pipes.forEach(pipePair => {
			pipePair.pipes.forEach(pipe => {
				context.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
			});
		}
		);
	};

	updatePipes = () => {
		// Update the pipes position
		const pipes = this.game.pipes;
		pipes.forEach(pipePair => {
			pipePair.pipes.forEach(pipe => {
				pipe.update();
			});
		}
		);
	};

	updatePipesArray = () => {
		const canvas = this.canvasRef.current;
		if (!canvas) return;

		// Adding new pipes in array if pipes are less than 3
		// Remove pipes from array if they are out of the left canvas
		// Pipes initial position are within a range of (x to y) from the player
		// Pipes come in pair, top and bottom
		// The distance between the top and bottom pipe are fixed (more or less)
		// The distance between the pipes are fixed (more or less)
		// The pipes would be moving from right to left towards the player at a fixed rate
		if (this.game.pipes.length < 5) {
			// Add new pipes in array, and have cooldown of 3 secs before new one is added
			if (!this.state.canNewPipeBeAdded) return;

			if (Math.random() < 0.5 || this.game.pipes.length === 0) {
				this.game.pipes.push(new PipePair(canvas.width, Math.floor(Math.random() * canvas.height / 2), 100, canvas.height, null, this.fps, canvas.height / 3));

				this.setState({ canNewPipeBeAdded: false }, () => {
					setTimeout(() => {
						this.setState({ canNewPipeBeAdded: true });
					}, 3000);
				});
			}
		}

		// Remove pipes that are out of the left canvas
		this.game.pipes.forEach(pipePair => {
			if (pipePair.checkOutOfCanvas()) {
				this.game.pipes.splice(this.game.pipes.indexOf(pipePair), 1);
				this.game.score++;
				console.log(this.game.score);
			}
		});

	};

	// Check if player collide with pipes
	checkIfPlayerCollideWithPipes = () => {
		const player = this.game.player;
		const pipes = this.game.pipes;

		// generated by GitHub Copilot
		pipes.forEach(pipePair => {
			const [topPipe, bottomPipe] = pipePair.pipes;
			if (player.x + player.playerSize > topPipe.x && player.x < topPipe.x + topPipe.width) {
				if (player.y < topPipe.y + topPipe.height || player.y + player.playerSize > bottomPipe.y) {
					player.isDead = true;
				}
			}
		}
		);
	};

	// Reset game
	initGame = () => {
		const canvas = this.canvasRef.current;
		if (!canvas) return;

		// Create new player
		this.game.player = new FloppyBird(canvas.width, canvas.height, this.state.playerSize, this.fps);

		// Init pipes
		this.setState({ canNewPipeBeAdded: true });
		this.gameOverMessage = this.gameOverMessages[Math.floor(Math.random() * this.gameOverMessages.length)];

		this.game.pipes = [];

		// Reset score
		this.game.score = 0;
	};

	resetGame = () => {
		this.game.player.resetPlayer();
		this.game.pipes = [];
		this.game.score = 0;
		this.gameOverMessage = this.gameOverMessages[Math.floor(Math.random() * this.gameOverMessages.length)];
	};

	// Check if space bar or click (touch / press) is pressed
	checkIfSpaceBarOrClick = (e) => {
		if (e.code === "Space" || e.type === "click") {
			if (this.game.player.isDead) {
				this.resetGame();
			}
			else {
				this.game.player.up();
			}
		}
	};

	render() {
		return (
			<ContentDisplay
				backButtonRoute={"https://bryanluwz.github.io/"}
				displayName={Main.displayName}
				displayClearHistory={false}
				faIcon={"fa-trash"}
				contentBodyAdditionalClasses={["floppy-bird-content-body"]}
				router={this.props.router}
				handleHeaderTitleClick={() => { console.log("please do not the title"); }}
			>
				<canvas
					ref={this.canvasRef}
					className="floppy-bird-canvas"
					tabIndex={1000}
					onClick={this.checkIfSpaceBarOrClick}
					onKeyDownCapture={this.checkIfSpaceBarOrClick}
				/>
			</ContentDisplay>
		);
	}
}

Main.displayName = "Floppy Bird";
