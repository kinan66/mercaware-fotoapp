import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReisekostenPage } from './reisekosten.page';

const routes: Routes = [
  {
    path: '',
    component: ReisekostenPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReisekostenPageRoutingModule {}
