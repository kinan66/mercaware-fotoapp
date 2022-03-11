import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class HelpersService {
  constructor () {}

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
}
