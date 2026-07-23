import { batch, exec, StoreMessage } from "spheres/store";
import { domAction, domEffect, ElementIdentifier, HTMLView } from "spheres/view";

export interface DialogViewOptions {
  onClose: () => StoreMessage
  identifier: ElementIdentifier<HTMLDialogElement>
  content: HTMLView
}

export function openDialog(id: ElementIdentifier<HTMLDialogElement>): StoreMessage {
  return exec(domAction, domEffect((getEl) => getEl(id).showModal()))
}

export function closeDialog(id: ElementIdentifier<HTMLDialogElement>): StoreMessage {
  return exec(domAction, domEffect((getEl) => getEl(id).close()))
}

export function dialogView(options: DialogViewOptions): HTMLView {
  return (root) => {
    root.dialog(({ config, children }) => {
      config
        .class("backdrop:bg-gray-500/50 size-full max-w-none max-h-none bg-transparent outline-none")
        .elementIdentifier(options.identifier)
        .on("click", () => closeDialog(options.identifier))
        .on("close", options.onClose)
      children
        .div(({ config, children }) => {
          config
            .on("click", (evt) => {
              evt.stopPropagation()
              return batch([])
            })
          children
            .subview(options.content)
        })
    })
  }
}
