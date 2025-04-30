'use client'

import Image, { ImageProps } from 'next/image'
import React, { useEffect, useState } from 'react'
import { Globe } from 'lucide-react'

interface FaviconImageProps extends ImageProps {
  onErrorIcon?: React.ReactNode
}

export default function FaviconImage({ onErrorIcon, ...props }: FaviconImageProps) {
  const [loadError, setLoadError] = useState(false)
  const [src, setSrc] = useState(props.src)

  useEffect(() => {
    setLoadError(false) // Reset load error state when src changes
  }, [props.src])

  useEffect(() => {
    try {
      if (typeof props.src === 'string') {
        if (props.src) {
          new URL(props.src, window.location.href)
        }
      }
      setSrc(props.src)
    } catch {
      setLoadError(true)
    }
  }, [props.src])

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setLoadError(true)
    if (props.onError) {
      props.onError(e)
    }
  }

  return <>{loadError ? onErrorIcon ? <>{onErrorIcon}</> : <Globe className={props['className']} /> : <Image {...props} onError={handleError} alt={props.alt ?? 'favicon'} src={src} />}</>
}
