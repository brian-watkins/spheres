import { View, view } from "display-party";
import { write } from "state-party";
import { duration, elapsedTime, percentComplete } from "./state.js";
import { names, useValue } from "../helpers/helpers.js";

export function timer(): View {
  return view().section(el => {
    el.config
      .class(names([
        "flex",
        "flex-col",
        "gap-2",
        "w-96"
      ]))
    el.children
      .label(el => {
        el.config.class(names([
          "font-bold",
          "text-slate-800"
        ]))
        el.children
          .text("Elapsed Time")
          .view(progressMeter)
      })
      .view(elapsedTimeLabel)
      .label(el => {
        el.config.class(names([
          "mt-4",
          "font-bold",
          "text-slate-800"
        ]))
        el.children
          .text("Duration")
          .input(el => {
            el.config
              .class(names([
                "block",
                "w-full",
                "mt-2"
              ]))
              .type("range")
              .dataAttribute("duration")
              .max("15")
              .step("1")
              .value("0")
              .on("input", useValue((value) => write(duration, Number(value))))
          })
      })
      .button(el => {
        el.config
          .dataAttribute("reset-button")
          .class(names([
            "mt-4",
            "bg-sky-600",
            "text-slate-100",
            "font-bold",
            "text-xl",
            "px-8",
            "py-4",
            "disabled:bg-slate-400",
            "hover:bg-sky-800"
          ]))
          .on("click", () => write(elapsedTime, 0))
        el.children
          .text("Reset")
      })
  })
}

function elapsedTimeLabel(): View {
  return view()
    .div(el => {
      el.config
        .dataAttribute("elapsed-time")
        .class(names([
          "text-slate-800",
          "text-right"
        ]))
      el.children
        .text((get) => formatTime(get(elapsedTime)))
    })
}

function progressMeter(): View {
  return view()
    .progress(el => {
      el.config
        .class(names([
          "mt-2",
          "w-full",
          "[&::-webkit-progress-bar]:rounded-lg",
          "[&::-webkit-progress-value]:rounded-lg",
          "[&::-webkit-progress-bar]:bg-slate-300",
          "[&::-webkit-progress-value]:bg-violet-400",
          "[&::-moz-progress-bar]:bg-violet-400"
        ]))
        .value((get) => get(percentComplete))
    })
}

function formatTime(millis: number): string {
  const timeInTenthsOfSecond = (millis / 1000).toFixed(1)
  return `${timeInTenthsOfSecond}s`
}