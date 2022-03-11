import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DocumentChoicePage } from './document-choice.page';

const routes: Routes = [
  {
    path: '',
    component: DocumentChoicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentChoicePageRoutingModule {}
