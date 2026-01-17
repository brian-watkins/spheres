import { Container } from "../state/container.js";
import { TokenRegistry } from "../tokenRegistry.js";

export interface RootTokenRegistry extends TokenRegistry {
  onRegister(handler: (container: Container<any>) => void): void
}
