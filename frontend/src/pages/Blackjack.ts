import BjScene from '../tools/games/BjScene';

export default function Blackjack(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex justify-center items-center h-screen bg-[#09050d]';

  const canvas = document.createElement('canvas');
  canvas.className = 'block fixed w-full h-full';
  container.appendChild(canvas);

  // Initial size, will be resized for the responsive
  canvas.width = 2032;
  canvas.height = 1016;
  canvas.style.width = canvas.width + "px";
  canvas.style.height = canvas.height + "px";

  const resizeCanvas = () => {
    if (window.innerHeight / window.innerWidth > 0.5) {
      canvas.width = window.innerWidth;
      canvas.height = canvas.width * 0.5;
    } else {
      canvas.height = window.innerHeight;
      canvas.width = canvas.height / 0.5;
    }
    canvas.style.width = canvas.width + "px";
    canvas.style.height = canvas.height + "px";
  };
  
  function game() {
    const bjScene = new BjScene(canvas);

    resizeCanvas();
    bjScene.engine.resize();

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("resize", () => bjScene.engine.resize());
    
    bjScene.start();
  }

  game();

  return container;
}
