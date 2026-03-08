import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
  } catch {
    console.error('Failed to expose electron API')
  }
} else {
  // @ts-expect-error -- fallback for non-isolated contexts
  window.electron = electronAPI
}
