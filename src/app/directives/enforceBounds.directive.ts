import { Directive, HostListener, Inject, Input} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { EnsembleService } from '../services/ensember.service';

@Directive({
  selector: '[EnforceBounds]',
})

export class EnforceBounds {
  //Get the ControlValueAccessor service to set the value of the field and the EnsembleService to determine the value to set the field to.
  constructor(@Inject(NG_VALUE_ACCESSOR) private valueAccessor:ControlValueAccessor, private ensembleService: EnsembleService) {};

  //This is the value sent to the directive which says which type of bucket information we're working with: 'gross', 'net'.
  @Input() EnforceBounds:string;

  @HostListener('change', ['$event']) change(event) {
      //Call the service function to determine how much of the ratio pie of contributions is left based on the current
      //buckets belonging to the group of type 'gross' or 'net'.
      let maxBound:number = this.ensembleService.getContributionPercentageBound(this.EnforceBounds);
      let inputValue:number = Number(event.target.value);

      //Ensure that the user's input is either between 0 or the maximum allowed amount, determined above.
      if(inputValue < 0)
        this.valueAccessor[1].writeValue(0);
      else if(inputValue > maxBound)
        this.valueAccessor[1].writeValue(maxBound);
      else
        this.valueAccessor[1].writeValue(Math.round(inputValue));

      this.ensembleService.updateBucketsContributionTotals();
  }
}