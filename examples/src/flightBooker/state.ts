import { batch, container, derived, GetState } from "spheres/store";
import { DateTime } from "luxon"

export const DATE_FORMAT = "dd.MM.yyyy"

export enum FlightTypes {
  ONE_WAY = "one-way flight",
  RETURN = "return flight"
}

export const startDate = container({
  initialValue: formatDate(DateTime.now())
})

export const startDateIsValid = derived({
  query: (get) => toDateTime(get(startDate)).isValid
})

export const returnDate = container({
  initialValue: formatDate(DateTime.now())
})

export const returnDateIsValid = derived({
  query: (get) => toDateTime(get(returnDate)).isValid
})

export const flightType = container<FlightTypes, string>({
  initialValue: FlightTypes.ONE_WAY
})

export const allowReturnDate = derived({
  query: (get) => {
    return get(flightType) === FlightTypes.RETURN
  }
})

export const bookingAllowed = derived({
  query: (get) => {
    const startDateValue = toDateTime(get(startDate))
    const returnDateValue = toDateTime(get(returnDate))

    if (!startDateValue.isValid || !returnDateValue.isValid) {
      return false
    }

    if (get(flightType) === FlightTypes.ONE_WAY) {
      return true
    }
    
    if (startDateValue <= returnDateValue) {
      return true
    }

    return false
  }
})

export const bookFlight = (get: GetState) => {
  switch (get(flightType)) {
    case FlightTypes.ONE_WAY:
      alert(`You have booked a one-way flight on ${get(startDate)}.`)
      break
    case FlightTypes.RETURN:
      alert(`You have booked a flight on ${get(startDate)} with a return flight on ${get(returnDate)}.`)
      break
  }

  return batch([])
}

function toDateTime(dateString: string): DateTime {
  return DateTime.fromFormat(dateString, DATE_FORMAT)
}

function formatDate(date: DateTime): string {
  return date.toFormat(DATE_FORMAT)
}
