interface Ive {
    function token() external view returns (address);

    function balanceOfNFT(uint256) external view returns (uint256);

    function isApprovedOrOwner(address, uint256) external view returns (bool);

    function ownerOf(uint256) external view returns (address);

    function transferFrom(
        address,
        address,
        uint256
    ) external;

    function attach(uint256 tokenId) external;

    function detach(uint256 tokenId) external;

    function voting(uint256 tokenId) external;

    function abstain(uint256 tokenId) external;
}
