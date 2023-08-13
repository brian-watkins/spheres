import { batch, container, selection, value } from "state-party";
import { DateTime } from "luxon"

export const DATE_FORMAT = "dd.MM.yyyy"

export enum FlightTypes {
  ONE_WAY = "one-way flight",
  RETURN = "return flight"
}

export const startDate = container<DateTime, string>({
  initialValue: DateTime.now(),
  reducer: (value) => DateTime.fromFormat(value, DATE_FORMAT)
})

export const returnDate = container<DateTime, string>({
  initialValue: DateTime.now(),
  reducer: (value) => DateTime.fromFormat(value, DATE_FORMAT)
})

export const flightType = container({
  initialValue: FlightTypes.ONE_WAY
})

export const allowReturnDate = value({
  query: (get) => {
    return get(flightType) === FlightTypes.RETURN
  }
})

export const bookingAllowed = value({
  query: (get) => {
    const startDateValue = get(startDate)
    const returnDateValue = get(returnDate)

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

export const bookFlight = selection((get) => {
  switch (get(flightType)) {
    case FlightTypes.ONE_WAY:
      alert(`You have booked a one-way flight on ${formatDate(get(startDate))}.`)
      break
    case FlightTypes.RETURN:
      alert(`You have booked a flight on ${formatDate(get(startDate))} with a return flight on ${formatDate(get(returnDate))}.`)
      break
  }

  return batch([])
})

export function formatDate(date: DateTime): string {
  return date.toFormat(DATE_FORMAT)
}
