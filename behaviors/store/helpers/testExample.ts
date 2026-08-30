import { effect, Example, example } from "best-behavior";

export function test(description: string, body: () => void): Example {
  return example()
    .script({
      observe: [
        effect(description, body)
      ]
    })
}
