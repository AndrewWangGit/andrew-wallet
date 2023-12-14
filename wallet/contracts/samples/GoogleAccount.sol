// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

/* solhint-disable avoid-low-level-calls */
/* solhint-disable no-inline-assembly */
/* solhint-disable reason-string */

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
// import "@openzeppelin/contracts/utils/Base64.sol";

import "../core/BaseAccount.sol";
import "./callback/TokenCallbackHandler.sol";
import "../utils/Base64.sol";
import "../utils/JsmnSolLib.sol";

/**
 * minimal account.
 *  this is sample minimal account.
 *  has execute, eth handling methods
 *  has a single signer that can send requests through the entryPoint.
 */
contract GoogleAccount is
    BaseAccount,
    TokenCallbackHandler,
    UUPSUpgradeable,
    Initializable
{
    using JsmnSolLib for string;

    address public owner;
    string public aud =
        "629075145814-0il5ad9dgklad6olnla10nebnqc5n2uj.apps.googleusercontent.com";
    string public email = "andrew.tj.wang@gmail.com";

    IEntryPoint private immutable _entryPoint;

    event SimpleAccountInitialized(
        IEntryPoint indexed entryPoint,
        address indexed owner
    );

    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    /// @inheritdoc BaseAccount
    function entryPoint() public view virtual override returns (IEntryPoint) {
        return _entryPoint;
    }

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    constructor(IEntryPoint anEntryPoint) {
        _entryPoint = anEntryPoint;
        _disableInitializers();
    }

    function _onlyOwner() internal view {
        //directly from EOA owner, or through the account itself (which gets redirected through execute())
        require(
            msg.sender == owner || msg.sender == address(this),
            "only owner"
        );
    }

    /**
     * execute a transaction (called directly from owner, or by entryPoint)
     */
    function execute(
        address dest,
        uint256 value,
        bytes calldata func
    ) external {
        _requireFromEntryPointOrOwner();
        _call(dest, value, func);
    }

    /**
     * execute a sequence of transactions
     * @dev to reduce gas consumption for trivial case (no value), use a zero-length array to mean zero value
     */
    function executeBatch(
        address[] calldata dest,
        uint256[] calldata value,
        bytes[] calldata func
    ) external {
        _requireFromEntryPointOrOwner();
        require(
            dest.length == func.length &&
                (value.length == 0 || value.length == func.length),
            "wrong array lengths"
        );
        if (value.length == 0) {
            for (uint256 i = 0; i < dest.length; i++) {
                _call(dest[i], 0, func[i]);
            }
        } else {
            for (uint256 i = 0; i < dest.length; i++) {
                _call(dest[i], value[i], func[i]);
            }
        }
    }

    /**
     * @dev The _entryPoint member is immutable, to reduce gas consumption.  To upgrade EntryPoint,
     * a new implementation of SimpleAccount must be deployed with the new EntryPoint address, then upgrading
     * the implementation by calling `upgradeTo()`
     */
    function initialize(address anOwner) public virtual initializer {
        _initialize(anOwner);
    }

    function _initialize(address anOwner) internal virtual {
        owner = anOwner;
        emit SimpleAccountInitialized(_entryPoint, owner);
    }

    // Require the function call went through EntryPoint or owner
    function _requireFromEntryPointOrOwner() internal view {
        require(
            msg.sender == address(entryPoint()) || msg.sender == owner,
            "account: not Owner or EntryPoint"
        );
    }

    /// implement template method of BaseAccount
    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) internal virtual override returns (uint256 validationData) {
        (
            string memory payloadJson,
            bytes memory _data,
            bytes memory _m,
            bytes memory _e,
            bytes memory _s
        ) = abi.decode(userOp.signature, (string, bytes, bytes, bytes, bytes));

        bool sigValid = pkcs1Sha256Raw(_data, _s, _e, _m);
        if (!sigValid) return SIG_VALIDATION_FAILED;

        (
            string memory _aud,
            string memory _nonce,
            string memory _email
        ) = parsePayload(payloadJson);

        bytes memory userOpHashBytes = bytes32ToBytes(userOpHash);
        string memory userOpHashString = iToHex(userOpHashBytes);

        if (
            _aud.strCompare(aud) != 0 ||
            _email.strCompare(email) != 0 ||
            _nonce.strCompare(userOpHashString) != 0
        ) {
            return SIG_VALIDATION_FAILED;
        }

        return 0;
    }

    function iToHex(bytes memory buffer) public pure returns (string memory) {
        // Fixed buffer size for hexadecimal convertion
        bytes memory converted = new bytes(buffer.length * 2);

        bytes memory _base = "0123456789abcdef";

        for (uint256 i = 0; i < buffer.length; i++) {
            converted[i * 2] = _base[uint8(buffer[i]) / _base.length];
            converted[i * 2 + 1] = _base[uint8(buffer[i]) % _base.length];
        }

        return string(abi.encodePacked("0x", converted));
    }

    function bytes32ToBytes(bytes32 _data) public pure returns (bytes memory) {
        bytes memory byteArray = new bytes(32);
        for (uint i = 0; i < 32; i++) {
            byteArray[i] = _data[i];
        }
        return byteArray;
    }

    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    /**
     * check current account deposit in the entryPoint
     */
    function getDeposit() public view returns (uint256) {
        return entryPoint().balanceOf(address(this));
    }

    /**
     * deposit more funds for this account in the entryPoint
     */
    function addDeposit() public payable {
        entryPoint().depositTo{value: msg.value}(address(this));
    }

    /**
     * withdraw value from the account's deposit
     * @param withdrawAddress target to send to
     * @param amount to withdraw
     */
    function withdrawDepositTo(
        address payable withdrawAddress,
        uint256 amount
    ) public onlyOwner {
        entryPoint().withdrawTo(withdrawAddress, amount);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal view override {
        (newImplementation);
        _onlyOwner();
    }

    function pkcs1Sha256(
        bytes32 _sha256,
        bytes memory _s,
        bytes memory _e,
        bytes memory _m
    ) public view returns (bool) {
        uint8[17] memory sha256ExplicitNullParam = [
            0x30,
            0x31,
            0x30,
            0x0d,
            0x06,
            0x09,
            0x60,
            0x86,
            0x48,
            0x01,
            0x65,
            0x03,
            0x04,
            0x02,
            0x01,
            0x05,
            0x00
        ];

        uint8[15] memory sha256ImplicitNullParam = [
            0x30,
            0x2f,
            0x30,
            0x0b,
            0x06,
            0x09,
            0x60,
            0x86,
            0x48,
            0x01,
            0x65,
            0x03,
            0x04,
            0x02,
            0x01
        ];

        // decipher

        bytes memory input = bytes.concat(
            bytes32(_s.length),
            bytes32(_e.length),
            bytes32(_m.length),
            _s,
            _e,
            _m
        );
        uint inputlen = input.length;

        uint decipherlen = _m.length;
        bytes memory decipher = new bytes(decipherlen);
        assembly {
            pop(
                staticcall(
                    // sub(gas(), 2000),
                    200000,
                    5,
                    add(input, 0x20),
                    inputlen,
                    add(decipher, 0x20),
                    decipherlen
                )
            )
        }

        // Check that is well encoded:
        //
        // 0x00 || 0x01 || PS || 0x00 || DigestInfo
        // PS is padding filled with 0xff
        // DigestInfo ::= SEQUENCE {
        //    digestAlgorithm AlgorithmIdentifier,
        //      [optional algorithm parameters]
        //    digest OCTET STRING
        // }

        bool hasNullParam;
        uint digestAlgoWithParamLen;

        if (uint8(decipher[decipherlen - 50]) == 0x31) {
            hasNullParam = true;
            digestAlgoWithParamLen = sha256ExplicitNullParam.length;
        } else if (uint8(decipher[decipherlen - 48]) == 0x2f) {
            hasNullParam = false;
            digestAlgoWithParamLen = sha256ImplicitNullParam.length;
        } else {
            return false;
        }

        uint paddingLen = decipherlen - 5 - digestAlgoWithParamLen - 32;

        if (decipher[0] != 0 || decipher[1] != 0x01) {
            return false;
        }
        for (uint i = 2; i < 2 + paddingLen; i++) {
            if (decipher[i] != 0xff) {
                return false;
            }
        }
        if (decipher[2 + paddingLen] != 0) {
            return false;
        }

        // check digest algorithm

        if (digestAlgoWithParamLen == sha256ExplicitNullParam.length) {
            for (uint i = 0; i < digestAlgoWithParamLen; i++) {
                if (
                    decipher[3 + paddingLen + i] !=
                    bytes1(sha256ExplicitNullParam[i])
                ) {
                    return false;
                }
            }
        } else {
            for (uint i = 0; i < digestAlgoWithParamLen; i++) {
                if (
                    decipher[3 + paddingLen + i] !=
                    bytes1(sha256ImplicitNullParam[i])
                ) {
                    return false;
                }
            }
        }

        // check digest

        if (
            decipher[3 + paddingLen + digestAlgoWithParamLen] != 0x04 ||
            decipher[4 + paddingLen + digestAlgoWithParamLen] != 0x20
        ) {
            return false;
        }

        for (uint i = 0; i < _sha256.length; i++) {
            if (
                decipher[5 + paddingLen + digestAlgoWithParamLen + i] !=
                _sha256[i]
            ) {
                return false;
            }
        }

        return true;
    }

    /** @dev Verifies a PKCSv1.5 SHA256 signature
     * @param _data to verify
     * @param _s is the signature
     * @param _e is the exponent
     * @param _m is the modulus
     * @return 0 if success, >0 otherwise
     */
    function pkcs1Sha256Raw(
        bytes memory _data,
        bytes memory _s,
        bytes memory _e,
        bytes memory _m
    ) public view returns (bool) {
        return pkcs1Sha256(sha256(_data), _s, _e, _m);
    }

    function parsePayload(
        string memory json
    )
        internal
        pure
        returns (string memory _aud, string memory _nonce, string memory _email)
    {
        (uint exitCode, JsmnSolLib.Token[] memory tokens, uint ntokens) = json
            .parse(40);
        require(exitCode == 0, "JSON parse failed");

        require(
            tokens[0].jsmnType == JsmnSolLib.JsmnType.OBJECT,
            "Expected JWT to be an object"
        );
        uint i = 1;
        while (i < ntokens) {
            require(
                tokens[i].jsmnType == JsmnSolLib.JsmnType.STRING,
                "Expected JWT to contain only string keys"
            );
            string memory key = json.getBytes(tokens[i].start, tokens[i].end);
            if (key.strCompare("aud") == 0) {
                require(
                    tokens[i + 1].jsmnType == JsmnSolLib.JsmnType.STRING,
                    "Expected aud to be a string"
                );
                _aud = json.getBytes(tokens[i + 1].start, tokens[i + 1].end);
            } else if (key.strCompare("nonce") == 0) {
                require(
                    tokens[i + 1].jsmnType == JsmnSolLib.JsmnType.STRING,
                    "Expected nonce to be a string"
                );
                _nonce = json.getBytes(tokens[i + 1].start, tokens[i + 1].end);
            } else if (key.strCompare("email") == 0) {
                require(
                    tokens[i + 1].jsmnType == JsmnSolLib.JsmnType.STRING,
                    "Expected email to be a string"
                );
                _email = json.getBytes(tokens[i + 1].start, tokens[i + 1].end);
            }
            i += 2;
        }
    }
}
