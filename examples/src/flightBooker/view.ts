import { use, write } from "spheres/store";
import { FlightTypes, allowReturnDate, bookFlight, bookingAllowed, flightType, returnDate, returnDateIsValid, startDate, startDateIsValid } from "./state.js";
import { names, useValue } from "../helpers/helpers.js";
import { htmlTemplate } from "spheres/view";

export const flightBooker = htmlTemplate(() => root =>
  root.main(el => {
    el.config
      .class(names([
        "flex",
        "flex-col",
        "gap-2",
        "w-96"
      ]))
    el.children
      .zone(flightTypeSelect())
      .zone(startDateInput())
      .zone(returnDateInput())
      .zone(bookFlightButton())
  }))

const flightTypeSelect = htmlTemplate(() => root => {
  root.select(el => {
    el.config.on("change", useValue((value) => write(flightType, value)))
    el.children
      .option(el => {
        el.children.textNode(FlightTypes.ONE_WAY)
      })
      .option(el => {
        el.children.textNode(FlightTypes.RETURN)
      })
  })
})

const bookFlightButton = htmlTemplate(() => root => {
  root.button(el => {
    el.config
      .class(names([
        "bg-sky-600",
        "text-slate-100",
        "font-bold",
        "text-xl",
        "px-8",
        "py-4",
        "disabled:bg-slate-400",
        "hover:bg-sky-800"
      ]))
      .on("click", () => use(bookFlight))
      .disabled((get) => !get(bookingAllowed))
    el.children
      .textNode("Book Flight!")
  })
})


const startDateInput = htmlTemplate(() => root => {
  root.input(el => {
    el.config
      .dataAttribute("start-date")
      .class((get) => textInputClasses(get(startDateIsValid)))
      .value((get) => get(startDate))
      .on("input", useValue((value) => write(startDate, value)))
  })
})

const returnDateInput = htmlTemplate(() => root => {
  root.input(el => {
    el.config
      .dataAttribute("return-date")
      .class((get) => textInputClasses(get(returnDateIsValid)))
      .value((get) => get(returnDate))
      .disabled((get) => !get(allowReturnDate))
      .on("input", useValue((value) => write(returnDate, value)))
  })
})


function textInputClasses(isValid: boolean): string {
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

  return classes.join(" ")
}