import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { ReisekostenPageRoutingModule } from './reisekosten-routing.module'

import { ReisekostenPage } from './reisekosten.page'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReisekostenPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [ReisekostenPage]
})
export class ReisekostenPageModule {}
