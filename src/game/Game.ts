// core
import { Renderer, newFrameView } from "@engine_core/renderer";
import { Scene } from "@engine_core/scene";
import { Manager } from "@engine_core/manager";
import { InputUpdate, InputLateUpdate } from "@engine_core/input";
import { loadAllAssets } from "@engine_core/asset_io/LoadAssets";
//import { setupAudioSystem, MultiTrackCrossfader } from "@engine_core/audio";

// components 

import { Camera } from "@components/camera";
import { Transform } from "@components/transform";


import { setupInputHandlers } from "@interface/interface";
import { GameScene, SceneManager } from "./SceneManager";
import { InteractablePersonEntity } from "./types";
import { Story } from "inkjs";
import { Instantiate } from "@engine_core/utils";
/*
import { StoryManager } from "@game/inkle/StoryManager";
import { CHARACTERS, switchToScene } from "./inkle";
import { Character, characters } from "./inkle/Character";
*/



// Singleton class for the game
export class Game {
  static instance: Game;
  //canvas: HTMLCanvasElement;
  camera!: Camera;
  renderer!: Renderer;
  scene!: Scene;
  //audioSystem: MultiTrackCrossfader | undefined;
  interactablePeople: InteractablePersonEntity[] = [] as InteractablePersonEntity[];
  sceneManager: SceneManager;
  //storyManager?: StoryManager;

  static getInstance() {
    return Game.instance || (Game.instance = new Game());
  }
  /*static getCurrentGameStory(): Story | undefined {
    return StoryManager.currentStory;
  }*/
  static getCurrentScene(): GameScene {
    return Game.instance.sceneManager.stateName as GameScene;
  }


  constructor() {
    if (Game.instance) {
      throw new Error("Game already exists");
    }
    Game.instance = this;
    this.scene = new Scene();
    this.sceneManager = new SceneManager();
    //this.storyManager = new StoryManager();
    console.log("created game instance");
  }



  async init(canvas: Canvas, context: GPUCanvasContext) {

    console.log("starting game initialisation");


    // Initialize renderer first (required for asset loading)
    this.renderer = await Renderer.Create(canvas, context);

    console.log("loaded renderer...");

    // Initialize camera (sets up ResizeObserver and initial canvas size)
    this.camera = Instantiate(new Camera(), new Transform()) as Camera;
    this.camera.initialise(Renderer.surface);
    this.camera.position = [0, -1, -15];

    // allows us to access these from the console 
    /*
      window.renderer = this.renderer;
      window.camera = this.camera;
      window.scene = this.scene;
    */

    console.log("setup camera...");

    // Load audio system and all other assets (must happen after renderer is initialized)
    //[this.audioSystem] = await Promise.all([setupAudioSystem(), loadAllAssets(),]);
    await loadAllAssets();

    console.log("loaded audio system and assets");
    //binds the external functions and sets up the story (uses the ink files so must happen after the load assets) 
    //this.storyManager?.init();

    console.log("initialised story");


    Manager.AddUpdateEvents([
      InputUpdate,
      () => Scene.HandleUpdate(this.scene),
      () =>
        this.renderer.RenderPasses([
          {
            // RENDER PASS
            init: newFrameView,
            drawPass: (pass: any, gpu: any) =>
              this.scene.ForAllObjects((obj: any) =>
                obj?.handlePass?.(pass, gpu, this.camera)
              ), // draws the scene heirachy
          },
        ]),
      InputLateUpdate,
    ]);
    setupInputHandlers();
  }


  start(sceneName: GameScene = GameScene.Main) {
    console.log("starting gameloop");
    Manager.StartUpdateLoop();

    console.log("STARTING GAME");
    this.sceneManager.state = sceneName;


    // Initialize with tutorial scene
    /* switchToScene(sceneName);
     // if we are not debugging the game for any reason, starts the standarad tutorial conversation. 
     if (sceneName === GameScene.Tutorial) {
       StoryManager.StartConversationWith(CHARACTERS.TUTORIAL_CHARACTER, "Start");
     }*/
  }
}






// preload the textures so it loads immediately 



//function preloadBackgroundTextures() {  return Promise.all(Object.values(characters).map(preloadTexture))}





declare global {
  interface Window {
    renderer: Renderer;
    camera: Camera;
    scene: Scene;
  }
}



