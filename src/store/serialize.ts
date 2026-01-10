import { Container } from "./state/container.js"
import { Meta } from "./state/meta.js"
import { SuppliedState } from "./state/supplied.js"

export type SerializableState = Container<any> | SuppliedState<any>

export type StateManifest = Record<string, SerializableState>

export enum SerializedStateType {
  Value, Meta, Message
}

export interface SerializedValue {
  k: SerializedStateType.Value
  t: string
  v: any
}

export interface SerializedMeta {
  k: SerializedStateType.Meta
  t: string
  v: Meta<any, any>
}

export interface SerializedMessage {
  k: SerializedStateType.Message
  t: string
  v: any
}

export type SerializedState = SerializedValue | SerializedMeta | SerializedMessage

export function serializedValue(key: string, value: any): SerializedValue {
  return {
    k: SerializedStateType.Value,
    t: key,
    v: value
  }
}

export function serializedMessage(key: string, message: any): SerializedMessage {
  return {
    k: SerializedStateType.Message,
    t: key,
    v: message
  }
}

export function serializedMeta(key: string, value: any): SerializedMeta {
  return {
    k: SerializedStateType.Meta,
    t: key,
    v: value
  }
}
