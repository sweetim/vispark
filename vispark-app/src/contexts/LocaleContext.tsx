import React, { createContext, useContext, useState, ReactNode } from "react"
import { useTranslation } from "react-i18next"

type LocaleContextType = {
  currentLanguage: string
  changeLanguage: (language: string) => void
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

type LocaleProviderProps = {
  children: ReactNode
}

export const LocaleProvider = ({ children }: LocaleProviderProps) => {
  const { i18n } = useTranslation()
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language)

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language)
    setCurrentLanguage(language)
  }

  return (
    <LocaleContext.Provider value={{ currentLanguage, changeLanguage }}>
      {children}
    </LocaleContext.Provider>
  )
}

export const useLocale = () => {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider")
  }
  return context
}
