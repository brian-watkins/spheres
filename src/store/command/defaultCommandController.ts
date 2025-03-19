import { CommandController } from "../tokenRegistry.js"

export class DefaultCommandController implements CommandController<void> {
  run(): void {
    throw new Error("Attempt to exec an unknown command! Use useCommand to register a command manager.")
  }
}
