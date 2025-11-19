import * as React from "react"
import {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % 100000
  return count.toString()
}

type Action =
  | {
      type: typeof actionTypes.ADD_TOAST
      toast: ToasterToast | (Omit<ToasterToast, "id"> & { id?: string })
    }
  | {
      type: typeof actionTypes.UPDATE_TOAST
      toast: Partial<ToasterToast>
    }
  | {
      type: typeof actionTypes.DISMISS_TOAST
      toastId?: string
    }
  | {
      type: typeof actionTypes.REMOVE_TOAST
      toastId?: string
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToastingQueue = ({
  toastId,
  duration,
}: {
  toastId: string
  duration: number
}) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, duration)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast as ToasterToast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action
      // ! Side effects ! - This could be executed in a separate effect a la redux-saga
      if (toastId) {
        addToastingQueue({
          toastId,
          duration: 0,
        })
      } else {
        state.toasts.forEach((toast) => {
          addToastingQueue({
            toastId: toast.id,
            duration: 0,
          })
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    default:
      return state
  }
}

const listeners: Array<(state: State) => void> = []

let state: State = {
  toasts: [],
}

function setState(data: State) {
  state = data
  listeners.forEach((listener) => {
    listener(state)
  })
}

export function dispatch(action: Action) {
  setState(reducer(state, action))
}

function useToast() {
  const [activeToasts, setActiveToasts] = React.useState(state)

  React.useEffect(() => {
    listeners.push(setActiveToasts)
    return () => {
      const index = listeners.indexOf(setActiveToasts)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return {
    ...activeToasts,
    toast: React.useCallback((props: Omit<ToasterToast, "id">) => {
      const id = genId()
      const update = (props: ToasterToast) =>
        dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } })
      const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })
      
      const duration = props.duration || TOAST_REMOVE_DELAY;
      
      addToastingQueue({ toastId: id, duration });
      

      dispatch({
        type: "ADD_TOAST",
        toast: {
          ...props,
          id,
          open: true,
          onOpenChange: (open) => {
            if (!open) {
              dismiss()
            }
          },
        },
      })

      return {
        id: id,
        dismiss,
        update,
      }
    }, []),
    dismiss: React.useCallback((toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }), []),
  }
}

export { useToast }