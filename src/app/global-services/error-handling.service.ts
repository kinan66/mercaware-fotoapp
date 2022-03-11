import { Injectable } from '@angular/core'
import {
  AlertController,
  LoadingController,
  ToastController
} from '@ionic/angular'

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  constructor (
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  async presentToastWithOptions (message, position) {
    const toast = await this.toastController.create({
      message,
      position,
      duration: 2000,
      color: 'primary'
    })
    await toast.present()
    const { role } = await toast.onDidDismiss()
  }

  public showAlert (header: string, message: string, buttons: string[]) {
    this.alertController
      .create({
        header,
        message,
        buttons
      })
      .then(alertEl => alertEl.present())
  }
  async presentLoading (message, spinner) {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message,
      spinner
    })
    await loading.present()

    const { role, data } = await loading.onDidDismiss()
    console.log('Loading dismissed!')
  }
}
