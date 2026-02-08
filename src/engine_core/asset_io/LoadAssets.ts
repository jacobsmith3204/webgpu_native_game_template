import { SpriteRenderer } from "@components/rendering/spriteRenderer";
import * as renderers from "@components/rendering/index";
import * as fs from "@engine_core/asset_io/asset_io";
import { Transform } from "@components/transform";
import { AllocateUniformBuffer } from "@engine_core/renderer";


// assets will resolve var:{module/require, etc}  to var: {final obeject} 

export const Assets = {
  textures: {
    backgroundTexture: { module: require(`@assets/sprites/ballroom_background.png`), pixelScale: 1 / 256 },
    placeholderTexture: { module: require(`@assets/sprites/characterPortraits/placeholder_guy.png`), pixelScale: 1 / 256 },
    playerTexture: { module: require(`@assets/sprites/character.png`), pixelScale: 1 / 256 },
    fontTexture: { module: require(`@assets/sprites/font.png`), pixelScale: 1 / 64 },
    flatColorTexture: { module: require(`@assets/sprites/flatColor.png`), pixelScale: 1 / 64 },
    skyboxTexture: { module: require(`@assets/sprites/skybox.png`), pixelScale: 1 / 64 },
    stablemasterTexture: { module: require(`@assets/sprites/characterStanding/stablemaster.png`), pixelScale: 1 / 64 },
    bishopTexture: { module: require(`@assets/sprites/characterStanding/bishop.png`), pixelScale: 1 / 64 },
  },
  textureArrays: {
    explosionTexture: {
      modules: [
        require(`@assets/sprites/explosion/explosion0000.png`),
        require(`@assets/sprites/explosion/explosion0001.png`),
        require(`@assets/sprites/explosion/explosion0002.png`),
        require(`@assets/sprites/explosion/explosion0003.png`),
        require(`@assets/sprites/explosion/explosion0004.png`),
        require(`@assets/sprites/explosion/explosion0005.png`),
        require(`@assets/sprites/explosion/explosion0006.png`),
        require(`@assets/sprites/explosion/explosion0007.png`),
        require(`@assets/sprites/explosion/explosion0008.png`),
        require(`@assets/sprites/explosion/explosion0009.png`),
        require(`@assets/sprites/explosion/explosion0010.png`),
        require(`@assets/sprites/explosion/explosion0011.png`),
        require(`@assets/sprites/explosion/explosion0012.png`),
        require(`@assets/sprites/explosion/empty.png`)],
      pixelScale: 1 / 64
    }
  },
  shaders: {
    spriteShader: { module: require(`@assets/shader/spriteShader.wgsl`) },
    meshShader: { module: require(`@assets/shader/meshShader.wgsl`) },
    /*tileShader: { module: require(`@assets/shader/tileShader.wgsl`) },
    textShader: { module: require(`@assets/shader/textShader.wgsl`) },
    skyboxShader: { module: require(`@assets/shader/skyboxShader.wgsl`) },
    spriteShaderWithAtlus: { module: require(`@assets/shader/spriteShaderWithAtlus.wgsl`) },*/
  },
  meshs: {
    quadMesh: { module: require(`@assets/models/quad.obj`,) },
    textQuadMesh: { module: require(`@assets/models/textQuad.obj`,) },
    cubeMesh: { module: require(`@assets/models/cube.obj`,) },
    //suzanneMesh: { module: require(`@assets/models/suzanne.obj`) },
  },
  audioClips: {
    footstepClips: {
      modules: [
        require(`@assets/audio/footstep1.wav`),
        require(`@assets/audio/footstep2.wav`)]
    }
  },
  inkFiles: {
    tutorialInk: { module: require(`@assets/dialogue/tutorial.ink`) },
    storyInk: { module: require(`@assets/dialogue/inkstory.ink`), },
    endingInk: { module: require(`@assets/dialogue/ending.ink`), },
  }
}

// Function to load all assets (must be called after renderer is initialized)
export async function loadAllAssets() {
  await Promise.all([
    fs.loadImages(Assets.textures),
    fs.loadShaders(Assets.shaders),
    fs.loadObjects(Assets.meshs),

    //fs.loadTextureArray(Assets.textureArrays.explosionTexture),
    //fs.loadAudioClips(Assets.audioClips),
    //fs.loadInkFiles(Assets.inkFiles),

  ]);
}

// abstracted out the dependancies for sprites.
// (can be passed in directly to the instantiate function)


export const SpriteDependencies = () => [
  new SpriteRenderer(),
  new Transform(),

  Assets.meshs.quadMesh,
  {
    cameraMatrixBuffer: AllocateUniformBuffer(208),
    shaderModule: Assets.shaders.spriteShader,
  },
];

// abstracted out dependancies for meshes.
export const MeshDependacies = () => [
  renderers.meshRenderer,
  new Transform(),
  {
    cameraMatrixBuffer: AllocateUniformBuffer(3 * 64),
    shaderModule: Assets.shaders.meshShader,
  },
];