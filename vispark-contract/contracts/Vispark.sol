// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Vispark {
    struct Summary {
        string videoId;
        string summary;
        uint dateCreation;
    }

    struct UserProfile {
        string userId;
        uint dateCreation;
        string[] subscribedChannels;
        Summary[] summaries;
    }

    mapping(string => UserProfile) public userProfiles;

    event UserProfileUpdated(string userId);
    event SummaryAdded(string userId, string videoId);
    event SubscribedToChannel(string userId, string channelId);

    function updateUserProfile(string memory userId) public {
        require(bytes(userId).length > 0, "User ID cannot be empty");
        if (bytes(userProfiles[userId].userId).length == 0) {
            userProfiles[userId] = UserProfile({
                userId: userId,
                dateCreation: block.timestamp,
                subscribedChannels: new string[](0),
                summaries: new Summary[](0)
            });
        }
        emit UserProfileUpdated(userId);
    }

    function addSummary(string memory userId, string memory videoId, string memory summary) public {
        require(bytes(userProfiles[userId].userId).length > 0, "User profile does not exist");
        userProfiles[userId].summaries.push(Summary(videoId, summary, block.timestamp));
        emit SummaryAdded(userId, videoId);
    }

    function subscribeToChannel(string memory userId, string memory channelId) public {
        require(bytes(userProfiles[userId].userId).length > 0, "User profile does not exist");
        userProfiles[userId].subscribedChannels.push(channelId);
        emit SubscribedToChannel(userId, channelId);
    }
}
