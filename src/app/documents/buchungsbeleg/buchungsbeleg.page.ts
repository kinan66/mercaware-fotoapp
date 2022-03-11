import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild
} from '@angular/core'
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo
} from '@capacitor/camera'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { IonDatetime, LoadingController } from '@ionic/angular'
import { formatISO } from 'date-fns'
import { ErrorHandlingService } from 'src/app/global-services/error-handling.service'
import {
  FormRecognizerClient,
  FormTrainingClient,
  AzureKeyCredential
} from '@azure/ai-form-recognizer'
import { DocumentManagementService } from '../document-management.service'
import { DatePipe } from '@angular/common'
import * as _ from 'lodash'
import { Router } from '@angular/router'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-buchungsbeleg',
  templateUrl: './buchungsbeleg.page.html',
  styleUrls: ['./buchungsbeleg.page.scss']
})
export class BuchungsbelegPage implements OnInit {
  @Output() imagePick = new EventEmitter<string>()
  step = 0
  image: Photo
  buchungsbelegForm: FormGroup
  dateValue = ''
  invalid = false
  templates: any

  @ViewChild(IonDatetime, { static: true }) datetime: IonDatetime
  url: string =
    'https://fotoapp-testing.cognitiveservices.azure.com/formrecognizer/v2.1/layout/analyze'

  constructor (
    private documentManagementService: DocumentManagementService,
    public loadingController: LoadingController,
    private errorHandlingService: ErrorHandlingService,
    private router: Router
  ) {}

  ngOnInit () {
    this.buchungsbelegForm = new FormGroup({
      documentPatternNumber: new FormControl(null, {
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
      .getTemplates('buchungsbeleg')
      .subscribe(data => {
        console.log(data)
        this.templates = _.values(data)
      })
  }

  parseDate (input, format) {
    format = format // default format
    var parts = input.match(/(\d+)/g),
      i = 0,
      fmt = {}

    if (parts[2].length < 4) {
      parts[2] = 20 + parts[2]
    }

    // extract date-part indexes from the format
    format.replace(/(yyyy|dd|mm)/g, function (part) {
      fmt[part] = i++
    })

    return new Date(parts[fmt['yyyy']], parts[fmt['mm']] - 1, parts[fmt['dd']])
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

    // const documentDate = this.returnValueFromRecognizedText(result, [
    //   'Rechnungsdat.',
    //   'Datum'
    // ])
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
        console.log(this.url)
        this.documentManagementService
          .recognizeInvoices(url)
          .then(data => {
            this.buchungsbelegForm
              .get('documentNumber')
              .patchValue(data.fields.InvoiceId?.value)
            this.buchungsbelegForm
              .get('amount')
              .patchValue(data.fields.InvoiceTotal?.valueData.text)

            let date1 = this.parseDate(
              data.fields.InvoiceDate?.valueData.text,
              'dd.mm.yyyy'
            )

            const formattedDateValue = formatISO(date1)
            this.dateValue = formattedDateValue
            this.buchungsbelegForm
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
    console.log(this.buchungsbelegForm.value)
    if (!this.buchungsbelegForm.valid) {
      this.invalid = true
      return
    } else {
      this.documentManagementService.saveDocument(
        this.buchungsbelegForm,
        'buchungsbeleg'
      )
      this.router.navigate(['/'])

      this.errorHandlingService.presentToastWithOptions(
        'Ihre Daten wurden erfolgreich gespeichert.',
        'top'
      )
    }
  }

  /**
   *
   * A function that used to return a the wanted text according to the array
   * provided to the function, the array contains the text to look for, it finds
   * it's index, and takes the next text on the same line.
   *
   * @param recognizedTextResult
   * @param arrayOfTermsToSearch
   * @returns result of the extracted text, according to the provided array.
   */
  returnValueFromRecognizedText (recognizedTextResult, arrayOfTermsToSearch) {
    const lines = recognizedTextResult.data.lines
    let foundWord, lineIndex, wordIndex, extractedText

    lines.forEach((line, i) => {
      foundWord = arrayOfTermsToSearch.find(term => line.text.includes(term))
      if (!foundWord) return
      lineIndex = i
      wordIndex = lines[lineIndex].words.findIndex(x =>
        x.text.includes(foundWord)
      )
      console.log(lines[lineIndex])
      lines[lineIndex]?.words.forEach((word, i) => {
        if (i < wordIndex) return
        if (!word.text.includes(':')) extractedText = word.text
        if (word.text.includes(':')) {
          if (word.text.length > 0) {
            extractedText = word.text.replace(':', '')
          }
        }
      })
    })

    return extractedText
  }
}
