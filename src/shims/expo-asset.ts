//@ts-ignore
export const isWeb = typeof require == "undefined" || require("react-native").Platform.OS == 'web';


// Native import only loaded on mobile
let ExpoAsset: any;
if (!isWeb) {
  //@ts-ignore
  ExpoAsset = require('expo-asset').Asset;
}

export class Asset {
  module: any;

  constructor(module: any) {
    this.module = module;
  }

  static fromModule(module: any) {
    return new Asset(module);
  }

  get localUri() {
    if (isWeb) {
      // On web, the import/require is already a URL string
      return this.module;
    } else {
      // Native: use Expo's Asset
      return this.module.localUri;
    }
  }

  async downloadAsync() {
    if (isWeb) return this; // no-op
    else return await ExpoAsset.fromModule(this.module).downloadAsync();
  }
}


declare global {
  // @ts-ignore
  var require: (src: string) => any;
}

if (isWeb && typeof globalThis.require === "undefined") {
  // @ts-ignore
  globalThis.require = function (src: string): any {
    // Simple conversion, e.g., remove '@' if you’re using aliases
    const localUri = src.startsWith("@") ? src.slice(1) : src;
    return localUri;// { localUri, downloadAsync: async () => { } };
  };
}