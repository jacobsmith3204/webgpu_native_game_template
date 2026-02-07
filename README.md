an exploration of webgpu and wasm(assemblyscript) 

```npm ci``` (for a clean install) 



**commands**
DEVELOPMENT
- ```npm run dev``` (uses vite to launch the project in the browser, use when making changes to the program)
ASSEMBLY_SCRIPT
- ```npm run build:as``` (builds the assemblyscript files into `/build`, then runs `./postbuild/.js` to bind external functions. uses asconfig.json which contains a list of the .ts files that will become the wasm build)
- 


VITE 
- ```npm run dev``` 
- ```npm run build```
- ```npm run preview```

(web standalone)
- ```npm run build:standalone``` (compiles for running the project in web without needing the vite dev server -compiles assembly_script.ts files and builds using vite. build files end up in `/dist`)  
- ```npm run start:standalone``` (runs a simple file server to host the build files in `/dist`)


EXPO (react-native)
- ```npm run start``` (expo starts metro)
- ```npm run android``` (expo run:android - build react-native android and push to phone if debugging is attached)
- ```npm run ios``` (expo run:ios - build react-native ios)
<!-- - ```npm run web``` (expo start--web - react-native web) --> 


*hints*
new assembly_script.ts files need to be added to asconfig.json and will be compiled into a single wasm file
