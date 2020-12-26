import { CustomTypes } from '@shware/slate'

declare module 'slate' {
  interface CustomTypes {
    Text: {
      placeholder: string
    }
    Range: {
      placeholder?: string
    }
  }
}
