import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ModalController } from '@ionic/angular'
import { ErrorHandlingService } from 'src/app/global-services/error-handling.service'

import { get, set } from 'src/app/global-services/storage.service'
import { AuthService } from '../auth.service'

@Component({
  selector: 'app-server-settings',
  templateUrl: './server-settings.component.html',
  styleUrls: ['./server-settings.component.scss']
})
export class ServerSettingsComponent implements OnInit {
  serverDataForm: FormGroup
  submitted = false

  constructor (
    private errorHandlingService: ErrorHandlingService,
    private modalController: ModalController,
    private authService: AuthService
  ) {}

  ngOnInit () {
    get('serverSettings').then(serverSettings => {
      this.serverDataForm.controls['domain'].setValue(serverSettings.domain)
      this.serverDataForm.controls['mandant'].setValue(serverSettings.mandant)
    })

    this.serverDataForm = new FormGroup({
      domain: new FormControl('', { validators: [Validators.required] }),
      mandant: new FormControl('', { validators: [Validators.required] })
    })
  }

  async onSubmit () {
    this.submitted = true
    if (!this.serverDataForm.valid) {
      this.errorHandlingService.presentToastWithOptions(
        'Bitte füllen Sie alle erforderlichen Felder aus.',
        'bottom'
      )
      return
    } else {
      const domain = this.serverDataForm.value.domain
      const mandant = this.serverDataForm.value.mandant
      const serverSettings = { domain, mandant }
      await set('serverSettings', serverSettings)
      this.modalController.dismiss()
      this.authService.serverSettings.next(serverSettings)
    }
  }
  onBack () {
    this.modalController.dismiss()
  }

  get domain () {
    return this.serverDataForm.get('domain')
  }
  get mandant () {
    return this.serverDataForm.get('mandant')
  }
}
