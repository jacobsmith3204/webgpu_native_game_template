import React, { useEffect } from 'react';
import { registerRootComponent } from 'expo';
import { Game } from '@game/Game';
// 
import { View } from 'react-native';
import { Canvas, useCanvasRef } from 'react-native-wgpu';




function App() {
  const ref = useCanvasRef(); // ✅ hook inside component

  useEffect(() => {
    if (!ref.current) throw new Error("NO CURRENT REF");


    const initGame = async () => {

      // MIRROR OF src/app.ts
      // with changes to pass in the new canvas/context 
      const game = Game.getInstance();

      try {
        const context = ref.current!.getContext("webgpu");
        const canvas = context!.canvas as Canvas;
        await game.init(canvas, context as GPUCanvasContext);
        game.start();

      }
      catch (e) {
        console.error(e);
      }



    };
    initGame();
  }, []);

  return <Canvas ref={ref} style={{ flex: 1 }} />; // Game probably renders on a canvas/GL view inside
}
export default registerRootComponent(App);

