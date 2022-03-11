import { Component, OnInit } from '@angular/core'
import { AlertController } from '@ionic/angular'
import { AuthService } from '../auth/auth.service'

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  constructor (
    private alertController: AlertController,
    private AuthService: AuthService
  ) {}

  ngOnInit () {}

  onLogout () {
    this.presentLogoutAlert()
  }
  async presentLogoutAlert () {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Ausloggen',
      message: 'Wollen Sie sich wirklich ausloggen?',
      buttons: [
        {
          text: 'Nein',
          role: 'cancel',
          cssClass: 'secondary',
          handler: blah => {}
        },
        {
          text: 'ja, ausloggen',
          handler: () => {
            this.AuthService.logout()
          }
        }
      ]
    })

    await alert.present()
  }
}
