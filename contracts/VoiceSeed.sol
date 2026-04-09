// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/**
 * @title VoiceSeed
 * @notice ERC721 Voice Seeds for Treegens — metadata URI points to IPFS JSON (audio + attributes).
 * @dev Public mint on testnet for demo UX; gate with Ownable in production if needed.
 */
contract VoiceSeed is ERC721URIStorage {
    uint256 private _nextTokenId;

    event VoiceSeedMinted(uint256 indexed tokenId, address indexed to);

    constructor() ERC721("Treegens Voice Seed", "VSEED") {}

    /**
     * @notice Mint a Voice Seed NFT with off-chain metadata at `tokenURI` (typically ipfs://...).
     */
    function mintSeed(address to, string memory tokenURI) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        emit VoiceSeedMinted(tokenId, to);
        return tokenId;
    }
}
