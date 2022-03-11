import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, from, of, throwError } from 'rxjs'
import { map, mergeMap, tap } from 'rxjs/operators'
import { ModalController } from '@ionic/angular'
import { ServerSettingsComponent } from './server-settings/server-settings.component'
import { get, remove, set } from '../global-services/storage.service'
import { ServerSettings } from '../models/serverSettings.model'
import { User } from '../models/user.model'
import { Router } from '@angular/router'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  serverSettings = new BehaviorSubject<ServerSettings>(undefined)
  _user = new BehaviorSubject<User>(undefined)

  constructor (
    private http: HttpClient,
    private modalController: ModalController,
    private router: Router
  ) {
    this.checkIfServerSettingsAreSet()
  }

  login (email: string, password: string) {
    let data = {
      usr: email,
      pwd: password
    }
    return this.serverSettings.pipe(
      mergeMap(serverSettings => {
        if (!serverSettings?.domain) return throwError('001')
        if (!serverSettings?.mandant) return throwError('002')
        return this.http.post<any>(
          `https://${serverSettings.domain}/mercaware/${serverSettings.mandant}/schnittstelle/mobil/fotoapp_login.php`,
          { data: data }
        )
      }),
      mergeMap(loginResult => {
        if (!loginResult) return throwError('003')
        return of(data.usr)
      }),
      tap(async userData => {
        const user = new User(userData)
        this._user.next(user)
        await set('user', user)
      })
    )
  }

  autoLogin () {
    console.log('auto Login')
    return from(get('user')).pipe(
      map(userData => {
        if (!userData) {
          return null
        }
        const user = new User(userData.userName)
        return user
      }),
      tap(user => {
        if (user) {
          this._user.next(user)
        }
      }),
      map(user => {
        return !!user
      })
    )
  }

  logout () {
    this._user.next(undefined)
    this.router.navigate(['/login'])
    remove('user')
  }

  checkIfServerSettingsAreSet () {
    // check if domain is set for the app
    get('serverSettings').then(serverSettings => {
      if (!serverSettings) return this.presentModal()
      this.serverSettings.next(serverSettings)
    })
  }
  async loggedIn () {
    const user = await get('user')
    return user
  }

  async presentModal () {
    const modal = await this.modalController.create({
      component: ServerSettingsComponent,
      cssClass: 'my-custom-class'
    })
    return await modal.present()
  }

  get userIsAuthenticated () {
    return this._user
  }
}
