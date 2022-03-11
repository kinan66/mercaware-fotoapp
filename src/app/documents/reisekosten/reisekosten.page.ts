import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import {
  AzureKeyCredential,
  FormRecognizerClient
} from '@azure/ai-form-recognizer'
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo
} from '@capacitor/camera'
import { environment } from 'src/environments/environment'
import { DocumentManagementService } from '../document-management.service'
import * as _ from 'lodash'
import { HelpersService } from '../helpers.service'
import { ErrorHandlingService } from 'src/app/global-services/error-handling.service'
import { DatePipe } from '@angular/common'
import { LoadingController } from '@ionic/angular'
import { formatISO } from 'date-fns'
import { Router } from '@angular/router'

@Component({
  selector: 'app-reisekosten',
  templateUrl: './reisekosten.page.html',
  styleUrls: ['./reisekosten.page.scss']
})
export class ReisekostenPage implements OnInit {
  @Output() imagePick = new EventEmitter<string>()

  client: any
  image: Photo
  step = 0
  reisekostenForm: FormGroup
  dateValue = ''
  invalid = false
  templatesAuslagenmustnr: any
  templatesReisekopf: any

  constructor (
    private documentManagementService: DocumentManagementService,
    public loadingController: LoadingController,
    private HelpersService: HelpersService,
    private errorHandlingService: ErrorHandlingService,
    private router: Router
  ) {
    this.client = new FormRecognizerClient(
      environment.endpoint,
      new AzureKeyCredential(environment.apiKey)
    )
  }

  ngOnInit () {
    this.reisekostenForm = new FormGroup({
      travelCostsNumber: new FormControl(null, {
        validators: [Validators.required]
      }),
      BookingPattern: new FormControl(null, {
        validators: [Validators.required]
      }),
      documentDate: new FormControl(this.dateValue, {
        validators: [Validators.required]
      }),
      documentNumber: new FormControl(null, {
        validators: [Validators.required]
      }),
      amount: new FormControl(null, {
        validators: [Validators.required]
      })
    })
    this.documentManagementService
      .getTemplates('reisekosten')
      .subscribe(data => {
        this.templatesAuslagenmustnr = _.values(data)
      })
    this.documentManagementService
      .getTemplates('reisekostenTemplate2')
      .subscribe(data => {
        this.templatesReisekopf = _.values(data)
      })
  }

  async captureImage () {
    let options = {
      resultType: CameraResultType.DataUrl,
      quality: 50,
      correctOrientation: true,
      allowEditing: false,
      height: 1200,
      source: CameraSource.Camera
    }

    this.image = await Camera.getPhoto(options)
  }

  async onSavePhoto () {
    this.errorHandlingService.presentLoading(
      'Ihr Dokument wird gerade analysiert...',
      'dots'
    )
    var pipe = new DatePipe('en-US')
    var date = Date.now()
    const FormattedDate = pipe.transform(date, 'yyyy-M-d-hh-mm-ss-SS')
    const title = FormattedDate + '.' + this.image.format
    this.imagePick.emit(this.image.dataUrl)
    this.documentManagementService
      .savePhoto(this.image.dataUrl, title)
      .subscribe(filenameFromServer => {
        let url = `https://photo2process.mercaware.de/mercaware/mx001/schnittstelle/mobil/images/${filenameFromServer}`
        this.documentManagementService
          .recognizeInvoices(url)
          .then(data => {
            this.reisekostenForm
              .get('documentNumber')
              .patchValue(data.fields.InvoiceId?.value)
            this.reisekostenForm
              .get('amount')
              .patchValue(data.fields.InvoiceTotal?.valueData.text)

            let date1 = this.HelpersService.parseDate(
              data.fields.InvoiceDate?.valueData.text,
              'dd.mm.yyyy'
            )

            const formattedDateValue = formatISO(date1)
            this.dateValue = formattedDateValue
            this.reisekostenForm
              .get('documentDate')
              .patchValue(formattedDateValue)
            this.loadingController.dismiss()
            this.step = 1
          })
          .catch(err => {
            console.error('The sample encountered an error:', err)
            this.loadingController.dismiss()
          })
      })
  }

  async saveDocument () {
    console.log(this.reisekostenForm.value)
    if (!this.reisekostenForm.valid) {
      this.invalid = true
      return
    } else {
      this.documentManagementService.saveDocument(
        this.reisekostenForm,
        'reisekosten'
      )
      this.router.navigate(['/'])

      this.errorHandlingService.presentToastWithOptions(
        'Ihre Daten wurden erfolgreich gespeichert.',
        'top'
      )
    }
  }
}
