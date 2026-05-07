import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CanvasService } from '../../services/canvas.service';

@Component({
  selector: 'app-canvas',
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.scss'
})

export class CanvasComponent implements AfterViewInit, OnDestroy {

  @ViewChild('canvasElement') canvasElement: ElementRef<HTMLCanvasElement>;

  constructor(private canvasService: CanvasService) { }

  ngAfterViewInit(): void {
    this.canvasService.setup(this.canvasElement.nativeElement);
  }

  ngOnDestroy(): void {
    this.canvasService.onDestroy();
  }
}
