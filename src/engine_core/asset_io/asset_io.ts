import { AllocateMesh, AllocateTexture, AllocateShaderModule, AllocateTextureArray, AllocateCubeMap, MeshRaw, Renderer, isWeb } from "@engine_core/renderer";
import UPNG from 'upng-js';
import { readFile } from 'react-native-fs';
import { Asset } from 'expo-asset';


interface AssetGroup {
  [key: string]: any;
}




export const loadImages = (images: AssetGroup) => Promise.all(Object.entries(images).map(([assetName, obj]: [string, any]) => loadImage(obj).then(val => images[assetName] = val)));
export const loadCubeMaps = (images: AssetGroup) => Promise.all(Object.entries(images).map((([assetName, obj]: [string, any]) => loadCubeMap(obj).then(val => images[assetName] = val))));
export const loadObjects = (meshes: AssetGroup) => Promise.all(Object.entries(meshes).map((([assetName, obj]: [string, any]) => loadObject(obj).then(val => meshes[assetName] = val))));
export const loadInkFiles = (inkFiles: AssetGroup) => Promise.all(Object.entries(inkFiles).map((([assetName, obj]: [string, any]) => loadInkFile(obj).then(val => inkFiles[assetName] = val))));
export const loadShaders = (shaders: AssetGroup) => Promise.all(Object.entries(shaders).map((([assetName, obj]: [string, any]) => loadShader(assetName, obj).then(val => shaders[assetName] = val))));
//export const loadAudioClips = (...src: any[]) => Promise.all(src.map(loadAudioClip));
export const loadTextureArrays = (...src: any[]) => Promise.all(src.map(src => fetch(src).then(r => r.arrayBuffer()).then(DecodeImageBlob))).then(bitmaps => AllocateTextureArray(bitmaps)).catch(err => console.error(err));



// 

export const loadImage = (obj: any) => GetPath(obj).then(fromPath).then(r => r.arrayBuffer()).then(DecodeImageBlob).then(bitmap => AllocateTexture(bitmap)).then(texture => copyPixelScale(texture, obj)).catch(err => console.error(err));
export const loadCubeMap = (obj: any) => GetPath(obj).then(fromPath).then(r => r.arrayBuffer()).then(DecodeImageBlob).then(bitmap => AllocateCubeMap(bitmap)).then(texture => copyPixelScale(texture, obj)).catch(err => console.error(err));
export const loadObject = (obj: any) => GetPath(obj).then(fromPath).then(r => r.text()).then(decodeObject).then(array => AllocateMesh(array)).catch(err => console.error(err));
export const loadInkFile = (obj: any) => GetPath(obj).then(fromPath).then(r => r.text());
export const loadShader = (assetName: string, obj: any) => GetPath(obj).then(fromPath).then(r => r.text()).then(decodeShader).then((text: string) => AllocateShaderModule({ label: assetName, code: text })).catch((err) => console.error(err));
//export const loadAudioClip = (src: string) => fromPath(src).then(r => r.arrayBuffer()).then(decodeAudio).then((buffer) => { return { src, buffer }; }).catch((err) => console.error(err));

export const loadTextureArray = async (obj: { modules: any[] }) => {
  const paths = await GetPaths(obj);
  return Promise.all(paths.map(path => fromPath(path).then(r => r.arrayBuffer()).then(DecodeImageBlob))).then(bitmaps => AllocateTextureArray(bitmaps)).then(textures => copyPixelScale(textures, obj)).catch(err => console.error(err));
}

const copyPixelScale = (texture: any, obj: any) => Object.assign(texture, { pixelScale: obj?.pixelScale || 1 / 64 }); // adds default pixelscale

function GetPaths(obj: { modules: any[] }): Promise<string[]> {
  return Promise.all(obj.modules.map((module) => GetPath(module)));
}

async function GetPath(obj: { module: any }): Promise<string> {
  console.log(obj);

  const asset = Asset.fromModule(obj.module);

  console.log(asset);


  if (!asset.downloaded)
    await asset.downloadAsync();
  const path = encodeURI(asset.localUri || asset.uri); // encode fixes errors with slashes and whitespaces
  // 
  if (!asset.localUri)
    throw new Error("unable to get local uri of asset" + obj.toString());
  return path as string;
}

async function fromPath(src: string) {
  if (isWeb) {
    return await fetch(src);
  }
  else {
    const base64 = await readFile(src, 'base64');
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

    return await {
      arrayBuffer: async () => bytes.buffer,
      text: async () => {
        const decoder = new TextDecoder();
        return decoder.decode(bytes);
      },
      url: src,
    } as Response;
  }
}





/* converts the image from blob to byteArray*/
async function DecodeImageBlob(buffer: ArrayBuffer): Promise<Bitmap> {
  try {
    const img = UPNG.decode(buffer); // decode PNG
    const data = UPNG.toRGBA8(img)[0];

    const textureFormat = {
      format: "rgba8unorm",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    };
    return {
      data: data,
      width: img.width,
      height: img.height,
      textureFormat,
    } as Bitmap;
  } catch (err) {
    console.error(err, buffer);
    return {} as Bitmap;
  }
}




async function decodeShader(text: string): Promise<string> {
  return text;
}
/*
async function decodeAudio(data: ArrayBuffer): Promise<any> {
  return audioCtx.decodeAudioData(data);
}*/

type vector = number[];
async function decodeObject(text = ""): Promise<MeshRaw> {
  const v: vector[] = [];
  const vt: vector[] = [];
  const vn: vector[] = [];
  const f: vector[][] = [];
  const buffer: vector[] = [];
  var label: string;

  // parse lines
  const lines = text.split("\n");
  lines.forEach((line) => {
    // splits lines by white space
    const token = line.trim().split(/\s+/);

    // uses the first token to check which type of data its targeting
    switch (token[0]) {
      case "v":
        v.push(destructVectorToken());
        break;
      case "vt":
        vt.push(destructVectorToken());
        break;
      case "vn":
        vn.push(destructVectorToken());
        break;
      case "f":
        f.push(destructFaceToken());
        break;
      case "o":
        label = token[1];

      default:
        break;
    }

    // parses the rest of the token (independant of length so can handle vec2 & vec3)
    function destructVectorToken(): vector {
      const p: vector = [];
      for (let i = 1; i < token.length; i++) p.push(parseFloat(token[i]));
      return p;
    }
    // goes through each token (corner) and stores the numbers so face = [[corner(xy,uv)as indices], [corner...] ...]
    function destructFaceToken() {
      const face: vector[] = [];
      for (let i = 1; i < token.length; i++) {
        const s = token[i].split("/");
        const corner: vector = [];
        for (let k = 0; k < s.length; k++) corner.push(parseInt(s[k]));
        face.push(corner);
      }
      return face;
    }
  });

  // counts the amount of verts so we have a number of verts/triangles to draw later.
  var vertCount = 0;
  f.forEach((face) => {
    // collect corners of face
    const corners = face.map((corner) => {
      // gets the vert, uv and normal data as arrays [[vert (xy)],[uv (xy)], [normal(empty for 2d)]]
      const vert = v[corner[0] - 1]; // .obj starts at 1 not 0
      const uv = vt[corner[1] - 1];
      const normal = vn[corner[2] - 1] || [];
      // flattens them so its now [x,y,z,u,v,nx,ny,nz] or in this 2d case [x,y,u,v]
      return [...vert, ...uv, ...normal];
    });

    /*
      // triangle-strip
      buffer.push(...corners);
      vertCount+= corners.length;
    */

    // writes each individual 'triangle' to the buffer buffer
    if (corners.length == 3) {
      // pushes all corners as in the case of a triangle
      buffer.push(...corners);
      vertCount += 3;
    } else if (corners.length == 4) {
      // if its a quad then, we triangulate it manually.
      // index the corners individually to make 2 triangles
      buffer.push(corners[0], corners[1], corners[2]);
      buffer.push(corners[0], corners[2], corners[3]);
      vertCount += 6;
    }

    // not handling ngons
  });

  //console.log(label, vertCount);

  // are building up an array of arrays so flatten it to a single buffer [[corner(x,y,u,v)],[corner(x,y,u,v)]] -> [x,y,u,v,x,y,u,v]
  return { vertCount, verts: new Float32Array(buffer.flat()) };
}