import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { LoginPageRoutingModule } from './login-routing.module'

import { LoginPage } from './login.page'
import { ServerSettingsComponent } from '../server-settings/server-settings.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [LoginPage, ServerSettingsComponent]
})
export class LoginPageModule {}
