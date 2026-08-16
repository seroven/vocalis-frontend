import type { InputHTMLAttributes } from 'react'
import { cx } from '../lib/cx'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  busy?: boolean
}

export function TextField({
  label,
  busy = false,
  className,
  ...props
}: TextFieldProps) {
  return (
    <label className={cx('search-field-wrap', busy && 'is-busy', className)}>
      <span className="sr-only">{label}</span>
      <input className="search-field" {...props} />
    </label>
  )
}
