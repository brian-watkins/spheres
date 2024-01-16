export function useValue<T>(handler: (value: string) => T): (evt: Event) => T {
  return (evt) => handler((evt.target as HTMLInputElement).value)
}