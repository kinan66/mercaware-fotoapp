import { Injectable } from '@angular/core'
import { CanLoad, Route, Router, UrlSegment, UrlTree } from '@angular/router'
import { from, Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { AuthService } from './auth.service'

@Injectable({
  providedIn: 'root'
})
export class NavigateGuard implements CanLoad {
  constructor (private authService: AuthService, private router: Router) {}
  canLoad (
    route: Route,
    segments: UrlSegment[]
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return from(this.authService.loggedIn()).pipe(
      map(user => {
        console.log(user)
        if (user) {
          return false
        } else {
          return true
        }
      }),
      tap(isAuth => {
        if (isAuth == false) {
          this.router.navigate(['/document-choice'])
        }
      })
    )
  }
}
