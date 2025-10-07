import PgScene from "../tools/games/PgScene";
import DropDownMenu from "../tools/DropDownMenu";

export default function Pong(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex justify-center items-center h-screen bg-black';
  
  const canvas = document.createElement('canvas');
  canvas.className = 'w-full h-full';
  container.appendChild(canvas);

  container.appendChild(DropDownMenu());

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

  const keys: { [key: string]: boolean } = {}; // Send to backend
  
  const handleKeyDown = (e: KeyboardEvent) => {
    keys[e.code] = true;
  };
  const handleKeyUp = (e: KeyboardEvent) => {
    keys[e.code] = false;
  };
  const handleBlur = () => {
    Object.values(keys).forEach(key => key = false);
  };
  
  function game() {
    const pgScene = new PgScene(canvas, keys);
    
    resizeCanvas();
    pgScene.engine.resize();

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("resize", () => pgScene.engine.resize());
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    pgScene.start();
  }

  game();

  return container;
};