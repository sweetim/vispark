import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocale } from "@/contexts/LocaleContext"
import { BackgroundDecoration, SettingsSection, ToggleOption, LanguageSelector } from "@/components"

const PreferencesPage = () => {
  const { t } = useTranslation()
  const { currentLanguage, changeLanguage } = useLocale()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [compactView, setCompactView] = useState(false)

  return (
    <div className="relative h-full">
      <BackgroundDecoration />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-10">
        <header className="mb-8">
          <p className="mt-2 max-w-2xl text-base text-gray-300/90 sm:text-lg">
            Customize your app experience and notification preferences
          </p>
        </header>

        <div className="space-y-6">
          {/* Language Settings */}
          <SettingsSection title={t("settings.language")}>
            <LanguageSelector
              currentLanguage={currentLanguage}
              onLanguageChange={changeLanguage}
              englishLabel={t("settings.english")}
              japaneseLabel={t("settings.japanese")}
            />
          </SettingsSection>

          {/* Notification Settings */}
          <SettingsSection title={t("settings.notifications")}>
            <div className="space-y-4">
              <ToggleOption
                title={t("settings.emailNotifications")}
                description="Receive email updates about your account activity"
                isOn={emailNotifications}
                onToggle={() => setEmailNotifications(!emailNotifications)}
              />
              <ToggleOption
                title={t("settings.pushNotifications")}
                description="Receive push notifications on your devices"
                isOn={pushNotifications}
                onToggle={() => setPushNotifications(!pushNotifications)}
              />
            </div>
          </SettingsSection>

          {/* Appearance Settings */}
          <SettingsSection title="Appearance">
            <div className="space-y-4">
              <ToggleOption
                title="Dark Mode"
                description="Use dark theme across the application"
                isOn={darkMode}
                onToggle={() => setDarkMode(!darkMode)}
              />
              <ToggleOption
                title="Compact View"
                description="Show more content with reduced spacing"
                isOn={compactView}
                onToggle={() => setCompactView(!compactView)}
              />
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  )
}

export default PreferencesPage
