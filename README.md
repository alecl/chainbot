An extension to ERC721 NFT standard to allow for chatbot specific properties and freezing values to protect them from being changed or disconnected from a bot during NFT resale.

A web app showing using the personal sign feature of web3 to prove wallet address ownership as a gas free way to authenticate to chat with a bot. The approach is in the style of OAuth2 JWT bearer tokens. The bot has its properties on chain (optionally frozen).

Additional features include displaying whether the bot properties are currently frozen (and for how long) as well as whether the bot's tokenURI is on a pinned IPFS provider. More rigor would be needed for an actual check, but the premise is to help provide more assurances about the stability of an NFT that represents a chatbot. A concrete use case could be systems that are creating NFTs tied to trained AI and a purchaser would want assurances that they aren't losing the trained backend that is linked to the NFT via on chain references.

Future extensions could include the session identifier or even chat contents stored on chain (encrypted) for audit/proof. This would prohibitive at the gas cost and speed of ETH1, but ETH2, SOL, MATIC and other more efficient chains may make that a useful property.