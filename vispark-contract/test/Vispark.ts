import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { network } from "hardhat"

describe("Vispark", async () => {
  const { viem } = await network.connect()

  it("creates a user profile and emits UserProfileUpdated", async () => {
    const vispark = await viem.deployContract("Vispark")

    const userId = "alice"

    await viem.assertions.emitWithArgs(
      vispark.write.updateUserProfile([userId]),
      vispark,
      "UserProfileUpdated",
      [userId],
    )

    const profile = await vispark.read.userProfiles([userId])

    // basic storage checks
    assert.equal(profile.userId, userId)
    assert(profile.dateCreation > 0n)
    assert.equal(profile.subscribedChannels.length, 0)
    assert.equal(profile.summaries.length, 0)
  })

  it("allows adding a summary and emits SummaryAdded", async () => {
    const vispark = await viem.deployContract("Vispark")
    const userId = "bob"
    await vispark.write.updateUserProfile([userId])

    const videoId = "video123"
    const summaryText = "This is a short summary of the video."

    await viem.assertions.emitWithArgs(
      vispark.write.addSummary([userId, videoId, summaryText]),
      vispark,
      "SummaryAdded",
      [userId, videoId],
    )

    const profile = await vispark.read.userProfiles([userId])
    assert.equal(profile.summaries.length, 1)

    const s = profile.summaries[0]
    assert.equal(s.videoId, videoId)
    assert.equal(s.summary, summaryText)
    assert(s.dateCreation > 0n)
  })

  it("allows subscribing to a channel and emits SubscribedToChannel", async () => {
    const vispark = await viem.deployContract("Vispark")
    const userId = "carol"
    await vispark.write.updateUserProfile([userId])

    const channelId = "channel_xyz"

    await viem.assertions.emitWithArgs(
      vispark.write.subscribeToChannel([userId, channelId]),
      vispark,
      "SubscribedToChannel",
      [userId, channelId],
    )

    const profile = await vispark.read.userProfiles([userId])
    assert.equal(profile.subscribedChannels.length, 1)
    assert.equal(profile.subscribedChannels[0], channelId)
  })
})
