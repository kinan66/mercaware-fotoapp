import { DatePipe } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { FormGroup } from '@angular/forms'
import {
  AzureKeyCredential,
  FormRecognizerClient,
  FormTrainingClient
} from '@azure/ai-form-recognizer'
import * as _ from 'lodash'
import { environment } from 'src/environments/environment'
import { AuthService } from '../auth/auth.service'
import { get, set } from '../global-services/storage.service'
import { ServerSettings } from '../models/serverSettings.model'
import { User } from '../models/user.model'

@Injectable({
  providedIn: 'root'
})
export class DocumentManagementService {
  constructor (private http: HttpClient, private AuthService: AuthService) {
    this.AuthService.userIsAuthenticated.subscribe(user => {
      this.user = user
    })
    this.AuthService.serverSettings.subscribe(serverSettings => {
      this.serverSettings = serverSettings
    })

    this.trainingClient = new FormTrainingClient(
      environment.endpoint,
      new AzureKeyCredential(environment.apiKey)
    )
    this.client = new FormRecognizerClient(
      environment.endpoint,
      new AzureKeyCredential(environment.apiKey)
    )
  }
  client: any
  trainingClient: any
  user: User
  serverSettings: ServerSettings

  getTemplates (docType: string) {
    let data = {
      usr: this.user.userName,
      login_token: true,
      mode: 'S'
    }
    let apiEndpoint
    if (docType == 'buchungsbeleg') apiEndpoint = 'sync_fotoapp_docmmuster.php'
    if (docType == 'abliefernachweis') apiEndpoint = 'sync_fotoapp_atrk.php'
    if (docType == 'reisekosten') apiEndpoint = 'sync_fotoapp_auslagenmust.php'
    if (docType == 'reisekostenTemplate2')
      apiEndpoint = 'sync_fotoapp_reisekopf.php'

    return this.http.post(
      `https://${this.serverSettings.domain}/mercaware/${this.serverSettings.mandant}/schnittstelle/mobil/${apiEndpoint}`,
      { data: data }
    )
  }

  async saveDocument (form: FormGroup, operationType: string) {
    let filename = await get('lastSavedDataName')
    var pipe = new DatePipe('en-US')
    let date = new Date(form.get('documentDate').value)
    const FormattedDate = pipe.transform(date, 'yyyy-MM-dd')
    let amount = form.get('amount').value.replace(/[.,€]/g, '')
    let data = {
      usr: this.user.userName,
      login_token: true,
      dateiname: filename,
      vorgangstyp: operationType,
      laengengrad: 0,
      breitengrad: 0
    }
    let dataToAdd
    if (operationType == 'buchungsbeleg') {
      dataToAdd = {
        betrag: amount,
        belegnr: form.get('documentNumber').value,
        docmmusternr: form.get('documentPatternNumber').value,
        belegdatum: FormattedDate
      }
    }

    if (operationType == 'reisekosten') {
      dataToAdd = {
        betrag: amount,
        belegnr: form.get('documentNumber').value,
        belegdatum: FormattedDate,
        reisekopfnr: form.get('travelCostsNumber').value,
        auslagenmustnr: form.get('BookingPattern').value
      }
    }
    _.assign(data, dataToAdd)
    this.http
      .post(
        `https://${this.serverSettings.domain}/mercaware/${this.serverSettings.mandant}/schnittstelle/mobil/sync_fotoapp_speichern.php`,
        { data: data }
      )
      .subscribe()
  }

  savePhoto (base64, title) {
    let img = base64.replace('data:image/png;base64,', '')
    let data = {
      usr: this.user.userName,
      dateiname: title,
      base64: img
    }
    set('lastSavedDataName', title)
    return this.http.post(
      `https://${this.serverSettings.domain}/mercaware/${this.serverSettings.mandant}/schnittstelle/mobil/sync_fotoapp_speicher_foto.php`,
      { data: data }
    )
  }

  async recognizeInvoices (url) {
    const invoiceUrl = url
    const poller = await this.client.beginRecognizeInvoicesFromUrl(invoiceUrl, {
      onProgress: state => {
        console.log(`status: ${state.status}`)
      }
    })
    console.log('this is poller', poller)
    const [invoice] = await poller.pollUntilDone()
    if (invoice === undefined) {
      throw new Error('Failed to extract data from at least one invoice.')
    }

    // Helper function to print fields.
    function fieldToString (field) {
      const { name, valueType, value, confidence } = field
      return `${name} (${valueType}): '${value}' with confidence ${confidence}'`
    }

    console.log('Invoice fields:')

    for (const [name, field] of Object.entries(invoice.fields)) {
      if (
        (field as any).valueType !== 'array' &&
        (field as any).valueType !== 'object'
      ) {
        console.log(`- ${name} ${fieldToString(field)}`)
      }
    }

    let idx = 0

    console.log('- Items:')

    const items = invoice.fields['Items']?.value
    for (const item of items ?? []) {
      const value = item.value

      const subFields = [
        'Description',
        'Quantity',
        'Unit',
        'UnitPrice',
        'ProductCode',
        'Date',
        'Tax',
        'Amount'
      ]
        .map(fieldName => value[fieldName])
        .filter(field => field !== undefined)

      console.log(
        [
          `  - Item #${idx}`,
          // Now we will convert those fields into strings to display
          ...subFields.map(field => `    - ${fieldToString(field)}`)
        ].join('\n')
      )
    }
    return invoice
  }
}
