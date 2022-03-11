import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DocumentChoicePageRoutingModule } from './document-choice-routing.module';

import { DocumentChoicePage } from './document-choice.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DocumentChoicePageRoutingModule
  ],
  declarations: [DocumentChoicePage]
})
export class DocumentChoicePageModule {}
