import { useState } from "react"
import { useAuth } from "@/modules/auth"

const WalletPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "settings">("overview")

  const displayName =
    user?.user_metadata?.full_name
    ?? user?.user_metadata?.name
    ?? user?.user_metadata?.user_name
    ?? user?.email
    ?? "Anonymous User"

  // Mock wallet data - in a real app, this would come from an API
  const walletBalance = 1250.75
  const currency = "USD"
  const transactions = [
    { id: "1", date: "2025-11-05", description: "Video Summary Purchase", amount: -5.00, type: "expense" },
    { id: "2", date: "2025-11-03", description: "Account Credit", amount: 25.00, type: "income" },
    { id: "3", date: "2025-11-01", description: "Channel Subscription", amount: -10.00, type: "expense" },
    { id: "4", date: "2025-10-28", description: "Account Credit", amount: 50.00, type: "income" },
  ]

  // Mock time saved data - in a real app, this would be calculated from actual usage
  const totalVideosSummarized = 47
  const averageVideoLength = 12 // minutes
  const averageSummaryReadTime = 2 // minutes
  const totalMinutesSaved = totalVideosSummarized * (averageVideoLength - averageSummaryReadTime)
  const totalHoursSaved = Math.floor(totalMinutesSaved / 60)
  const remainingMinutes = totalMinutesSaved % 60

  return (
    <div className="flex flex-col h-full w-full bg-gray-900 text-white p-4 pb-20 overflow-y-auto">
      <div className="w-full max-w-lg mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Wallet</h1>
          <p className="text-gray-400">Manage your account balance and transactions</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">Current Balance</p>
            <p className="text-3xl font-bold">
              {currency} {walletBalance.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex bg-gray-800 rounded-lg p-1">
          <button
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === "overview"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === "transactions"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("transactions")}
          >
            Transactions
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === "settings"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-lg text-left">
                  Add Funds
                </button>
                <button className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 transition-colors rounded-lg text-left">
                  Withdraw Funds
                </button>
                <button className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 transition-colors rounded-lg text-left">
                  Payment Methods
                </button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Time Saved</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Videos Summarized:</span>
                  <span>{totalVideosSummarized}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Time Saved:</span>
                  <span className="text-green-400 font-semibold">
                    {totalHoursSaved}h {remainingMinutes}m
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Video Length:</span>
                  <span>{averageVideoLength} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Summary Read Time:</span>
                  <span>{averageSummaryReadTime} minutes</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Account Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Account Holder:</span>
                  <span>{displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Account Type:</span>
                  <span>Personal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Currency:</span>
                  <span>{currency}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Recent Transactions</h3>
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-400">{transaction.date}</p>
                  </div>
                  <span className={`font-semibold ${
                    transaction.type === "income" ? "text-green-400" : "text-red-400"
                  }`}>
                    {transaction.type === "income" ? "+" : "-"}{currency} {Math.abs(transaction.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Payment Settings</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Auto-reload</span>
                  <button className="w-12 h-6 bg-gray-600 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span>Transaction notifications</span>
                  <button className="w-12 h-6 bg-indigo-600 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Security</h3>
              <div className="space-y-2">
                <button className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 transition-colors rounded-lg text-left">
                  Change PIN
                </button>
                <button className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 transition-colors rounded-lg text-left">
                  Two-Factor Authentication
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WalletPage
