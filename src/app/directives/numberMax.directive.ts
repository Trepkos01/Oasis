import { Directive, HostListener, Inject, Input} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[NumberMax]',
})

export class NumberMax {
  constructor(@Inject(NG_VALUE_ACCESSOR) private valueAccessor:ControlValueAccessor) {};

  @Input() NumberMax:string;

  @HostListener('change', ['$event']) change(event) {
      let inputValue:number = Number(event.target.value);
      let max:number = Number(this.NumberMax);
      if(inputValue < 0)
        this.valueAccessor[1].writeValue(0);
      else if(inputValue > max)
        this.valueAccessor[1].writeValue(Math.floor(max));
      else
        this.valueAccessor[1].writeValue(inputValue);
  }
}
