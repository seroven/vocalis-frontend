import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cx } from '../lib/cx'

type ButtonVariant = 'primary' | 'icon' | 'ghost'

type ButtonBaseProps = {
  variant?: ButtonVariant
  selected?: boolean
  children: ReactNode
  className?: string
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'cta pressable btn-primary inline-flex items-center justify-center rounded-full bg-accent px-6 py-2.5 font-semibold disabled:cursor-wait disabled:opacity-70 disabled:hover:scale-100',
  icon: 'icon-btn grid h-10 w-10 place-items-center rounded-full',
  ghost:
    'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-stage-muted hover:text-stage-fg',
}

function classes(variant: ButtonVariant, selected: boolean, className?: string) {
  return cx(
    variants[variant],
    variant === 'ghost' && selected && 'bg-accent-soft font-semibold text-accent',
    className,
  )
}

type ButtonProps = ButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  variant = 'primary',
  selected = false,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classes(variant, selected, className)}
      {...props}
    />
  )
}

type ButtonLinkProps = ButtonBaseProps & Omit<LinkProps, 'className'>

export function ButtonLink({
  variant = 'primary',
  selected = false,
  className,
  ...props
}: ButtonLinkProps) {
  return <Link className={classes(variant, selected, className)} {...props} />
}
