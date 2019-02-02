import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Stream } from '../../classes/stream';

import { EnsembleService } from '../../services/ensember.service';

@Component({
  selector: 'stream-detail',
  templateUrl: './streamDetail.component.html',
})

export class StreamDetailComponent {
  //The stream of interest and application mode, both are inputted by the parent app component.
  @Input() stream: Stream;
  @Input() mode: String;

    //The event emitter which emits a mode change back to the parent component. This ensures that there is a consistency between components.
  @Output() modechangenotification: EventEmitter<string> = new EventEmitter<string>();

  constructor(private ensembleService: EnsembleService) { }

  //Add the stream to the service based on the values of the form. Set the selected stream to the newly created stream and set the mode to "edit_stream" and emit this new mode
  //back to the parent component.
  onCreate(val){
    this.ensembleService.addNewStream(new Stream(val.label, val.lower_limit, val.upper_limit));

    this.stream = this.ensembleService.getStreams()[this.ensembleService.getStreams().length-1];
    this.mode = "edit_stream";

    this.modechangenotification.emit("edit_stream");
  }
}
