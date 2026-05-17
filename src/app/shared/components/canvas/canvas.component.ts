import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { BaseCanvasService } from '../../../core/services/base-canvas-service';

@Component({
  selector: 'app-canvas',
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.scss'
})
export class CanvasComponent implements AfterViewInit, OnDestroy {

  @Input() canvasService: BaseCanvasService | undefined = undefined;
  @ViewChild('canvasElement') canvasElement: ElementRef<HTMLCanvasElement>;

  constructor() { }

  ngAfterViewInit(): void {
    this.canvasService.setup(this.canvasElement.nativeElement);
  }

  ngOnDestroy(): void {
    this.canvasService.onDestroy();
  }
}
