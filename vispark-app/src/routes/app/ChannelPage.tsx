import { useState } from 'react'

const subscribedChannels = [
  {
    id: 'UC_x5XG1OV2P6uZZ5FSM9Ttw',
    name: 'Google Developers',
    avatar: 'https://yt3.ggpht.com/a/AATXAJw-hXv_t_fH_t_fH_t_fH_t_fH_t_fH_t_fH=s100-c-k-c0xffffffff-no-rj-mo',
  },
  {
    id: 'UClb90NQQcskXHeG-2gI18Fg',
    name: 'React',
    avatar: 'https://yt3.ggpht.com/a/AATXAJw-hXv_t_fH_t_fH_t_fH_t_fH_t_fH_t_fH=s100-c-k-c0xffffffff-no-rj-mo',
  },
  {
    id: 'UCv_f_3_p_s_f_s_f_s_f_s_f_s_f_s_f_s_f_s_f_s_f',
    name: 'Tailwind CSS',
    avatar: 'https://yt3.ggpht.com/a/AATXAJw-hXv_t_fH_t_fH_t_fH_t_fH_t_fH_t_fH=s100-c-k-c0xffffffff-no-rj-mo',
  },
]

const ChannelPage = () => {
  const [channelId, setChannelId] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('Channel ID:', channelId)
    // TODO: Add logic to handle the channel ID
  }

  return (
    <div className="flex flex-col items-center h-full w-full bg-gray-900 text-white p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">
          Manage YouTube Channels
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-10">
          <input
            type="text"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            placeholder="e.g. UC_x5XG1OV2P6uZZ5FSM9Ttw"
            className="px-4 py-3 border rounded-lg bg-gray-900 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg"
          >
            Add Channel
          </button>
        </form>

        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">Subscribed Channels</h2>
          <ul className="space-y-4">
            {subscribedChannels.map((channel) => (
              <li
                key={channel.id}
                className="flex items-center p-4 bg-gray-800 rounded-lg shadow-md"
              >
                <img
                  src={channel.avatar}
                  alt={`${channel.name} avatar`}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <span className="font-semibold text-lg">{channel.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ChannelPage
