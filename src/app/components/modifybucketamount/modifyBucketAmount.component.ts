import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { Bucket } from '../../classes/bucket';

import { EnsembleService } from '../../services/ensember.service';

@Component({
  selector: 'modify-bucket-amount',
  templateUrl: './modifyBucketAmount.component.html',
})

export class ModifyBucketAmountComponent {
  constructor(private ensembleService: EnsembleService) {}

  @Input() mode:string;

  buckets:Bucket[]
  selectedBucket:Bucket;

  ngOnInit():void{
    this.buckets = this.ensembleService.getBuckets("gross")
                                        .concat(this.ensembleService.getBuckets("taxes")
                                        .concat(this.ensembleService.getBuckets("net")));
  }

  selectBucket(event):void{
    this.selectedBucket = this.ensembleService.getBucketByID(event.target.value);
  }

  modifyBucketTotal(value):void{
    this.ensembleService.modifyBucketTotal(value.bucket, value.transfer_amount, value.add_remove);
  }
}
