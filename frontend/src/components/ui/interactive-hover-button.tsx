'use client'

/**
 * @author: @emerald-ui
 * @description: Interactive Hover Button Component
 * @version: 1.0.0
 * @date: 2026-01-28
 * @license: MIT
 * @website: https://emerald-ui.com
 */
import React, { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { AnimatePresence, HTMLMotionProps, motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface InteractiveHoverButtonProps extends HTMLMotionProps<'button'> {
  text?: string
  loadingText?: string
  successText?: string
  classes?: string
  variant?: 'default' | 'neon' | 'dark' | 'sparkle'
  icon?: React.ReactNode
}

export default function InteractiveHoverButton({
  text = 'Button',
  loadingText = 'Processing...',
  successText = 'Complete!',
  classes,
  variant = 'default',
  icon,
  ...props
}: InteractiveHoverButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const isIdle = status === 'idle'

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (status !== 'idle') return

    setStatus('loading')
    // Simulate async process (for demo purpose only)
    setTimeout(() => {
      setStatus('success')
      setTimeout(() => {
        setStatus('idle')
      }, 3000) // Reset after success
    }, 2000)

    if (props.onClick) {
      props.onClick(e)
    }
  }

  // Variant-specific styles matching the branding and design layout
  const variantStyles = {
    default: {
      button: 'bg-background border border-white/10 text-foreground',
      dot: 'bg-primary group-hover:scale-[300]',
      hoverText: 'text-primary-foreground',
      defaultIcon: <ArrowRight className="h-4 w-4" />
    },
    neon: {
      button: 'bg-brand-green border-transparent text-black shadow-[0_0_20px_rgba(0,255,0,0.15)] hover:shadow-[0_0_30px_rgba(0,255,0,0.3)]',
      dot: 'bg-black group-hover:scale-[300]',
      hoverText: 'text-brand-green',
      defaultIcon: <ArrowRight className="h-4 w-4 stroke-[3px]" />
    },
    dark: {
      button: 'bg-black border border-white/10 text-white',
      dot: 'bg-white group-hover:scale-[300]',
      hoverText: 'text-black',
      defaultIcon: <ArrowRight className="h-4 w-4" />
    },
    sparkle: {
      button: 'bg-brand-green border-transparent text-black shadow-[0_0_20px_rgba(0,255,0,0.15)] hover:shadow-[0_0_30px_rgba(0,255,0,0.3)]',
      dot: 'bg-black group-hover:scale-[300]',
      hoverText: 'text-brand-green',
      defaultIcon: <ArrowRight className="h-4 w-4" />
    }
  }

  const currentStyles = variantStyles[variant] || variantStyles.default

  return (
    <motion.button
      className={cn(
        'group relative flex min-w-40 items-center justify-center overflow-hidden rounded-full p-2 px-6 font-semibold transition-all duration-300',
        status === 'loading' && 'px-2', // Circle shape when loading
        currentStyles.button,
        classes
      )}
      onClick={handleClick}
      layout
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      {...props}
    >
      <AnimatePresence mode='popLayout' initial={false}>
        <motion.div
          key='idle'
          className='flex items-center gap-2'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {/* Dot that expands on hover to fill background */}
          <div
            className={cn(
              'h-2.5 w-2.5 rounded-full transition-all duration-500',
              currentStyles.dot,
              !isIdle && 'scale-[300]'
            )}
          />
          <span
            className={cn(
              'inline-block transition-all duration-500 group-hover:translate-x-20 group-hover:opacity-0',
              !isIdle && 'translate-x-20 opacity-0'
            )}
          >
            {text}
          </span>
          <div
            className={cn(
              'absolute top-0 left-0 z-10 flex h-full w-full -translate-x-16 items-center justify-center gap-2 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100',
              currentStyles.hoverText,
              !isIdle && 'translate-x-0 opacity-100'
            )}
          >
            {status === 'idle' ? (
              <>
                <span>{text}</span>
                {icon || currentStyles.defaultIcon}
              </>
            ) : status === 'loading' ? (
              <>
                <div className={cn(
                  'h-4 w-4 animate-spin rounded-full border-2',
                  variant === 'default' ? 'border-neutral-800 border-t-white' : 
                  variant === 'neon' || variant === 'sparkle' ? 'border-brand-green border-t-transparent' :
                  'border-white border-t-transparent'
                )} />
                <span className={cn(
                  variant === 'neon' || variant === 'sparkle' ? 'text-brand-green' : 'text-inherit'
                )}>{loadingText}</span>
              </>
            ) : (
              // success
              <>
                <Check className='h-4 w-4' />
                <span className={cn(
                  variant === 'neon' || variant === 'sparkle' ? 'text-brand-green' : 'text-inherit'
                )}>{successText}</span>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.button>
  )
}
