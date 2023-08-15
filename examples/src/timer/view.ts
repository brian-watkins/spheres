import { View, view } from "display-party";
import { GetState, write } from "state-party";
import { duration, elapsedTime, percentComplete } from "./state.js";

export function timer(): View {
  return view().section(el => {
    el.config
      .classes([
        "flex",
        "flex-col",
        "gap-2",
        "w-96"
      ])
    el.children
      .label(el => {
        el.config.classes([
          "font-bold",
          "text-slate-800"
        ])
        el.children
          .text("Elapsed Time")
          .withState({
            view: progressMeterView
          })
      })
      .withState({
        view: elapsedTimeView
      })
      .label(el => {
        el.config.classes([
          "mt-4",
          "font-bold",
          "text-slate-800"
        ])
        el.children
          .text("Duration")
          .input(el => {
            el.config
              .classes([
                "block",
                "w-full",
                "mt-2"
              ])
              .type("range")
              .dataAttribute("duration")
              .max("15")
              .step("1")
              .value("0")
              .on({ input: (evt) => write(duration, Number((evt as any).target.value)) })
          })
      })
      .button(el => {
        el.config
          .dataAttribute("reset-button")
          .classes([
            "mt-4",
            "bg-sky-600",
            "text-slate-100",
            "font-bold",
            "text-xl",
            "px-8",
            "py-4",
            "disabled:bg-slate-400",
            "hover:bg-sky-800"
          ])
          .on({ click: () => write(elapsedTime, 0) })
        el.children
          .text("Reset")
      })
  })
}

function elapsedTimeView(get: GetState): View {
  return view()
    .div(el => {
      el.config
        .dataAttribute("elapsed-time")
        .classes([
          "text-slate-800",
          "text-right"
        ])
      el.children
        .text(formatTime(get(elapsedTime)))
    })
}

function progressMeterView(get: GetState): View {
  return view()
    .progress(el => {
      el.config
        .classes([
          "mt-2",
          "w-full",
          "[&::-webkit-progress-bar]:rounded-lg",
          "[&::-webkit-progress-value]:rounded-lg",
          "[&::-webkit-progress-bar]:bg-slate-300",
          "[&::-webkit-progress-value]:bg-violet-400",
          "[&::-moz-progress-bar]:bg-violet-400"
        ])
        .value(get(percentComplete))
    })
}

function formatTime(millis: number): string {
  const timeInTenthsOfSecond = (millis / 1000).toFixed(1)
  return `${timeInTenthsOfSecond}s`
}