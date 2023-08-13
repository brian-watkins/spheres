import { View, view } from "display-party";
import { GetState, store, write } from "state-party";
import { FlightTypes, allowReturnDate, bookFlight, bookingAllowed, flightType, formatDate, returnDate, startDate } from "./state.js";

export function flightBooker(): View {
  return view().main(el => {
    el.config
      .classes([
        "flex",
        "flex-col",
        "gap-2",
        "w-96"
      ])
    el.children
      .withView(flightTypeSelect())
      .withState({
        view: startDateInput
      })
      .withState({
        view: returnDateInput
      })
      .withState({
        view: bookFlightButton
      })
  })
}

function flightTypeSelect(): View {
  return view()
    .select(el => {
      el.config.on({ change: (evt) => write(flightType, (evt as any).target.value) })
      el.children
        .option(el => {
          el.children.text(FlightTypes.ONE_WAY)
        })
        .option(el => {
          el.children.text(FlightTypes.RETURN)
        })
    })
}

function bookFlightButton(get: GetState): View {
  return view()
    .button(el => {
      el.config
        .classes([
          "bg-sky-600",
          "text-slate-100",
          "font-bold",
          "text-xl",
          "px-8",
          "py-4",
          "disabled:bg-slate-400",
          "hover:bg-sky-800"
        ])
        .on({ click: () => store(bookFlight) })
        .disabled(!get(bookingAllowed))
      el.children
        .text("Book Flight!")
    })
}

function startDateInput(get: GetState): View {
  return view()
    .input(el => {
      el.config
        .dataAttribute("start-date")
        .classes(textInputClasses(get(startDate).isValid))
        .value(formatDate(get(startDate)))
        .on({ input: (evt) => write(startDate, (evt as any).target.value) })
    })
}

function returnDateInput(get: GetState): View {
  return view()
    .input(el => {
      el.config
        .dataAttribute("return-date")
        .classes(textInputClasses(get(returnDate).isValid))
        .value(formatDate(get(returnDate)))
        .disabled(!get(allowReturnDate))
        .on({ input: (evt) => write(returnDate, (evt as any).target.value) })
    })
}

function textInputClasses(isValid: boolean): Array<string> {
  let classes = [
    "border-2",
    "border-sky-600",
    "text-slate-600",
    "disabled:border-slate-200",
    "disabled:text-slate-400",
    "p-1",
  ]

  if (!isValid) {
    classes.push("bg-fuchsia-400")
  }

  return classes
}