import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string
    onValueChange?: (value: string) => void
  }
>(({ className, value, onValueChange, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const selectRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div
      ref={selectRef}
      className={cn("relative", className)}
      {...props}
    >
      {React.Children.map(props.children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            isOpen,
            setIsOpen,
            value,
            onValueChange
          })
        }
        return child
      })}
    </div>
  )
})
Select.displayName = "Select"

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isOpen?: boolean
    setIsOpen?: (open: boolean) => void
  }
>(({ className, isOpen, setIsOpen, children, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "flex h-9 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-1 text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    onClick={() => setIsOpen?.(!isOpen)}
    {...props}
  >
    <span className="flex items-center gap-2">
      {children}
    </span>
    <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
  </button>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    placeholder?: string
    value?: string
  }
>(({ className, placeholder, value, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(value ? "" : "text-muted-foreground", className)}
    {...props}
  >
    {value || placeholder}
  </span>
))
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isOpen?: boolean
    value?: string
    onValueChange?: (value: string) => void
    setIsOpen?: (open: boolean) => void
  }
>(({ className, isOpen, value, onValueChange, setIsOpen, children, ...props }, ref) => {
  if (!isOpen) return null

  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-white p-1 shadow-lg",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            onValueChange,
            setIsOpen
          })
        }
        return child
      })}
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value: string
    onValueChange?: (value: string) => void
    setIsOpen?: (open: boolean) => void
  }
>(({ className, value, onValueChange, setIsOpen, children, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 transition-colors",
      className
    )}
    onClick={() => {
      onValueChange?.(value)
      setIsOpen?.(false)
    }}
    {...props}
  >
    {children}
  </button>
))
SelectItem.displayName = "SelectItem"

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}
