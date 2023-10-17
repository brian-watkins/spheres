import { Container, batch, container, rule, value, write } from "@spheres/store";

export interface DataRecord {
  id?: number
  firstName: string
  lastName: string
}

export interface CreateRecordMessage {
  type: "create"
  record: DataRecord
}

export function createRecord(record: DataRecord): CreateRecordMessage {
  return {
    type: "create",
    record
  }
}

export interface UpdateRecordMessage {
  type: "update"
  record: DataRecord
}

function updateRecord(record: DataRecord): UpdateRecordMessage {
  return {
    type: "update",
    record
  }
}

interface DeleteRecordMessage {
  type: "delete"
  id: number
}

function deleteRecord(id: number): DeleteRecordMessage {
  return {
    type: "delete",
    id
  }
}

export type DataMessage = CreateRecordMessage | UpdateRecordMessage | DeleteRecordMessage

let idSequence = 0

export const records: Container<Array<DataRecord>, DataMessage> = container({
  initialValue: new Array<DataRecord>(),
  reducer: (message, current) => {
    switch (message.type) {
      case "create":
        return [...current, { id: idSequence++, ...message.record }]
      case "update":
        return current.map(r => r.id === message.record.id ? message.record : r)
      case "delete":
        return current.filter(r => r.id !== message.id)
    }
  }
})

export const selectedRecord = container({
  initialValue: -1
})

export const updateSelected = rule((get, record: DataRecord) => {
  const selectedIndex = get(selectedRecord)

  if (selectedIndex == -1) {
    return batch([])
  }

  return write(records, updateRecord({ id: selectedIndex, ...record }))
})

export const deleteSelected = rule(get => {
  const selectedIndex = get(selectedRecord)

  if (selectedIndex === -1) {
    return batch([])
  }

  return write(records, deleteRecord(selectedIndex))
})

export const filterPrefix = container({
  initialValue: ""
})

export const filteredRecords = value({
  query: (get) => {
    const prefix = get(filterPrefix)

    const data = get(records)
    if (prefix.length === 0) {
      return data
    } else {
      return data.filter(r => r.lastName.toLowerCase().startsWith(prefix.toLowerCase()))
    }
  }
})