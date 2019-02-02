import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { Bucket } from '../../classes/bucket';

import { EnsembleService } from '../../services/ensember.service';

@Component({
  selector: 'bucket-transfers',
  templateUrl: './bucketTransfers.component.html',
})

export class BucketTransfersComponent {
  constructor(private ensembleService: EnsembleService) {}

  @Input() mode:string;

  toBuckets:Bucket[];
  fromBuckets:Bucket[];
  toBucket:Bucket;
  fromBucket:Bucket;

  ngOnInit():void{
    this.fromBuckets = this.retrieveAllBuckets();
    this.fromBucket = this.fromBuckets[0];
  }

  updateToBuckets(event):void{
    let id:string = event.target.value;
    this.fromBucket = this.getBucketInfoBasedOnID(this.fromBuckets, id, "item");
    this.toBuckets = this.retrieveAllBuckets();
    let index:number = this.getBucketInfoBasedOnID(this.toBuckets, id, "index");
    this.toBuckets.splice(index,1);
  }

  updateFromBuckets(event):void{
    let id:string = event.target.value;
    this.toBucket = this.getBucketInfoBasedOnID(this.toBuckets, id, "item");
    this.fromBuckets = this.retrieveAllBuckets();
    let index:number = this.getBucketInfoBasedOnID(this.fromBuckets, id, "index");
    this.fromBuckets.splice(index,1);
  }

  getBucketInfoBasedOnID(buckets:Bucket[], id:string, returnVal:string):any{
    let bucket:Bucket;
    for(let index:number = 0; index < buckets.length; index++){
      if(buckets[index].id == id)
        return (returnVal == "item" ? buckets[index] : index);
    }
    return null;
  }

  retrieveAllBuckets():Bucket[]{
    return this.ensembleService.getBuckets("gross")
                                           .filter(function(bucket){return bucket.method == "save"})
                                           .concat(this.ensembleService.getBuckets("taxes")
                                           .filter(function(bucket){return bucket.method == "save"})
                                           .concat(this.ensembleService.getBuckets("net")
                                           .filter(function(bucket){return bucket.method == "save"})));
  }

  transferAmount(val):void{
    this.ensembleService.transferBetweenBuckets(val.from_bucket, val.to_bucket, val.transfer_amount);
  }
}
