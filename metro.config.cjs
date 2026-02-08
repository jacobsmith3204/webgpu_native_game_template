const { getDefaultConfig } = require("expo/metro-config");
const defaultConfig = getDefaultConfig(__dirname);
const path = require('path');

defaultConfig.resolver.extraNodeModules = {
  "@assets": path.resolve(__dirname, 'public/assets'), // <- points @assets to ./dist/assets folder 
  // (dist is the vite build copied path, so when making changes i now have to vite build then android build )
};

// the types of file extentions it will resolve whe using requires(""); 

const fileExtentions = [
  "wgsl",
  "obj",
  "ink",
];


for (const extention of fileExtentions)
  defaultConfig.resolver.assetExts.push(extention);

module.exports = defaultConfig;