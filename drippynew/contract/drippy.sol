// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Drippy {
    struct Profile {
        string username;
        string bio;
        string avatarIPFSHash; 
        bool exists;
    }

    struct Post {
        uint256 id;
        address author;
        string text; 
        string contentIPFSHash; 
        uint256 timestamp;
        uint256 likeCount;
    }

    // user address => Profile
    mapping(address => Profile) private profiles;

    // post id => Post
    mapping(uint256 => Post) private posts;

    // user address => post ids created
    mapping(address => uint256[]) private userPosts;

    // post id => user address => bool (liked or not)
    mapping(uint256 => mapping(address => bool)) private likes;

    // user => set of followed users
    mapping(address => mapping(address => bool)) private following;

    // Counters
    uint256 private postCounter;

    // Events
    event ProfileCreated(address indexed user, string username);
    event ProfileUpdated(address indexed user, string username);
    event PostCreated(uint256 indexed postId, address indexed author, string text, string contentIPFSHash);
    event PostLiked(uint256 indexed postId, address indexed liker);
    event PostUnliked(uint256 indexed postId, address indexed unliker);
    event Followed(address indexed follower, address indexed followee);
    event Unfollowed(address indexed follower, address indexed followee);
    event Tipped(address indexed from, address indexed to, uint256 amount);

    // Modifiers
    modifier profileExists(address user) {
        require(profiles[user].exists, "Profile does not exist");
        _;
    }

    modifier postExists(uint256 postId) {
        require(posts[postId].id != 0, "Post does not exist");
        _;
    }

    // PROFILE FUNCTIONS

    /// @notice Create user profile with username, bio and avatar IPFS hash
    function createProfile(
        string calldata username,
        string calldata bio,
        string calldata avatarIPFSHash
    ) external {
        require(!profiles[msg.sender].exists, "Profile already exists");
        require(bytes(username).length > 0, "Username required");

        profiles[msg.sender] = Profile({
            username: username,
            bio: bio,
            avatarIPFSHash: avatarIPFSHash,
            exists: true
        });

        emit ProfileCreated(msg.sender, username);
    }

    /// @notice Update profile info
    function updateProfile(
        string calldata username,
        string calldata bio,
        string calldata avatarIPFSHash
    ) external profileExists(msg.sender) {
        require(bytes(username).length > 0, "Username required");
        Profile storage profile = profiles[msg.sender];
        profile.username = username;
        profile.bio = bio;
        profile.avatarIPFSHash = avatarIPFSHash;

        emit ProfileUpdated(msg.sender, username);
    }

    /// @notice Get profile info for a user
    function getProfile(address user) external view profileExists(user) returns (
        string memory username,
        string memory bio,
        string memory avatarIPFSHash
    ) {
        Profile storage p = profiles[user];
        return (p.username, p.bio, p.avatarIPFSHash);
    }

    // POST FUNCTIONS

    /// @notice Create a post with optional IPFS content hash
    function createPost(string calldata text, string calldata contentIPFSHash) external profileExists(msg.sender) {
        require(bytes(text).length > 0 || bytes(contentIPFSHash).length > 0, "Post content required");

        postCounter++;
        posts[postCounter] = Post({
            id: postCounter,
            author: msg.sender,
            text: text,
            contentIPFSHash: contentIPFSHash,
            timestamp: block.timestamp,
            likeCount: 0
        });
        userPosts[msg.sender].push(postCounter);

        emit PostCreated(postCounter, msg.sender, text, contentIPFSHash);
    }

    /// @notice Get a post by ID
    function getPost(uint256 postId) external view postExists(postId) returns (
        uint256 id,
        address author,
        string memory text,
        string memory contentIPFSHash,
        uint256 timestamp,
        uint256 likeCount
    ) {
        Post storage p = posts[postId];
        return (p.id, p.author, p.text, p.contentIPFSHash, p.timestamp, p.likeCount);
    }

    /// @notice Get all post IDs by a user
    function getPostsByUser(address user) external view returns (uint256[] memory) {
        return userPosts[user];
    }

    // LIKE FUNCTIONS

    /// @notice Like a post
    function likePost(uint256 postId) external profileExists(msg.sender) postExists(postId) {
        require(!likes[postId][msg.sender], "Already liked");
        likes[postId][msg.sender] = true;
        posts[postId].likeCount++;

        emit PostLiked(postId, msg.sender);
    }

    /// @notice Unlike a post
    function unlikePost(uint256 postId) external profileExists(msg.sender) postExists(postId) {
        require(likes[postId][msg.sender], "Not liked yet");
        likes[postId][msg.sender] = false;
        posts[postId].likeCount--;

        emit PostUnliked(postId, msg.sender);
    }

    /// @notice Check if user liked a post
    function hasLiked(uint256 postId, address user) external view returns (bool) {
        return likes[postId][user];
    }

    // FOLLOW FUNCTIONS

    /// @notice Follow another user
    function follow(address userToFollow) external profileExists(msg.sender) profileExists(userToFollow) {
        require(userToFollow != msg.sender, "Can't follow yourself");
        require(!following[msg.sender][userToFollow], "Already following");

        following[msg.sender][userToFollow] = true;

        emit Followed(msg.sender, userToFollow);
    }

    /// @notice Unfollow another user
    function unfollow(address userToUnfollow) external profileExists(msg.sender) profileExists(userToUnfollow) {
        require(following[msg.sender][userToUnfollow], "Not following");

        following[msg.sender][userToUnfollow] = false;

        emit Unfollowed(msg.sender, userToUnfollow);
    }

    /// @notice Check if user follows another user
    function isFollowing(address follower, address followee) external view returns (bool) {
        return following[follower][followee];
    }

    // TIPPING FUNCTION

    /// @notice Tip a user with native token (ETH or chain native currency)
    function tipUser(address payable user) external payable profileExists(user) {
        require(msg.value > 0, "Tip amount must be > 0");
        require(user != msg.sender, "Can't tip yourself");

        (bool sent, ) = user.call{value: msg.value}("");
        require(sent, "Tip transfer failed");

        emit Tipped(msg.sender, user, msg.value);
    }
}
