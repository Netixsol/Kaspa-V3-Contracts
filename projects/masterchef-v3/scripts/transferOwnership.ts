/* eslint-disable camelcase */
import { ethers, run, network } from "hardhat";
import { Contract } from "ethers";
import { configs } from "@kasplex/common/config";
import { tryVerify } from "@kasplex/common/verify";
import { writeFileSync } from "fs";

const abi = [
  {
    inputs: [
      {
        internalType: "contract IERC20",
        name: "_CAKE",
        type: "address",
      },
      {
        internalType: "contract INonfungiblePositionManager",
        name: "_nonfungiblePositionManager",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "pid",
        type: "uint256",
      },
    ],
    name: "DuplicatedPool",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidNFT",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidPeriodDuration",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidPid",
    type: "error",
  },
  {
    inputs: [],
    name: "NoBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "NoLMPool",
    type: "error",
  },
  {
    inputs: [],
    name: "NoLiquidity",
    type: "error",
  },
  {
    inputs: [],
    name: "NotEmpty",
    type: "error",
  },
  {
    inputs: [],
    name: "NotOwner",
    type: "error",
  },
  {
    inputs: [],
    name: "NotOwnerOrOperator",
    type: "error",
  },
  {
    inputs: [],
    name: "NotKaspaNFT",
    type: "error",
  },
  {
    inputs: [],
    name: "WrongReceiver",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroAddress",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "pid",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "allocPoint",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "contract IKaspaV3Pool",
        name: "v3Pool",
        type: "address",
      },
      {
        indexed: true,
        internalType: "contract ILMPool",
        name: "lmPool",
        type: "address",
      },
    ],
    name: "AddPool",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "pid",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "liquidity",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "int24",
        name: "tickLower",
        type: "int24",
      },
      {
        indexed: false,
        internalType: "int24",
        name: "tickUpper",
        type: "int24",
      },
    ],
    name: "Deposit",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "pid",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "reward",
        type: "uint256",
      },
    ],
    name: "Harvest",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [],
    name: "Init",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "deployer",
        type: "address",
      },
    ],
    name: "NewLMPoolDeployerAddress",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "NewOperatorAddress",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "periodDuration",
        type: "uint256",
      },
    ],
    name: "NewPeriodDuration",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "NewReceiver",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "periodNumber",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "startTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "cakePerSecond",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "cakeAmount",
        type: "uint256",
      },
    ],
    name: "NewUpkeepPeriod",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bool",
        name: "emergency",
        type: "bool",
      },
    ],
    name: "SetEmergency",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "pid",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "allocPoint",
        type: "uint256",
      },
    ],
    name: "SetPool",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "farmBoostContract",
        type: "address",
      },
    ],
    name: "UpdateFarmBoostContract",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "pid",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "int128",
        name: "liquidity",
        type: "int128",
      },
      {
        indexed: false,
        internalType: "int24",
        name: "tickLower",
        type: "int24",
      },
      {
        indexed: false,
        internalType: "int24",
        name: "tickUpper",
        type: "int24",
      },
    ],
    name: "UpdateLiquidity",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "periodNumber",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "oldEndTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newEndTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "remainingCake",
        type: "uint256",
      },
    ],
    name: "UpdateUpkeepPeriod",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "pid",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Withdraw",
    type: "event",
  },
  {
    inputs: [],
    name: "BOOST_PRECISION",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "CAKE",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "FARM_BOOSTER",
    outputs: [
      {
        internalType: "contract IFarmBooster",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "LMPoolDeployer",
    outputs: [
      {
        internalType: "contract ILMPoolDeployer",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_BOOST_PRECISION",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_DURATION",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MIN_DURATION",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PERIOD_DURATION",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PRECISION",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_allocPoint",
        type: "uint256",
      },
      {
        internalType: "contract IKaspaV3Pool",
        name: "_v3Pool",
        type: "address",
      },
      {
        internalType: "bool",
        name: "_withUpdate",
        type: "bool",
      },
    ],
    name: "add",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "recipient",
            type: "address",
          },
          {
            internalType: "uint128",
            name: "amount0Max",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "amount1Max",
            type: "uint128",
          },
        ],
        internalType: "struct INonfungiblePositionManagerStruct.CollectParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "collect",
    outputs: [
      {
        internalType: "uint256",
        name: "amount0",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount1",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
          {
            internalType: "uint128",
            name: "liquidity",
            type: "uint128",
          },
          {
            internalType: "uint256",
            name: "amount0Min",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amount1Min",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
        ],
        internalType: "struct INonfungiblePositionManagerStruct.DecreaseLiquidityParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "decreaseLiquidity",
    outputs: [
      {
        internalType: "uint256",
        name: "amount0",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount1",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "emergency",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_v3Pool",
        type: "address",
      },
    ],
    name: "getLatestPeriodInfo",
    outputs: [
      {
        internalType: "uint256",
        name: "cakePerSecond",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_pid",
        type: "uint256",
      },
    ],
    name: "getLatestPeriodInfoByPid",
    outputs: [
      {
        internalType: "uint256",
        name: "cakePerSecond",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
    ],
    name: "harvest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amount0Desired",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amount1Desired",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amount0Min",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amount1Min",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
        ],
        internalType: "struct INonfungiblePositionManagerStruct.IncreaseLiquidityParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "increaseLiquidity",
    outputs: [
      {
        internalType: "uint128",
        name: "liquidity",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "amount0",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount1",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "latestPeriodCakePerSecond",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestPeriodEndTime",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestPeriodNumber",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestPeriodStartTime",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes[]",
        name: "data",
        type: "bytes[]",
      },
    ],
    name: "multicall",
    outputs: [
      {
        internalType: "bytes[]",
        name: "results",
        type: "bytes[]",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "nonfungiblePositionManager",
    outputs: [
      {
        internalType: "contract INonfungiblePositionManager",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "_from",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "onERC721Received",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "operatorAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
    ],
    name: "pendingCake",
    outputs: [
      {
        internalType: "uint256",
        name: "reward",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "poolInfo",
    outputs: [
      {
        internalType: "uint256",
        name: "allocPoint",
        type: "uint256",
      },
      {
        internalType: "contract IKaspaV3Pool",
        name: "v3Pool",
        type: "address",
      },
      {
        internalType: "address",
        name: "token0",
        type: "address",
      },
      {
        internalType: "address",
        name: "token1",
        type: "address",
      },
      {
        internalType: "uint24",
        name: "fee",
        type: "uint24",
      },
      {
        internalType: "uint256",
        name: "totalLiquidity",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalBoostLiquidity",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "poolLength",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "receiver",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_pid",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_allocPoint",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_withUpdate",
        type: "bool",
      },
    ],
    name: "set",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_emergency",
        type: "bool",
      },
    ],
    name: "setEmergency",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract ILMPoolDeployer",
        name: "_LMPoolDeployer",
        type: "address",
      },
    ],
    name: "setLMPoolDeployer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_operatorAddress",
        type: "address",
      },
    ],
    name: "setOperator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_periodDuration",
        type: "uint256",
      },
    ],
    name: "setPeriodDuration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_receiver",
        type: "address",
      },
    ],
    name: "setReceiver",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "tokenOfOwnerByIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalAllocPoint",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_newMultiplier",
        type: "uint256",
      },
    ],
    name: "updateBoostMultiplier",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_newFarmBoostContract",
        type: "address",
      },
    ],
    name: "updateFarmBoostContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
    ],
    name: "updateLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "pids",
        type: "uint256[]",
      },
    ],
    name: "updatePools",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_withUpdate",
        type: "bool",
      },
    ],
    name: "upkeep",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "userPositionInfos",
    outputs: [
      {
        internalType: "uint128",
        name: "liquidity",
        type: "uint128",
      },
      {
        internalType: "uint128",
        name: "boostLiquidity",
        type: "uint128",
      },
      {
        internalType: "int24",
        name: "tickLower",
        type: "int24",
      },
      {
        internalType: "int24",
        name: "tickUpper",
        type: "int24",
      },
      {
        internalType: "uint256",
        name: "rewardGrowthInside",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "reward",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "pid",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "boostMultiplier",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "v3PoolAddressPid",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

async function main() {
  const [owner] = await ethers.getSigners();
  // Get network data from Hardhat config (see hardhat.config.ts).
  const networkName = network.name;

  const config = configs[networkName as keyof typeof configs];
  if (!config) {
    throw new Error(`No config found for network ${networkName}`);
  }

  const mcV3Contract = new Contract("", abi, owner);
  try {
    await mcV3Contract.transferOwnership("");
  } catch (error) {
    console.error(error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
