import React from 'react'
import { loadState, saveState } from './storage.js'

const AppStateCtx = React.createContext(null)

export function AppStateProvider({ children }) {
  const [state, setState] = React.useState(() => loadState())

  const api = React.useMemo(() => ({
    state,
    setState: (updater) => {
      setState((prev) => {
        const next = typeof updater === 'function' ? updater(structuredClone(prev)) : updater
        saveState(next)
        return next
      })
    },
    refresh: () => setState(loadState()),
  }), [state])

  return <AppStateCtx.Provider value={api}>{children}</AppStateCtx.Provider>
}

export function useAppState() {
  const ctx = React.useContext(AppStateCtx)
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider')
  return ctx
}
