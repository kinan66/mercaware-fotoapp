import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import {
  AzureKeyCredential,
  FormRecognizerClient
} from '@azure/ai-form-recognizer'
import { environment } from 'src/environments/environment'
import { DocumentManagementService } from '../document-management.service'
import * as _ from 'lodash'

@Component({
  selector: 'app-abliefernachweis',
  templateUrl: './abliefernachweis.page.html',
  styleUrls: ['./abliefernachweis.page.scss']
})
export class AbliefernachweisPage implements OnInit {
  client: any
  abliefernachweisForm: FormGroup
  invalid = false
  templates: any

  constructor (private documentManagementService: DocumentManagementService) {
    this.client = new FormRecognizerClient(
      environment.endpoint,
      new AzureKeyCredential(environment.apiKey)
    )
  }

  ngOnInit () {
    this.documentManagementService
      .getTemplates('abliefernachweis')
      .subscribe(data => {
        this.templates = _.values(data)
      })
    this.abliefernachweisForm = new FormGroup({
      orderNumber: new FormControl(null, { validators: [Validators.required] }),
      barcode: new FormControl(null, { validators: [Validators.required] }),
      address: new FormGroup({
        company: new FormControl(null, { validators: [Validators.required] }),
        street: new FormControl(null, { validators: [Validators.required] }),
        zipCode: new FormControl(null, { validators: [Validators.required] })
      })
    })
  }

  onSubmit () {
    if (!this.abliefernachweisForm.invalid) {
      this.invalid = true
      return
    } else {
    }
  }
}
