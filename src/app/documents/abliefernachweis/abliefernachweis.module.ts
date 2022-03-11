import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { AbliefernachweisPageRoutingModule } from './abliefernachweis-routing.module'

import { AbliefernachweisPage } from './abliefernachweis.page'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AbliefernachweisPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [AbliefernachweisPage]
})
export class AbliefernachweisPageModule {}
