import { CommandController } from "../tokenRegistry.js"

export class DefaultCommandController implements CommandController<void> {
  run(): void {
    console.log("No command manager defined for command!")
  }
}
