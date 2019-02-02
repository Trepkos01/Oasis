import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Bucket } from '../../classes/bucket';

import { EnsembleService } from '../../services/ensember.service';

@Component({
  selector: 'bucket-detail',
  templateUrl: './bucketDetail.component.html',
})
export class BucketDetailComponent {

  //The bucket of interest and application mode, both are inputted by the parent app component.
  @Input() bucket;
  @Input() mode;

  //The event emitter which emits a mode change back to the parent component. This ensures that there is a consistency between components.
  @Output() modechangenotification: EventEmitter<string> = new EventEmitter<string>();

  constructor(private ensembleService: EnsembleService) { }

  //Add the bucket to the service based on the values of the form. Set the selected bucket to the newly created bucket and set the mode to "edit_bucket" and emit this new mode
  //back to the parent component.
  onCreate(val):void{
    if(val.type == "taxes")
      this.ensembleService.addNewBucket(new Bucket(val.label, val.type, val.method, val.contribution, null, null, null, null, null, null, null), val.type);
    else{
      if(val.method == "save")
        this.ensembleService.addNewBucket(new Bucket(val.label, val.type, val.method, val.contribution, val.investment_minimum, val.investment_return_lower, val.investment_return_upper, val.annual_contribution_limit, null, null, null), val.type);
      else
        this.ensembleService.addNewBucket(new Bucket(val.label, val.type, val.method, val.contribution, null, null, null, null, val.expense_type, val.debt_balance, val.debt_interest_rate), val.type);
    }

    this.ensembleService.updateBucketsContributionTotals();
    this.bucket = this.ensembleService.getBuckets(val.type)[this.ensembleService.getBuckets(val.type).length-1];

    this.mode = "edit_bucket";
    this.modechangenotification.emit("edit_bucket");
  }
}