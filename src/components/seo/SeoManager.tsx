import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_URL = 'https://cubemonke.com'
const SITE_NAME = 'CubeMonke'
const DEFAULT_DESCRIPTION =
  'Practice speedcubing with a virtual 3D cube timer, custom scrambles, replay playback and solve analytics. Free, open source, and everything stays in your browser.'

type SeoConfig = {
  title: string
  description: string
  canonicalPath?: string
  robots?: string
  type?: 'website' | 'profile'
}

function getMetaElement(name: string, attribute: 'name' | 'property' = 'name') {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.appendChild(element)
  }

  return element
}

function getLinkElement(rel: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }

  return element
}

function normalizePath(pathname: string) {
  if (pathname === '/play') return '/'
  if (pathname !== '/' && pathname.endsWith('/')) return pathname.slice(0, -1)
  return pathname
}

function getSeoConfig(pathname: string): SeoConfig {
  const path = normalizePath(pathname)

  if (path === '/') {
    return {
      title: 'CubeMonke | Speedcubing Timer, Virtual Cube & Replays',
      description: DEFAULT_DESCRIPTION,
      canonicalPath: '/',
    }
  }

  if (path === '/contact') {
    return {
      title: 'Contact CubeMonke',
      description: 'Contact CubeMonke for feedback, bug reports, account issues, and speedcubing platform support.',
      canonicalPath: '/contact',
    }
  }

  if (path === '/privacy') {
    return {
      title: 'CubeMonke Privacy Policy',
      description: 'CubeMonke has no accounts or servers: your solves, replays and settings stay in your browser.',
      canonicalPath: '/privacy',
    }
  }

  if (path.startsWith('/replays/')) {
    return {
      title: 'CubeMonke Replay Player',
      description: 'Watch a shared CubeMonke solve replay with recorded turns, camera movement, and solve telemetry.',
      canonicalPath: path,
      robots: 'noindex,follow',
    }
  }

  return {
    title: `${SITE_NAME} App`,
    description: DEFAULT_DESCRIPTION,
    canonicalPath: path,
    robots: 'noindex,follow',
  }
}

export function SeoManager() {
  const location = useLocation()

  useEffect(() => {
    const config = getSeoConfig(location.pathname)
    const canonicalUrl = `${SITE_URL}${config.canonicalPath ?? normalizePath(location.pathname)}`
    const title = config.title.includes(SITE_NAME) ? config.title : `${config.title} | ${SITE_NAME}`
    const robots = config.robots ?? 'index,follow'

    document.title = title

    getMetaElement('description').content = config.description
    getMetaElement('robots').content = robots
    getMetaElement('application-name').content = SITE_NAME
    getMetaElement('theme-color').content = '#020617'

    getMetaElement('og:site_name', 'property').content = SITE_NAME
    getMetaElement('og:title', 'property').content = title
    getMetaElement('og:description', 'property').content = config.description
    getMetaElement('og:type', 'property').content = config.type ?? 'website'
    getMetaElement('og:url', 'property').content = canonicalUrl

    getMetaElement('twitter:card').content = 'summary'
    getMetaElement('twitter:title').content = title
    getMetaElement('twitter:description').content = config.description

    getLinkElement('canonical').href = canonicalUrl
  }, [location.pathname])

  return null
}
