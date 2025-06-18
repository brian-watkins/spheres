export interface SSRParts {
  html: string
  serializedStore?: string
}

export interface StoreData {
  storeId: string
  token: string
  data: any
}

export interface StreamingSSRParts {
  initialHTML: string
  serializedStore?: string
  streamingData: SimpleQueue<string>
}

export class SimpleQueue<T> {
  private listeners: Array<(item: T | undefined) => void> = []

  addListener(listener: (item: T | undefined) => void) {
    this.listeners.push(listener)
  }

  push(data: T) {
    this.listeners.forEach(notify => {
      notify(data)
    })
  }

  end() {
    this.listeners.forEach(notify => {
      notify(undefined)
    })
  }
}