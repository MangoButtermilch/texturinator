import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { DefaultCanvas } from '../../../core/services/default-canvas.class';

@Component({
  selector: 'app-canvas',
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.scss'
})
export class CanvasComponent implements AfterViewInit, OnDestroy {

  @Input() canvasService: DefaultCanvas | undefined = undefined;
  @ViewChild('canvasElement') canvasElement: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    this.canvasService.setup(this.canvasElement.nativeElement);
  }

  ngOnDestroy(): void {
    this.canvasService.onDestroy();
  }
}
