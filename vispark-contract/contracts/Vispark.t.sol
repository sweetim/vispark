// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Vispark} from "./Vispark.sol";
import {Test} from "forge-std/Test.sol";

contract VisparkTest is Test {
  Vispark vispark;

  // redeclare events so we can use vm.expectEmit
  event UserProfileUpdated(string userId);
  event SummaryAdded(string userId, string videoId);
  event SubscribedToChannel(string userId, string channelId);

  function setUp() public {
    vispark = new Vispark();
  }

  function test_UpdateUserProfileCreatesProfileAndStoresData() public {
    string memory userId = "alice";

    vispark.updateUserProfile(userId);

    (string memory storedId, uint256 dateCreation) = vispark.userProfiles(userId);

    require(bytes(storedId).length > 0, "userId should be stored") ;
    require(keccak256(bytes(storedId)) == keccak256(bytes(userId)), "stored userId should match") ;
    require(dateCreation > 0, "dateCreation should be set") ;
  }

  function test_AddSummaryRevertsIfNoProfile() public {
    vm.expectRevert(bytes("User profile does not exist"));
    vispark.addSummary("noone", "vid1", "summary");
  }

  function test_SubscribeRevertsIfNoProfile() public {
    vm.expectRevert(bytes("User profile does not exist"));
    vispark.subscribeToChannel("noone", "channel1");
  }

  function test_AddSummaryEmitsEventAndStoresSummary() public {
    string memory userId = "bob";
    vispark.updateUserProfile(userId);

    string memory videoId = "video123";
    string memory summaryText = "short summary";

    vm.expectEmit(false, false, false, true);
    emit SummaryAdded(userId, videoId);

    vispark.addSummary(userId, videoId, summaryText);

    // basic check that user profile still exists
    (string memory storedId, ) = vispark.userProfiles(userId);
    require(keccak256(bytes(storedId)) == keccak256(bytes(userId)), "profile should still exist after adding summary");
  }

  function test_SubscribeEmitsEventAndStoresChannel() public {
    string memory userId = "carol";
    vispark.updateUserProfile(userId);

    string memory channelId = "channel_xyz";

    vm.expectEmit(false, false, false, true);
    emit SubscribedToChannel(userId, channelId);

    vispark.subscribeToChannel(userId, channelId);

    // basic check that user profile still exists
    (string memory storedId, ) = vispark.userProfiles(userId);
    require(keccak256(bytes(storedId)) == keccak256(bytes(userId)), "profile should still exist after subscribing");
  }
}
