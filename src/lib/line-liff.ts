import { LineUser } from './store'

// LINE LIFF Configuration
const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID || ''

declare global {
  interface Window {
    liff: any
  }
}

export class LineLiffService {
  private static instance: LineLiffService
  private isInitialized = false

  private constructor() {}

  static getInstance(): LineLiffService {
    if (!LineLiffService.instance) {
      LineLiffService.instance = new LineLiffService()
    }
    return LineLiffService.instance
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true

    try {
      // Load LIFF SDK
      await this.loadLiffSDK()
      
      // Initialize LIFF
      await window.liff.init({ liffId: LIFF_ID })
      
      this.isInitialized = true
      return true
    } catch (error) {
      console.error('Failed to initialize LIFF:', error)
      return false
    }
  }

  private async loadLiffSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.liff) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load LIFF SDK'))
      document.head.appendChild(script)
    })
  }

  async login(): Promise<boolean> {
    try {
      if (!window.liff.isLoggedIn()) {
        window.liff.login()
        return false
      }
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  async logout(): Promise<void> {
    try {
      if (window.liff.isLoggedIn()) {
        window.liff.logout()
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  async getUserProfile(): Promise<LineUser | null> {
    try {
      if (!window.liff.isLoggedIn()) {
        return null
      }

      const profile = await window.liff.getProfile()
      return {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
      }
    } catch (error) {
      console.error('Failed to get user profile:', error)
      return null
    }
  }

  async sendMessage(message: string): Promise<boolean> {
    try {
      if (!window.liff.isLoggedIn()) {
        return false
      }

      await window.liff.sendMessages([
        {
          type: 'text',
          text: message,
        },
      ])
      return true
    } catch (error) {
      console.error('Failed to send message:', error)
      return false
    }
  }

  isInClient(): boolean {
    return window.liff?.isInClient() || false
  }

  isLoggedIn(): boolean {
    return window.liff?.isLoggedIn() || false
  }
}

export const lineLiffService = LineLiffService.getInstance() 