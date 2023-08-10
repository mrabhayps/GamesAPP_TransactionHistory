module.exports = {
    USER_GAMEPLAY_GRAPH:{
        "PLAY":1,
        "WIN":2,
        "LOSE":3,
        "DRAW":4
    },
    GameEngine : {
        "Battle": 1,
        "Tournament": 2,
        "CricketFantacy": 3,
        "TableFormatGame": 4
    },
    TABLE_TRX :{
        "INIT":{
            "TO-DO":10,
            "PROCESSED":20,
            "FAILED":30
        },
        "END":{
            "TO-DO":10,
            "PROCESSED":20
        }
    },
    Payment :{
        "AccType": {
            "Deposit": 10,
            "Withdraw": 20,
            "Token": 30,
            "Bonus": 40,
            "Coins": 50,
            "Referral": 60
        },
        "BAL_KEY":{
            "10":"depositBal",
            "20":"withdrawalBal",
            "30":"tokenBal",
            "40":"bonusBal",
            "50":"coinBal",
            "60":"referralBal",
        },
        "trxType": {
            "Credit": 1,
            "Debit": 2
        },
        "trxTypeNew": {
            "Credit": "inc",
            "Debit": "dec"
        },
        "reqType": {
            "TLD": {
                "Inward": 10,
                "GamePlay": 20,
                "Rewards": 30,
                "GameRefund": 40,
                "TFGRefund": 42,
                "TokenPurchase": 50,
                "WinningPrize": 60,
                "AutoRefill": 100
            },
            "TLW": {
                "Outward": 10,
                "GamePlay": 20,
                "WinningPrize": 30,
                "CommissionCharge": 40,
                "TFGRefundToPlAc": 42,
                "RefundToPlAc": 50,
                "RefundOutwardAfterFailed": 60,
                "RejectOutward": 70,
                "AutoRefill": 100,
                "Referral": 120,
                "ReferralDepositBonusCreators" : 122
            },
            "TLT": {
                "Rewards": 10,
                "GamePlay": 20,
                "TokenPurchase": 30
            },
            "TLB": {
                "Inward": 10,
                "GamePlay": 20,
                "Rewards": 30,
                "GameRefund": 40,
                "TFGRefund": 42,
                "TokenPurchase": 50,
                "WinningPrize": 60,
                "ScratchCard": 70,
                "AutoRefill": 100,
                "Streaks": 110,
                "Referral": 120,
                "ReferralDepositBonus" : 123,
                "GemsReedems": 125,
                "GemsBonus": 126,
                "WeeklyTop10UserBonus": 127,
                "Cashback": 150
            },
            "TLC": {
                "Inward": 10,
                "Outward": 30,
                "GameRefund": 40,
                "CommissionCharge": 50,
                "WinningPrize": 60,
                "InGameCredit": 80,
                "InGameDebit": 90,
                "AutoRefill": 100
            },
            "TLR": {
                "Inward": 10,
                "Rewards": 30,
                "WinningPrize": 60
            },
            "TABLE_GAME": {
                20:"Entry Fee",
                30:"Won",
                40:"Refund",
                50:"Lost",
                60:"Refund Draw"
            }
        },
        "payStatus": {
            "TLD": {
                "Success": 10,
                "Failed": 20,
                "Pending": 30
            },
            "TLW": {
                "Success": 10,
                "Failed": 20,
                "Pending": 30,
                "ManualRefund": 40,
                "PendingForApproval": 50,
            },
            "TLT": {
                "Success": 10,
                "Failed": 20,
                "Pending": 30
            },
            "TLB": {
                "Success": 10,
                "Failed": 20,
                "Pending": 30
            },
            "TLC": {
                "Success": 10,
                "Failed": 20,
                "Pending": 30
            },
            "TLR": {
                "Success": 10,
                "Failed": 20,
                "Pending": 30
            }
        },
        "PG": {
            "IndusInd": 1,
            "PayTM": 2,
            "PayU": 3,
            "CASHFREE":4
        },
        "AccStatus": {
            "Active": 1,
            "Inactive": 0
        }
    },
    TxnHistoryType :{
        "GAMES":"games",
        "DEPOSIT":"deposit",
        "WITHDRAWALS":"withdrawals",
        "OTHERS":"others"
    },
    tableGames :{
        "rummy": {
            "id": 2,
            "commission": 10
        },
        "ludo": {
            "id": 11,
            "commission": 5
        },
        "poker": {
            "id": 14,
            "commission": 5
        },
        "guessANumber": {
            "commission": 0
        },
        "standard": {
            "commission": 10
        },
        "default": {
            "commission": 10
        }
    }
}