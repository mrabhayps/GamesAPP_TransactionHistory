const helper=require('../common/helper');
const transactionService= require('../service/transaction.service')
const Constant = require('../common/constant');

const getUserTxnHistory = async (req, res, next) => {
    try{

        const latest = req.query.latest;
        const userId = req.query.userId
        const txnHistoryType = req.query.txnHistoryType
        let page = +req.query.page || 0;
        let page_size = +req.query.page_size || 20;
        
        console.log(`Get Transaction History userId : ${userId},  Page: ${page} `);

        //Withdraw and Deposit
        const txnData = await transactionService.getTxnHistoryV2(userId, page, page_size,latest,txnHistoryType);
        if (txnData.error) {
            helper.sendJSON(res, txnData.data, txnData.error, 502, txnData.msg, txnData.count);
        } else {
            helper.sendJSON(res, txnData.data, txnData.error, 200, txnData.msg, txnData.count);
        }
        
    }catch(error){
        console.error("Error (getUserTxnHistory) : ", error)
        helper.sendJSON(res,[],true, 500,"We are unable to fetch transaction history.", 0);
    }    
}

module.exports = {
    getUserTxnHistory
}