
import { throws } from 'assert';
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useElementSize, useInterval } from 'usehooks-ts';


class Entity {
  private speed_x: number;
  private speed_y: number;
  public pos_x: number;
  public pos_y: number;
  public clicked: boolean;
  private width: number;
  private height: number;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, size: number) {
    this.canvas = canvas;
    this.clicked = false;
    this.width = size;
    this.height = size;
    this.speed_x = Math.random() > 0.5 ? 1 : -1 * (Math.random() + 3); 
    this.speed_y = Math.random() > 0.5 ? 1 : -1 * (Math.random() + 3);
    this.pos_x = ((Math.random()*0.6) + 0.2) * this.canvas.width;
    this.pos_y = ((Math.random()*0.6) + 0.2) * this.canvas.height;
  }

  draw(context: CanvasRenderingContext2D) {
    // console.log(this.pos_x, this.pos_y, this.width, this.height);
    context.fillStyle = this.clicked ? "green" : "red";
    context.fillRect(this.pos_x, this.pos_y, this.width, this.height);
  }

  move() {
    const new_x = this.pos_x + this.speed_x;
    const new_y = this.pos_y + this.speed_y;
    // console.log("new values")
    // console.log(new_x, new_y);

    if(new_x < 0){
      this.pos_x = 0;
      this.speed_x = -(this.speed_x + (Math.random()-0.5));
    } else if (new_x + this.width >= this.canvas.width) {
      this.pos_x = this.canvas.width - this.width;
      this.speed_x = -(this.speed_x + (Math.random()-0.5));
    } else {
      this.pos_x = new_x;
    }

    if(new_y < 0){
      this.pos_y = 0;
      this.speed_y = -(this.speed_y + (Math.random()-0.5));
    } else if (new_y + this.height >= this.canvas.height) {
      this.pos_y = this.canvas.height - this.height;
      this.speed_y = -(this.speed_y + (Math.random()-0.5));
    } else {
      this.pos_y = new_y;
    }
  }

}

class CanvasClass {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private entities: Entity[] = [];
  private interval: NodeJS.Timer | undefined;
  private boxSize: number;
  public maxEntities: number;
  public clickedEntities: number;
  private showClicked: boolean;

  constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    // const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    // const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.canvas = canvas;
    this.context = context;
    this.showClicked = true;
    this.boxSize = 30;
    this.clickedEntities = 0;
    this.maxEntities = Math.floor(Math.random()*7 + 3);

    for(let i = 0; i < this.maxEntities; i++) {
      this.entities.push(new Entity(this.canvas, this.boxSize));
    }

  }


  drawEntities() {
    for(let i = 0; i < this.entities.length; i++){
      if(this.showClicked){
        if (!this.entities[i].clicked) {
          this.entities[i].draw(this.context);
        }
      } else {
        this.entities[i].draw(this.context);
      }
      
    }
  }

  move() {
    for(let i = 0; i < this.entities.length; i++){
      this.entities[i].move();
    }
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawText() {
    this.context.fillStyle = "blue";
    this.context.font = "20px monospace";
    this.context.textAlign = "end";
    this.context.textBaseline = "top";
    this.context.fillText("Clicked boxes: " + this.clickedEntities + "/" + this.maxEntities, this.canvas.width - 10, 10);
    if (this.showClicked) {
      this.context.fillText("Toggle show clicked [ ]", this.canvas.width - 10, 40);
    } else {
      this.context.fillText("Toggle show clicked [X]", this.canvas.width - 10, 40);
    }
    
  }

  loop() {
    // console.log("calling loop");
    this.clear();
    this.move();
    this.drawEntities();
    this.drawText();
  }

  start() {
    this.interval = setInterval(this.loop, 20);
  }

  stop() {
    clearInterval(this.interval);
  }

  resizeCanvas() {
    this.canvas.width  = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
  }

  clicked(x: number, y:number) {
    const entitiesSnapshop = this.entities.slice();
    for(let i = 0; i < entitiesSnapshop.length; i++){
      if(x >= entitiesSnapshop[i].pos_x && x <= entitiesSnapshop[i].pos_x + this.boxSize &&
         y >= entitiesSnapshop[i].pos_y && y <= entitiesSnapshop[i].pos_y + this.boxSize &&
         entitiesSnapshop[i].clicked === false) {
        entitiesSnapshop[i].clicked = true;
        this.clickedEntities++;
      }
    }
    if (x >= this.canvas.width - 40 && x <= this.canvas.width - 10 &&
        y >= 40                     && y <= 40 + 20 ){
          this.showClicked = !this.showClicked;
    }
  }

}

export default function Home() {
  const [game, setGame] = useState<CanvasClass>();
  const [context, setContext] = useState<CanvasRenderingContext2D>();
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  // const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasRef, {width, height}] = useElementSize<HTMLCanvasElement>();
  
  useInterval(() => {
    game?.loop();
  }, 20);
  
  useEffect(() => {
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    canvas.width  = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const game = new CanvasClass(canvas, context);
    
    setCanvas(canvas);
    setContext(context);
    setGame(game);
  }, [])

  useEffect(() => {
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
    }
  }, [width, height])

  function tesaat(e: any) {
    console.log(e);
    console.log(e.clientX, e.clientY);
    game?.clicked(e.clientX, e.clientY);
  }


  // useEffect(() => {
  //   if(game !== undefined){
  //     console.log("test");
  //   }
  // }, [game])

  return (
    <div>
      <Head>
        <title>Template by FM</title>
        <meta name="description" content="Template by FM" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='w-screen h-screen'>
        <canvas  id="myCanvas" className='w-full h-full border-2 border-red-400' ref={canvasRef} onClick={(e) => tesaat(e)}>
        </canvas> 
      </main>

      <footer>
      </footer>
    </div>
  )
}
