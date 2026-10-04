type AppLogoProps = {
  className?: string
  imageClassName?: string
}

export function AppLogo({ className = '', imageClassName = '' }: AppLogoProps) {
  return (
    <span className={`inline-flex items-center justify-center overflow-hidden ${className}`}>
      <img src="/favicon.svg" alt="CubeMonke" className={`h-full w-full object-cover ${imageClassName}`} />
    </span>
  )
}
