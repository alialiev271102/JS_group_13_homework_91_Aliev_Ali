import {AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild} from '@angular/core';

interface Pixel {
  x: number,
  y: number,
  color: string,
}

interface ServerMessage {
  type: string,
  coordinates: Pixel[],
  pixelCoordinate: Pixel,
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnDestroy, AfterViewInit {
  @ViewChild('canvas') canvas!: ElementRef;
  color!: string;
  ws!: WebSocket;

  ngAfterViewInit() {
    this.ws = new WebSocket('ws://localhost:8000/draw');
    this.ws.onclose = () => console.log('ws closed');

    this.ws.onmessage = event => {
      const decodedMessage: ServerMessage = JSON.parse(event.data);

      if(decodedMessage.type === "OLD_PIXELS"){
        decodedMessage.coordinates.forEach(c => {
          this.drawPixel(c.x, c.y, c.color);
        });
      }

      if(decodedMessage.type === "NEW_PIXEL"){
        const {x, y} = decodedMessage.pixelCoordinate;
        this.drawPixel(x, y, this.color);
      }
    }

  }

  ngOnDestroy() {
    this.ws.close();
  }

  drawPixel(x: number, y: number, color: string) {
    const canvas: HTMLCanvasElement = this.canvas.nativeElement;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x - 5, y - 5, 5, 0, 2 * Math.PI);
    ctx.fill();
    // ctx.fillRect(x - 5, y - 5, 10, 10);
  }

  clearCanvas() {
    const canvas: HTMLCanvasElement = this.canvas.nativeElement;
    const ctx = canvas.getContext("2d")!;
    this.ws.send(JSON.stringify({
      type: 'CLEAR_CANVAS'
    }))
    ctx.clearRect(0, 0, 500, 500);
  }

  getColor(event: Event) {
    console.log(event.target);
  }

  clickOnCanvas(event: MouseEvent) {
    const x = event.offsetX;
    const y = event.offsetY;
    const color = this.color;
    console.log(color);
    this.ws.send(JSON.stringify({
      type: 'SEND_PIXEL',
      coordinates: {x, y, color},
    }))
  }

  onClick(event: Event) {
    this.color = (<HTMLSelectElement>event.target).value;
  }

}
