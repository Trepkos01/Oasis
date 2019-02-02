import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './components/app.component';
import { OverviewComponent }   from './components/overview/overview.component';
import { HistoryComponent }      from './components/history/history.component';

const routes: Routes = [
  { path: '', component: OverviewComponent },
  { path: 'overview',  component: OverviewComponent },
  { path: 'history', component: HistoryComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
