import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { BuchungsbelegPageRoutingModule } from './buchungsbeleg-routing.module'

import { BuchungsbelegPage } from './buchungsbeleg.page'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BuchungsbelegPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [BuchungsbelegPage]
})
export class BuchungsbelegPageModule {}
