import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { RouterModule }   from '@angular/router';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { AppComponent }  from './components/app.component';
import { OverviewComponent } from './components/overview/overview.component';
import { HistoryComponent } from './components/history/history.component';
import { StreamDetailComponent }  from './components/streamdetail/streamDetail.component';
import { BucketDetailComponent }  from './components/bucketdetail/bucketDetail.component';
import { BucketTransfersComponent }  from './components/buckettransfers/bucketTransfers.component';
import { ModifyBucketAmountComponent }  from './components/modifybucketamount/modifyBucketAmount.component';

import { EnforceBounds } from './directives/enforceBounds.directive';
import { NumberMax } from './directives/numberMax.directive';

import { EnsembleService } from './services/ensember.service';

import { AppRoutingModule }     from './app-routing.module';

@NgModule({
  imports:      [ BrowserModule,
                  FormsModule,
                  AppRoutingModule ],
  declarations: [ AppComponent,
                  OverviewComponent,
                  HistoryComponent,
                  StreamDetailComponent,
                  BucketDetailComponent,
                  BucketTransfersComponent,
                  ModifyBucketAmountComponent,
                  EnforceBounds,
                  NumberMax ],
  bootstrap:    [ AppComponent ],
  providers:     [ EnsembleService, {provide: LocationStrategy, useClass: HashLocationStrategy} ]
})

export class AppModule { }
