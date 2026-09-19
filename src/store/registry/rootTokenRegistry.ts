import { Container } from "../state/container.js";
import { StateBatch, TokenRegistry } from "../tokenRegistry.js";

export interface RootTokenRegistry extends TokenRegistry {
  onRegister(handler: (container: Container<any>, batch: StateBatch | undefined) => void): void
}
