import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { EnsembleService } from '../../services/ensember.service';

@Component({
  selector: 'history-view',
  templateUrl: './history.component.html',
})

export class HistoryComponent {
  constructor(private ensembleService: EnsembleService) {}
}