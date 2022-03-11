import { NgModule } from '@angular/core'
import { PreloadAllModules, RouterModule, Routes } from '@angular/router'
import { AuthGuard } from './auth/auth.guard'
import { NavigateGuard } from './auth/navigate.guard'

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    canLoad: [NavigateGuard],
    loadChildren: () =>
      import('./auth/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'document-choice',
    canLoad: [AuthGuard],
    loadChildren: () =>
      import('./document-choice/document-choice.module').then(
        m => m.DocumentChoicePageModule
      )
  },
  {
    path: 'buchungsbeleg',
    canLoad: [AuthGuard],
    loadChildren: () =>
      import('./documents/buchungsbeleg/buchungsbeleg.module').then(
        m => m.BuchungsbelegPageModule
      )
  },
  {
    path: 'abliefernachweis',
    canLoad: [AuthGuard],
    loadChildren: () =>
      import('./documents/abliefernachweis/abliefernachweis.module').then(
        m => m.AbliefernachweisPageModule
      )
  },
  {
    path: 'reisekosten',
    canLoad: [AuthGuard],

    loadChildren: () =>
      import('./documents/reisekosten/reisekosten.module').then(
        m => m.ReisekostenPageModule
      )
  }
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
