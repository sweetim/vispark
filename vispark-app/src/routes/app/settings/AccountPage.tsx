import { useTranslation } from "react-i18next"
import { BackgroundDecoration, SettingsSection } from "@/components"

const AccountPage = () => {
  const { t } = useTranslation()

  return (
    <div className="relative h-full">
      <BackgroundDecoration />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-10">
        <header className="mb-4">
          <p className="mt-2 max-w-2xl text-base text-gray-300/90 sm:text-lg">
            Manage your account security and privacy settings
          </p>
        </header>

        <div className="space-y-6">
          {/* Security Settings */}
          <SettingsSection title={t("settings.security")}>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-xl">
                <div>
                  <h3 className="text-sm font-medium text-white">{t("settings.changePassword")}</h3>
                  <p className="text-sm text-gray-400">Update your password regularly to keep your account secure</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors">
                  Change
                </button>
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-xl">
                <div>
                  <h3 className="text-sm font-medium text-white">{t("settings.twoFactorAuth")}</h3>
                  <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                </div>
                <button className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-white text-sm font-medium rounded-xl transition-colors">
                  Enable
                </button>
              </div>
            </div>
          </SettingsSection>

          {/* Privacy Settings */}
          <SettingsSection title={t("settings.privacy")}>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-xl">
                <div>
                  <h3 className="text-sm font-medium text-white">{t("settings.dataUsage")}</h3>
                  <p className="text-sm text-gray-400">Manage how your data is used and stored</p>
                </div>
                <button className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-white text-sm font-medium rounded-xl transition-colors">
                  Manage
                </button>
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-xl">
                <div>
                  <h3 className="text-sm font-medium text-white">{t("settings.exportData")}</h3>
                  <p className="text-sm text-gray-400">Download a copy of your data</p>
                </div>
                <button className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-white text-sm font-medium rounded-xl transition-colors">
                  Export
                </button>
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-red-600/20 rounded-xl border border-red-500/30">
                <div>
                  <h3 className="text-sm font-medium text-red-400">{t("settings.deleteAccount")}</h3>
                  <p className="text-sm text-red-300">Permanently delete your account and all data</p>
                </div>
                <button className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-xl transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  )
}

export default AccountPage
