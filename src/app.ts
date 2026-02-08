import { Game } from "@game/Game";


console.log("running Web Game?");

// Initialize and start the game
const game = Game.getInstance();
// app.ts should be only used by the web/vite 

//@ts-ignore
const canvas = document.querySelector("canvas");
const context = canvas.getContext("webgpu");
await game.init(canvas, context);
game.start(); 
