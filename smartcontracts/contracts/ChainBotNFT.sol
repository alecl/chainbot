// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
//import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "base64-sol/base64.sol";

//contract ChainBotNFT is ERC721URIStorage, Ownable {
contract ChainBotNFT is ERC721URIStorage, Ownable {
    struct BotInfo {
        address creator;
        string name;
        string messageUri;
        uint256 freezeExpiry;
    }

    // Waiting until blockchain transaction is complete to
    // create a sessionId is a serious delay to conversation
    // and makes no sense
    // TODO: Maybe create sessionId externally and store it?
    // use-case verified wallet address of chatbot hoster (which is not owner??)
    // still doesn't make sense
    mapping(address => uint256[]) conversationSessions;
    mapping(string => address) sessionIdToBotUser;

    // TODO: add init parameter to constructor
    string public authUri;

    uint256 public tokenCounter;

    // 1 week + a minute buffer
    uint256 public maxFreezeExpirySeconds = (60 * 60 * 24 * 7) + 300;

    // 24 hours
    uint256 public sessionLength = 60 * 60 * 24;

    BotInfo[] public bots;

    event CreatedChainBotNFT(uint256 indexed tokenId, string name);
    event ChainBotInfoFrozen(
        address indexed owner,
        uint256 indexed timestamp,
        uint256 indexed tokenId
    );
    event ChainBotInfoThawed(
        address indexed owner,
        uint256 indexed timestamp,
        uint256 indexed tokenId
    );

    constructor() ERC721("ChainBot NFT", "ChainBotNFT") {
        tokenCounter = 0;

        authUri = "http://localhost:3000/auth";
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        super.safeTransferFrom(from, to, tokenId);
        // Reset any freeze on successful transfer
        bots[tokenId].freezeExpiry = block.timestamp;
        emit ChainBotInfoThawed(
            _msgSender(),
            bots[tokenId].freezeExpiry,
            tokenId
        );
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        super.transferFrom(from, to, tokenId);
        // Reset any freeze on successful transfer
        bots[tokenId].freezeExpiry = block.timestamp;
        emit ChainBotInfoThawed(
            _msgSender(),
            bots[tokenId].freezeExpiry,
            tokenId
        );
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public override {
        super.safeTransferFrom(from, to, tokenId, _data);
        // Reset any freeze on successful transfer
        bots[tokenId].freezeExpiry = block.timestamp;
        emit ChainBotInfoThawed(
            _msgSender(),
            bots[tokenId].freezeExpiry,
            tokenId
        );
    }

    function getAuthUri() public view returns (string memory) {
        return authUri;
    }

    function setAuthUri(string memory _authUri) public onlyOwner {
        authUri = _authUri;
    }

    function getBotInfo(uint256 tokenId)
        public
        view
        returns (
            address,
            string memory,
            string memory,
            uint256
        )
    {
        return (
            bots[tokenId].creator,
            bots[tokenId].name,
            bots[tokenId].messageUri,
            bots[tokenId].freezeExpiry
        );
    }

    function updateBotInfo(
        uint256 tokenId,
        string memory name,
        string memory messageUri
    ) external {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "not owner nor approved"
        );
        require(
            bots[tokenId].freezeExpiry < block.timestamp,
            "freeze in effect, no changes allowed"
        );
        bots[tokenId].name = name;
        bots[tokenId].messageUri = messageUri;
    }

    function updateBotName(uint256 tokenId, string memory name) external {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "not owner nor approved"
        );
        require(
            bots[tokenId].freezeExpiry < block.timestamp,
            "freeze in effect, no changes allowed"
        );
        bots[tokenId].name = name;
    }

    function updateBotMessageUri(uint256 tokenId, string memory messageUri)
        external
    {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "not owner nor approved"
        );
        require(
            bots[tokenId].freezeExpiry < block.timestamp,
            "freeze in effect, no changes allowed"
        );
        bots[tokenId].messageUri = messageUri;
    }

    function create(string memory name, string memory messageUri)
        public
        returns (uint256)
    {
        uint256 tokenId = tokenCounter;
        _safeMint(msg.sender, tokenId);
        // For demo purposes set a pinned IPFS URI
        _setTokenURI(tokenId, 'https://gateway.pinata.cloud/ipfs/QmbbVwNkaqCaE11advRnzDKVB5jrZmSsjTUaUzxP4qTGQk');

        bots.push(BotInfo(msg.sender, name, messageUri, block.timestamp));

        emit CreatedChainBotNFT(tokenId, name);
        tokenCounter = tokenCounter + 1;
        return tokenId;
    }

    // by freezing the data on chain and IF the URIs point to IPFS
    // (not verified on chain as there are multiple providers but can be verified
    // by a marketplace site or user inspection)

    function freeze(uint256 tokenId, uint256 freezeExpiry) external {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "not owner nor approved"
        );
        require(freezeExpiry >= block.timestamp, "freezeExpiry cannot be past");
        require(
            freezeExpiry < block.timestamp + maxFreezeExpirySeconds,
            "freezeExpiry cannot be more than a week"
        );
        //solhint-disable-next-line max-line-length
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );
        require(_exists(tokenId), "ERC721: URI set of nonexistent token");

        bots[tokenId].freezeExpiry = freezeExpiry;
        emit ChainBotInfoFrozen(_msgSender(), freezeExpiry, tokenId);
    }

    // You could also just upload the raw SVG and have solildity convert it!
    /*
    function svgToImageURI(string memory svg)
        public
        pure
        returns (string memory)
    {
        // example:
        string memory baseURL = "data:image/svg+xml;base64,";
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );
        return string(abi.encodePacked(baseURL, svgBase64Encoded));
    }

    function formatTokenURI(string memory imageURI)
        public
        pure
        returns (string memory)
    {
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                "SVG NFT", // You can add whatever name here
                                '", "description":"An NFT based on SVG!", "attributes":"", "image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }
    */
}
