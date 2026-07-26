import { computePosition, flip, offset, shift, arrow, autoUpdate, Placement } from "@floating-ui/dom";
import { command } from "spheres/store"
import { DomCommandActions, DomCommandManager, ElementIdentifier } from "spheres/view";

export interface PopoverMessage {
  reference: ElementIdentifier<HTMLElement>
  popover: ElementIdentifier<HTMLElement>
  arrow: ElementIdentifier<HTMLElement>
  boundary: ElementIdentifier<HTMLElement>
}

export const showPopover = command<PopoverMessage>()

export class PopoverController implements DomCommandManager<PopoverMessage> {
  private stopTracking: (() => void) | undefined

  exec(message: PopoverMessage, actions: DomCommandActions): void {
    this.stopTracking?.()

    const reference = actions.getElement(message.reference)
    const popover = actions.getElement(message.popover)
    const arrowElement = actions.getElement(message.arrow)
    const boundary = actions.getElement(message.boundary)

    if (!popover.matches(":popover-open")) {
      popover.showPopover()
    }

    let currentPlacement: Placement = "right"

    function updatePosition() {
      computePosition(reference, popover, {
        placement: currentPlacement,
        strategy: "fixed",
        middleware: [
          offset(14),
          flip({ boundary, fallbackStrategy: "initialPlacement" }),
          shift({ boundary, padding: 6 }),
          arrow({ element: arrowElement })
        ]
      }).then(({ x, y, placement, middlewareData }) => {
        currentPlacement = placement

        Object.assign(popover.style, {
          left: `${x}px`,
          top: `${y}px`
        })

        const arrowPosition = middlewareData.arrow;
        const arrowX = arrowPosition?.x
        const arrowY = arrowPosition?.y

        const staticSide = {
          top: 'bottom',
          right: 'left',
          bottom: 'top',
          left: 'right',
        }[placement.split('-')[0]]!;

        Object.assign(arrowElement.style, {
          left: arrowX != null ? `${arrowX}px` : '',
          top: arrowY != null ? `${arrowY}px` : '',
          right: '',
          bottom: '',
          [staticSide]: '-6px',
        });
      })
    }

    const stopTracking = autoUpdate(reference, popover, updatePosition)
    this.stopTracking = stopTracking

    popover.addEventListener("toggle", (evt) => {
      if ((evt as ToggleEvent).newState === "closed") {
        stopTracking()
      }
    }, { once: true })
  }
}