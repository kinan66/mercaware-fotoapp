import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { LoadingController, ModalController } from '@ionic/angular'
import { ErrorHandlingService } from 'src/app/global-services/error-handling.service'
import { get } from 'src/app/global-services/storage.service'
import { AuthService } from '../auth.service'
import { ServerSettingsComponent } from '../server-settings/server-settings.component'

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
  loginForm: FormGroup

  constructor (
    public modalController: ModalController,
    private loadingController: LoadingController,
    private authService: AuthService,
    private errorHandlingService: ErrorHandlingService,
    private router: Router
  ) {}

  ngOnInit () {
    this.loginForm = new FormGroup({
      email: new FormControl('', {
        validators: [Validators.required]
      }),
      password: new FormControl('', { validators: [Validators.required] })
    })
  }

  OnLogin () {
    if (!this.loginForm.valid) {
      this.errorHandlingService.presentToastWithOptions(
        'Bitte füllen Sie alle erforderlichen Felder aus.',
        'bottom'
      )
      return
    }
    const email = this.loginForm.value.email
    const password = this.loginForm.value.password
    this.loadingController
      .create({ keyboardClose: true, message: 'Logging in ...' })
      .then(loadingEl => {
        loadingEl.present()
        this.authService.login(email, password).subscribe(
          () => {
            loadingEl.dismiss()
            this.router.navigate(['/document-choice'])
          },
          error => {
            const title = 'Authentifizierung fehlgeschlagen'
            const buttons = ['okay']
            let message = error.message
            message = this.showCorrespondingError(error)

            this.errorHandlingService.showAlert(title, message, buttons)
            loadingEl.dismiss()
          }
        )
      })
  }

  showCorrespondingError (errorCode: string) {
    if (errorCode == '001') return 'Kein Domain eingegeben.'
    if (errorCode == '002') return 'Kein Mandant eingegeben.'
    if (errorCode == '003') return 'Username oder Passwort ist falsch.'
  }

  onSettings () {
    this.authService.presentModal()
  }
}
