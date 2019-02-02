import { Component, OnInit, Input } from '@angular/core';

import { Stream } from '../../classes/stream';
import { Bucket } from '../../classes/bucket';

import { EnsembleService, Info } from '../../services/ensember.service';

@Component({
  selector: 'overview',
  templateUrl: './overview.component.html',
})

export class OverviewComponent implements OnInit {
  grossBuckets: Bucket[];     //The first buckets which the streams are distributed into.
  taxBuckets: Bucket[];       //Tax buckets are a percentage from the leftover of the gross buckets.
  netBuckets: Bucket[];       //After the tax buckets distributions take place. These buckets are distributed into.
  streams: Stream[];          //The income streams.
  generalInfo: Info;          //General information object for sharing statistical information with the component's view.

  selectedStream: Stream;     //The selected stream for modifying.
  selectedBucket: Bucket;     //The selected bucket for modifying.
  mode: string;               //The current mode of operation for the application (e.g., "create_stream", "edit_stream", "create_bucket", "edit_bucket")
                              //This value dictates which component view to show below the overview.

  //Inject the EnsembleService singleton instance into this component.
  constructor(private ensembleService: EnsembleService) {}

  //On the initial phase of the component lifecycle, attach values from the above service to data within this component.
  ngOnInit(): void {
    this.streams = this.ensembleService.getStreams();
    this.grossBuckets = this.ensembleService.getBuckets("gross");
    this.taxBuckets = this.ensembleService.getBuckets("taxes");
    this.netBuckets = this.ensembleService.getBuckets("net");
    this.generalInfo = this.ensembleService.getGeneralInfo();

    this.ensembleService.updateBucketsContributionTotals();
  }

  //Set the mode to "create_stream" to show the streamDetail component's view and scroll to the form's view.
  createNewStream():void{
    this.mode = "create_stream";
    setTimeout(function(){document.getElementById("add_new_stream_form").scrollIntoView(true)}, 0);
  }

  //Set the mode to "edit_stream" to show the streamDetail component's view, set the selectedStream value to the argument of the functioon and scroll to the form's view.
  //This is defined by the template of this component.
  viewStreamDetails(stream:Stream):void{
    this.mode = "edit_stream";
    this.selectedStream = stream;
    setTimeout(function(){document.getElementById("edit_stream").scrollIntoView(true)}, 0);
  }

  //Set the mode to "create_bucket" to show the bucketDetail component's view and scroll to the form's view.
  createNewBucket():void{
    this.mode = "create_bucket";
    setTimeout(function(){document.getElementById("add_new_bucket_form").scrollIntoView(true)}, 0);
  }

  //Set the mode to "edit_bucket" to show the bucketDetail component's view (more specifically the form), set the selectedBucket value to the argument of the functioon and scroll to the form's view.
  //This is defined by the template of this component.
  viewBucketDetails(bucket:Bucket):void{
    this.mode = "edit_bucket";
    this.selectedBucket = bucket;
    setTimeout(function(){document.getElementById("edit_bucket").scrollIntoView(true)}, 0);
  }

  //Show the component for transferring amounts between buckets.
  bucketTransfers():void{
    this.mode = "bucket_transfers";
    setTimeout(function(){document.getElementById("bucket_transfers").scrollIntoView(true)}, 0);
  }

  //Show the component for adding/removing a specific amount from a bucket.
  modifyBucketAmount():void{
    this.mode = "modify_bucket_amount";
    setTimeout(function(){document.getElementById("modiy_bucket_amount").scrollIntoView(true)}, 0);
  }

  //This sets the current mode of the application based on any action in a child component.
  //Such as, after creating a stream, the mode will change to "edit_stream", with selectedStream being the newly created stream.
  onModeChange(mode:string):void{
    this.mode = mode;
  }

  //This is for moving buckets in their priority order.
  moveBucket(index:number, direction:number, type:string):void{
    this.ensembleService.moveBucket(index, direction, type);
  }

  //Compute streams/buckets information for one month.
  progress(months:number){
    if(months > 0){
      this.ensembleService.updateEnsembleInformation(months);
    }
  }
}