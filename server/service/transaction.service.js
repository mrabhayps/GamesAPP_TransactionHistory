const sequelize = require('sequelize');
const models = require('../models/index');
const Constant = require('../common/constant');
const getTxnHistory = async function(userId, paginate=false, page=1, page_size=20,latest){
    let retData={};
    let data = [];
    try {
        let dateCond="";
        //let tgiName="";
        let tgeName="";
        if(latest==true){
            dateCond=" >= DATE_SUB(NOW(),INTERVAL 2 DAY)";
            //tgiName="gmsTableGameInitTrx";
            tgeName="gmsTableGameEndTrx";
        }
        else{
            dateCond=" < DATE_SUB(NOW(),INTERVAL 2 DAY)"
            //tgiName="gmsTableGameInitTrxC";
            tgeName="gmsTableGameEndTrxC";
        }

        page = page - 1;
        page = page < 0 ? 0 : page;
        const start = page_size * page;
        const selectColumns = `%s.id, %s.fkSenderId, %s.fkReceiverId, %s.amount, %s.payStatus, %s.requestType, %s.createdAt, %s.fkGameId, %s.gameEngine, %s.engineId, %s.pgRefNo`;
        //const selectTableGameInitColumns=`%s.id,%s.fkUserId as fkSenderId,500 as fkReceiverId,CONCAT(%s.amount,"-",%s.deposit,"-",%s.winning,"-",%s.bonus) as amount, %s.status as payStatus, 20 as requestType, %s.createdAt, %s.reqLog as fkGameId, 'tableGame' as gameEngine, null as engineId, %s.gameTxnId as pgRefNo`;
        const selectTableGameEndColumns=`%s.id,500 as fkSenderId,%s.fkUserId as fkReceiverId, CONCAT(%s.delta,'_',%s.deposit,'_',%s.winning,'_',%s.bonus) as amount, %s.status as payStatus, (CASE WHEN %s.delta>0 THEN 30 WHEN %s.delta < 0 THEN 50 ELSE 60 END ) requestType, %s.createdAt, %s.reqLog as fkGameId, 'tableGame' as gameEngine, null as engineId, %s.gameTxnId as pgRefNo`;
        const depostBonusColumns = `id, fkSenderId, fkReceiverId,  (CASE WHEN wallet='bdw' THEN amount ELSE sum(amount) END )  as amount, payStatus, requestType, createdAt, fkGameId, gameEngine, engineId, pgRefNo, wallet`;
        const tlbCols = selectColumns.replace(/%s/g, "tlb"),
            tldCols = selectColumns.replace(/%s/g, "tld"),
            tlwCols = selectColumns.replace(/%s/g, "tlw"),
            //tableInitCols = selectTableGameInitColumns.replace(/%s/g, "tgiTxn"),
            tableEndCols = selectTableGameEndColumns.replace(/%s/g, "tgeTxn");
        const limitQuery = paginate ? `LIMIT ${start}, ${page_size}` : "";

        data = await models.sequelize.query(`select ${depostBonusColumns} from (
            select ${tlbCols}, 'bonus' as wallet from gmsPaymentTransactionLogBonus tlb where (tlb.fkSenderId=${userId} or tlb.fkReceiverId=${userId}) AND tlb.createdAt ${dateCond}
            union all 
            select ${tldCols}, 'deposit' as wallet from gmsPaymentTransactionLogDeposit tld where (tld.fkSenderId=${userId} or tld.fkReceiverId=${userId}) AND tld.createdAt ${dateCond}
            union all 
            select ${tlwCols}, 'withdraw' as wallet from gmsPaymentTransactionLogWithdraw tlw where (tlw.fkSenderId=${userId} or tlw.fkReceiverId=${userId}) AND tlw.createdAt ${dateCond}
            union all
            select ${tableEndCols}, 'bdw' as wallet from ${tgeName} tgeTxn where tgeTxn.fkUserId=${userId} AND (tgeTxn.delta!=0 OR tgeTxn.reqLog LIKE('%"result":"refund-draw"%'))
            ) as CombinedTrxLog GROUP BY pgRefNo, fkSenderId ORDER BY createdAt DESC ${limitQuery};`, { type: sequelize.QueryTypes.SELECT });

        let count=0;
        if(latest==true){
            let countData = await models.sequelize.query(`select count(id) as cnt from (
                select ${tlbCols}, 'bonus' as wallet from gmsPaymentTransactionLogBonus tlb where (tlb.fkSenderId=${userId} or tlb.fkReceiverId=${userId}) AND tlb.createdAt ${dateCond}
                union all 
                select ${tldCols}, 'deposit' as wallet from gmsPaymentTransactionLogDeposit tld where (tld.fkSenderId=${userId} or tld.fkReceiverId=${userId}) AND tld.createdAt ${dateCond}
                union all 
                select ${tlwCols}, 'withdraw' as wallet from gmsPaymentTransactionLogWithdraw tlw where (tlw.fkSenderId=${userId} or tlw.fkReceiverId=${userId}) AND tlw.createdAt ${dateCond}
                union all
                select ${tableEndCols}, 'bdw' as wallet from ${tgeName} tgeTxn where tgeTxn.fkUserId=${userId} AND (tgeTxn.delta!=0 OR tgeTxn.reqLog LIKE('%"result":"refund-draw"%'))
                ) as CombinedTrxLog GROUP BY pgRefNo, fkSenderId `, { type: sequelize.QueryTypes.SELECT });
            count=countData.length;
        }

        data = await preparedTxnHistory(userId, data);
        retData.data=data;
        retData.count=data.length;
    } catch (error) {
        console.log("Error (getTxnHistory): ", error);
        return false;
    }
    return retData;
}

const getTxnHistoryV2 = async function(userId, page=1, page_size=20,latest,txnHistoryType){
    let retData={};

    retData.error=true;
    retData.msg=``;
    retData.data=[];
    retData.count= 0;
    
    let data = [];
    try {
        let dateCond="";
        let tgeName="";
        
        if(latest=="true"){
            dateCond=" >= DATE_SUB(NOW(),INTERVAL 2 DAY)";
            tgeName="gmsTableGameEndTrx";
        }
        else{
            dateCond=" < DATE_SUB(NOW(),INTERVAL 2 DAY)"
            tgeName="gmsTableGameEndTrxC";
        }

        page = page - 1;
        page = page < 0 ? 0 : page;
        const start = page_size * page;
        const selectColumnsBDW = `%s.id, %s.fkSenderId, %s.fkReceiverId, %s.amount, %s.payStatus, %s.requestType, %s.createdAt, %s.fkGameId, %s.gameEngine, %s.engineId, %s.pgRefNo, %s.description,%s.utrNo`;
        const selectColumnsTGE=`%s.id,500 as fkSenderId,%s.fkUserId as fkReceiverId, CONCAT(%s.delta,'_',%s.deposit,'_',%s.winning,'_',%s.bonus) as amount, %s.status as payStatus, (CASE WHEN %s.delta>0 THEN 30 WHEN %s.delta < 0 THEN 50 ELSE 60 END ) requestType, %s.createdAt, %s.reqLog as fkGameId, 'tableGame' as gameEngine, null as engineId, %s.gameTxnId as pgRefNo, 'No details found.' as description,'NA' as utrNo`;

        let OuterColumnsSelection ="";

        if(txnHistoryType==Constant.TxnHistoryType.WITHDRAWALS)
            OuterColumnsSelection = `id, fkSenderId, fkReceiverId,  (CASE WHEN wallet='tge' THEN amount WHEN (wallet='withdraw' AND (requestType=10 OR requestType=60 OR requestType=70))  THEN CONCAT(amount, '-' , COALESCE(tds,0)) ELSE sum(amount) END )  as amount, payStatus, requestType, createdAt, fkGameId, gameEngine, engineId, pgRefNo, wallet, description,utrNo`;
        else
            OuterColumnsSelection = `id, fkSenderId, fkReceiverId,  (CASE WHEN wallet='tge' THEN amount  ELSE sum(amount) END )  as amount, payStatus, requestType, createdAt, fkGameId, gameEngine, engineId, pgRefNo, wallet, description,utrNo`;
        
        let tlbCols = selectColumnsBDW.replace(/%s/g, "tlb"),
            tldCols = selectColumnsBDW.replace(/%s/g, "tld"),
            tlwCols = selectColumnsBDW.replace(/%s/g, "tlw"),
            tgeCols = selectColumnsTGE.replace(/%s/g, "tgeTxn");

        const limitQuery = `LIMIT ${start}, ${page_size}`;


        let txnHistoryTypeSelection="";
        if(txnHistoryType==Constant.TxnHistoryType.OTHERS){
           txnHistoryTypeSelection= `select ${tlbCols}, 'bonus' as wallet from gmsPaymentTransactionLogBonus tlb where (tlb.fkSenderId=${userId} or tlb.fkReceiverId=${userId}) AND  tlb.requestType in (${Constant.Payment.reqType.TLB.Rewards}, ${Constant.Payment.reqType.TLB.ScratchCard}, ${Constant.Payment.reqType.TLB.Streaks}, ${Constant.Payment.reqType.TLB.Referral}, ${Constant.Payment.reqType.TLB.Cashback}, ${Constant.Payment.reqType.TLB.ReferralDepositBonus}, ${Constant.Payment.reqType.TLB.GemsReedems},  ${Constant.Payment.reqType.TLB.GemsBonus}, ${Constant.Payment.reqType.TLB.WeeklyTop10UserBonus}) AND tlb.createdAt ${dateCond}
            UNION ALL 
            select ${tldCols}, 'deposit' as wallet from gmsPaymentTransactionLogDeposit tld where (tld.fkSenderId=${userId} or tld.fkReceiverId=${userId}) AND tld.requestType in (${Constant.Payment.reqType.TLD.Rewards}) AND tld.createdAt ${dateCond}
            UNION ALL
            select ${tlwCols}, 'withdraw' as wallet from gmsPaymentTransactionLogWithdraw tlw where (tlw.fkSenderId=${userId} or tlw.fkReceiverId=${userId}) AND tlw.requestType in (${Constant.Payment.reqType.TLW.Referral},  ${Constant.Payment.reqType.TLW.ReferralDepositBonusCreators}) AND tlw.createdAt ${dateCond}
           `;
        }
        else if(txnHistoryType==Constant.TxnHistoryType.DEPOSIT){
            txnHistoryTypeSelection= `select ${tldCols}, 'deposit' as wallet from gmsPaymentTransactionLogDeposit tld where (tld.fkSenderId=${userId} or tld.fkReceiverId=${userId}) AND tld.requestType in (${Constant.Payment.reqType.TLD.Inward}, ${Constant.Payment.reqType.TLD.TokenPurchase}, ${Constant.Payment.reqType.TLD.AutoRefill}) AND tld.createdAt ${dateCond}`;
        }
        else if(txnHistoryType==Constant.TxnHistoryType.WITHDRAWALS){
            txnHistoryTypeSelection= `select ${tlwCols}, 'withdraw' as wallet,tds from gmsPaymentTransactionLogWithdraw tlw where (tlw.fkSenderId=${userId} or tlw.fkReceiverId=${userId}) AND tlw.requestType in (${Constant.Payment.reqType.TLW.Outward}, ${Constant.Payment.reqType.TLW.RefundOutwardAfterFailed}, ${Constant.Payment.reqType.TLW.RejectOutward}) AND tlw.createdAt ${dateCond}`;
        }
        else if(txnHistoryType==Constant.TxnHistoryType.GAMES){
            txnHistoryTypeSelection= 
            `select ${tgeCols}, 'tge' as wallet from ${tgeName} tgeTxn where tgeTxn.fkUserId=${userId} AND (tgeTxn.delta!=0 OR tgeTxn.reqLog LIKE('%"result":"refund-draw"%'))
             UNION ALL
             select ${tlbCols}, 'bonus' as wallet from gmsPaymentTransactionLogBonus tlb where (tlb.fkSenderId=${userId} or tlb.fkReceiverId=${userId}) AND tlb.gameEngine !=3 AND tlb.requestType in (${Constant.Payment.reqType.TLB.GamePlay}, ${Constant.Payment.reqType.TLB.GameRefund}, ${Constant.Payment.reqType.TLB.TFGRefund}) AND tlb.createdAt ${dateCond}  
             UNION ALL
             select ${tldCols}, 'deposit' as wallet from gmsPaymentTransactionLogDeposit tld where (tld.fkSenderId=${userId} or tld.fkReceiverId=${userId}) AND tld.gameEngine !=3 AND tld.requestType in (${Constant.Payment.reqType.TLD.GamePlay}, ${Constant.Payment.reqType.TLD.GameRefund}, ${Constant.Payment.reqType.TLD.TFGRefund}, ${Constant.Payment.reqType.TLD.WinningPrize}) AND tld.createdAt ${dateCond}
             UNION ALL
             select ${tlwCols}, 'withdraw' as wallet from gmsPaymentTransactionLogWithdraw tlw where (tlw.fkSenderId=${userId} or tlw.fkReceiverId=${userId}) AND tlw.gameEngine !=3 AND tlw.requestType in (${Constant.Payment.reqType.TLW.GamePlay}, ${Constant.Payment.reqType.TLW.TFGRefundToPlAc}, ${Constant.Payment.reqType.TLW.RefundToPlAc}, ${Constant.Payment.reqType.TLW.WinningPrize}) AND tlw.createdAt ${dateCond} 
            `;
        }
        else{
            //TxnHistoryType is not valid.
            retData.error=false;
            retData.msg=`Unable to list txn history for ${txnHistoryType} error : Invalid txn history type . . . `;
            return retData;
        }

        data = await models.sequelize.query(`select ${OuterColumnsSelection}
            from (${txnHistoryTypeSelection}) as CombinedTrxLog 
            GROUP BY pgRefNo, fkSenderId ORDER BY createdAt DESC ${limitQuery};`,
            { type: sequelize.QueryTypes.SELECT }
        );

        let count=0;
        if(latest=="true"){
            let countData = await models.sequelize.query(`select count(id) as cnt 
                from ( ${txnHistoryTypeSelection} ) as CombinedTrxLog 
                GROUP BY pgRefNo, fkSenderId `, 
                { type: sequelize.QueryTypes.SELECT });

            count=countData.length;
        }

        data = await preparedTxnHistory(userId, data);

        retData.error=false;
        retData.msg=`Txn history listed successfully for ${txnHistoryType}. . .`;
        retData.data=data;
        retData.count= count;
    } catch (error) {
        console.log("Error (getTxnHistory): ", error);
        retData.error=true;
        retData.msg=`Unable to list txn history for ${txnHistoryType} error : ${error.message}. . . `;
    }
    return retData;
}



const preparedTxnHistory = async function (userId, data){
    let result= [];
    for (let trxData of data) {
        try {
            trxData["id"] = "GAP_" + trxData["id"];

            //trxType Credit/Debit
            if (trxData["fkSenderId"] == userId){
                trxData["trxType"] = "10";
                trxData["trxTypeMsg"] = "DEBIT";
            }
            else if (trxData["fkReceiverId"] == userId){
                trxData["trxType"] = "20";
                trxData["trxTypeMsg"] = "CREDIT";
            }
            else{
                trxData["trxType"] = "--";
                trxData["trxTypeMsg"] = "--";
            }
            trxData["utrNo"]=trxData["utrNo"]?trxData["utrNo"]:"NA";

            let gameName;
            let trxDetails;
            
            //Prepared data for TableFormat Game.
            if(trxData["gameEngine"] == "tableGame"){

                let reqData=JSON.parse(trxData["fkGameId"]);
                let amountData=trxData["amount"].split("_");
                

                trxData["pgRefNo"]=trxData["pgRefNo"] + "/" + reqData['gameRoundIdGS'];
                trxData["gameEngine"]=Constant.GameEngine.TableFormatGame;
                trxData['description']=reqData['description']? reqData['description'] : trxData['description'];
                trxData["gameName"] = reqData['gameId']?await getGameName(reqData['gameId'], Constant.GameEngine.TableFormatGame, reqData['gameTypeId']):"Ludo";
                trxData["fkGameId"]=reqData['gameId']?reqData['gameId']:11; //Gameid:11 is for ludo.
                trxData["requestTypeMsg"]=Constant.Payment.reqType.TABLE_GAME[trxData['requestType']];
            
                
                trxData["payStatus"]=trxData["payStatus"]==Constant.TABLE_TRX.END['TO-DO']?Constant.Payment.payStatus.TLW.Failed:Constant.Payment.payStatus.TLW.Success;
                trxData["payResult"] = trxData["payStatus"]==10?"SUCCESS":"FAILED";

                if(trxData['requestType']==50){
                    trxData["trxType"] = "10";
                    trxData["trxTypeMsg"] = "DEBIT";
                    trxData['amount']=amountData[0];

                    trxData['trxDetails'] = [
                        {
                            "wallet": "DEPOSIT",
                            "amount": +amountData[1] + +amountData[3]
                        },
                        {
                            "wallet": "WINNINGS",
                            "amount": +amountData[2]
                        },
                    ]
                }
                else if(trxData['requestType'] == 60 ){
                    trxData["trxType"] = "20";
                    trxData["trxTypeMsg"] = "CREDIT";
                    trxData['amount']=0;

                    trxData['trxDetails'] = [
                        {
                            "wallet": "DEPOSIT",
                            "amount": 0 
                        },
                        {
                            "wallet": "WINNINGS",
                            "amount": 0 
                        },
                    ]
                }
                else{
                    trxData['amount']=amountData[2];
                    trxData["trxType"] = "20";
                    trxData["trxTypeMsg"] = "CREDIT";

                    trxData['trxDetails'] = [
                        {
                            "wallet": "DEPOSIT",
                            "amount": 0
                        },
                        {
                            "wallet": "WINNINGS",
                            "amount": amountData[2]
                        },
                    ]
                }
            }
            else//Prepare data for BDW txn.
            {
                trxData["gameName"] = await getGameName(trxData["fkGameId"], trxData["gameEngine"], trxData["engineId"]);
                trxData["requestTypeMsg"] = await getRequestTypeMsg(trxData["wallet"], trxData["requestType"], trxData["gameEngine"], gameName);
                trxData["payResult"] = await getPayResultMsg(trxData["payStatus"]);

                if(trxData['wallet']=="withdraw"){
                    let tdsAndAmount=trxData['amount'].split("-");
                    
                    trxData['amount']= +tdsAndAmount[0] + (tdsAndAmount[1]? +tdsAndAmount[1] : 0);
                    trxData['trxDetails'] = [
                        {
                            "wallet": "DEPOSIT",
                            "amount": 0
                        },
                        {
                            "wallet": "WINNINGS",
                            "amount": tdsAndAmount[0],
                            "tds":tdsAndAmount[1]?tdsAndAmount[1]:0
                        },
                    ]
                }
                else{
                    trxDetails = await getTransactionDetails(userId, trxData['pgRefNo'], parseInt(trxData['requestType']), trxData['wallet'], trxData['amount'], trxData['fkGameId']);
                    trxData['trxDetails'] = [
                        {
                            "wallet": "DEPOSIT",
                            "amount": trxDetails.deposit
                        },
                        {
                            "wallet": "WINNINGS",
                            "amount": trxDetails.withdraw
                        },
                    ]
                }
                
                
                trxData["description"]=trxData["description"]?trxData["description"]:"No details found.";
            }
            
            result.push(trxData);
        } catch (error) {
            console.error("createTrxHistoryV2: ", error);
        }
    }// End of for loop.
    return result;
}


const getGameName= async function(gameId, gameEngine, engineId){
    let gameName;
    if (gameEngine == Constant.GameEngine.Battle || gameEngine == Constant.GameEngine.Tournament) {
        let gameList = global.GAME_LIST;
        let battleList = global.BATTLE_LIST;

        let gameData = gameList.filter(game=>game['id']==gameId);
        let battleData = battleList.filter(battle=>battle['id']==engineId);

        const name = gameData[0]['name']; //await CommonUtils.getColValue("gmsGames", "name", { "id": gameId });
        const title = battleData[0]?battleData[0]['title']:""; //await CommonUtils.getColValue("gmsBattle", "title", { "id": engineId });
        gameName = `${name} (${title})`;
    } else if (gameEngine == Constant.GameEngine.CricketFantacy) {

        let matchTitle = await models.sequelize1.query(`select shortTitle 
            FROM gmsFantacyCricketMatch  
            WHERE matchId= ${gameId}`, 
        { type: sequelize.QueryTypes.SELECT });
        const name = matchTitle && matchTitle.length>0 ? matchTitle[0]['shortTitle'] : "-";

        let matchContest = await models.sequelize1.query(`select title 
            FROM gmsFantacyCricketContest  
            WHERE id= ${engineId}`, 
        { type: sequelize.QueryTypes.SELECT });

        const title = matchContest && matchContest.length > 0 ? matchContest[0]['title']:"-"

        gameName = `${name} (${title})`;
    } else if (gameEngine == Constant.GameEngine.TableFormatGame) {

        let gameList = global.GAME_LIST;
        let gameData = gameList.filter(game=>game['id']==gameId);
        const name = gameData[0]['name']; //await CommonUtils.getColValue("gmsGames", "name", { "id": gameId });
        gameName = `${name}`;
    }
    return gameName;
}

const getRequestTypeMsg= async function(wallet, requestType, gameEngine, gameId){
    let type = "";
    if (wallet == "bonus") {
        if (requestType == Constant.Payment.reqType.TLB.Inward)
            type = "Cash Deposit";
        else if (requestType == Constant.Payment.reqType.TLB.GamePlay && gameId == Constant.tableGames.rummy.id)
            type = "Lost ";
        else if (requestType == Constant.Payment.reqType.TLB.GamePlay)
            type = "Entry Fee";
        else if (requestType == Constant.Payment.reqType.TLB.Rewards)
            type = "Joining Bonus Credited";
        else if (requestType == Constant.Payment.reqType.TLB.GameRefund)
            type = "Refund";
        else if (requestType == Constant.Payment.reqType.TLB.TFGRefund)
            type = "Game Refund";
        else if (requestType == Constant.Payment.reqType.TLB.TokenPurchase)
            type = "Token Purchase";
        else if (requestType == Constant.Payment.reqType.TLB.ScratchCard)
            type = "Scratch Card Reward";
        else if (requestType == Constant.Payment.reqType.TLB.Streaks)
            type = "Streaks";
        else if (requestType == Constant.Payment.reqType.TLB.Referral)
            type = "Referral Bonus Credited";
        else if (requestType == Constant.Payment.reqType.TLB.Cashback)
            type = "Cashback Credited";
        else if (requestType == Constant.Payment.reqType.TLB.ReferralDepositBonus)
            type = "Referral Bonus Credited";
        else if (requestType == Constant.Payment.reqType.TLB.GemsReedems)
            type = "Gems Redeemed";
        else if (requestType == Constant.Payment.reqType.TLB.GemsBonus)
            type = "Bonus Credited";
        else if (requestType == Constant.Payment.reqType.TLB.WeeklyTop10UserBonus)
            type = "Leaderboard Weekly Bonus";
        else
            type = "Invalid Request Type";
    } else if (wallet == "deposit") {
        if (requestType == Constant.Payment.reqType.TLD.Inward)
            type = "Cash Deposit";
        else if (requestType == Constant.Payment.reqType.TLB.GamePlay && gameId == Constant.tableGames.rummy.id)
            type = "Lost";
        else if (requestType == Constant.Payment.reqType.TLD.GamePlay)
            type = "Entry Fee";
        else if (requestType == Constant.Payment.reqType.TLD.Rewards)
            type = "Joining Bonus Credited";
        else if (requestType == Constant.Payment.reqType.TLD.GameRefund)
            type = "Refund";
        else if (requestType == Constant.Payment.reqType.TLD.TFGRefund)
            type = "Game Refund";
        else if (requestType == Constant.Payment.reqType.TLD.TokenPurchase)
            type = "Token Purchase";
        else if (requestType == Constant.Payment.reqType.TLD.WinningPrize && gameId == Constant.tableGames.rummy.id)
            type = "Won";
        else if (requestType == Constant.Payment.reqType.TLD.WinningPrize)
            type = "Winning Amount";
        else
            type = "Invalid Request Type";
    } else if (wallet == "withdraw") {
        if (requestType == Constant.Payment.reqType.TLW.Outward)
            type = "Cash Withdraw";
        else if (requestType == Constant.Payment.reqType.TLB.GamePlay && gameId == Constant.tableGames.rummy.id)
            type = "Lost";
        else if (requestType == Constant.Payment.reqType.TLW.GamePlay)
            type = "Entry Fee";
        else if (requestType == Constant.Payment.reqType.TLW.WinningPrize && gameId == Constant.tableGames.rummy.id)
            type = "Won";
        else if (requestType == Constant.Payment.reqType.TLW.WinningPrize)
            type = "Winning Amount";
        else if (requestType == Constant.Payment.reqType.TLW.CommissionCharge)
            type = "Commission";
        else if (requestType == Constant.Payment.reqType.TLW.RefundToPlAc)
            type = "Refund";
        else if (requestType == Constant.Payment.reqType.TLW.TFGRefundToPlAc)
            type = "Game Refund";
        else if (requestType == Constant.Payment.reqType.TLW.RefundOutwardAfterFailed || requestType == Constant.Payment.reqType.TLW.RejectOutward)
            type = "Withdraw Refund";
        else if (requestType == Constant.Payment.reqType.TLW.Referral)
            type = "Referral Bonus Credited";
        else if (requestType == Constant.Payment.reqType.TLW.ReferralDepositBonusCreators)
            type = "Creator Bonus Credited";
        else
            type = "Invalid Request Type";
    }else if (wallet == "tge") {
        if (requestType == Constant.Payment.reqType.TLW.GamePlay)
            type = "Entry Fee";
        else if (requestType == Constant.Payment.reqType.TLW.WinningPrize)
            type = "Won";
        else if (requestType == Constant.Payment.reqType.TLW.RefundToPlAc)
            type = "Refund";
        else if (requestType == Constant.Payment.reqType.TLW.RefundOutwardAfterFailed)
            type = "Withdraw Refund";
        else if (requestType == Constant.Payment.reqType.TLW.Referral)
            type = "Refer & Earn Bonus";
        else
            type = "Invalid Request Type";
    }
    return type;
}

const getPayResultMsg= async function(payStatus) {
    let payResult= "";
    if (payStatus == 10)
        payResult = "SUCCESS";
    else if (payStatus == 20)
        payResult = "FAILED";
    else if (payStatus == 30)
        payResult = "PENDING";
    else if(payStatus == 50)
        payResult = "APPROVAL PENDING";
    else
        payResult = "";
    return payResult;
}


const getTransactionDetails= async function(userId, pgRefNo, requestType, wallet, amount, gameId) {
    let result = {
        deposit: 0,
        withdraw: 0
    };

    try {
        const selectColumns = `%s.id, %s.fkSenderId, %s.fkReceiverId, %s.amount, %s.payStatus, %s.requestType, %s.createdAt, %s.fkGameId, %s.gameEngine, %s.engineId, %s.pgRefNo`;
        const depostBonusColumns = `id, fkSenderId, fkReceiverId, amount, payStatus, requestType, createdAt, fkGameId, gameEngine, engineId, pgRefNo, wallet`;
        const tlbCols = selectColumns.replace(/%s/g, "tlb"),
            tldCols = selectColumns.replace(/%s/g, "tld"),
            tlwCols = selectColumns.replace(/%s/g, "tlw");

        let data = [];
        
        if ([Constant.Payment.reqType.TLB.WinningPrize, Constant.Payment.reqType.TLD.WinningPrize, Constant.Payment.reqType.TLW.WinningPrize].indexOf(requestType) >= 0) {
            data = await models.sequelize.query(`SELECT ${depostBonusColumns} FROM (
                SELECT ${tlbCols}, 'bonus' AS wallet FROM gmsPaymentTransactionLogBonus tlb WHERE (tlb.fkSenderId=${userId} OR tlb.fkReceiverId=${userId}) AND tlb.pgRefNo='${pgRefNo}' AND tlb.requestType=${Constant.Payment.reqType.TLB.WinningPrize}
                UNION ALL 
                SELECT ${tldCols}, 'deposit' AS wallet FROM gmsPaymentTransactionLogDeposit tld WHERE (tld.fkSenderId=${userId} OR tld.fkReceiverId=${userId}) AND tld.pgRefNo='${pgRefNo}' AND tld.requestType=${Constant.Payment.reqType.TLD.WinningPrize}
                UNION ALL 
                SELECT ${tlwCols}, 'withdraw' AS wallet FROM gmsPaymentTransactionLogWithdraw tlw WHERE (tlw.fkSenderId=${userId} OR tlw.fkReceiverId=${userId}) AND tlw.pgRefNo='${pgRefNo}' AND tlw.requestType=${Constant.Payment.reqType.TLW.WinningPrize}
                ) AS paymentLog ORDER BY createdAt DESC;`, { type: sequelize.QueryTypes.SELECT });

        } else if (requestType == Constant.Payment.reqType.TLD.GamePlay) {
            data = await models.sequelize.query(`SELECT ${depostBonusColumns} FROM (
                SELECT ${tlbCols}, 'bonus' AS wallet FROM gmsPaymentTransactionLogBonus tlb WHERE (tlb.fkSenderId=${userId} OR tlb.fkReceiverId=${userId}) AND tlb.pgRefNo='${pgRefNo}' AND tlb.requestType=${Constant.Payment.reqType.TLB.GamePlay}
                UNION ALL 
                SELECT ${tldCols}, 'deposit' AS wallet FROM gmsPaymentTransactionLogDeposit tld WHERE (tld.fkSenderId=${userId} OR tld.fkReceiverId=${userId}) AND tld.pgRefNo='${pgRefNo}' AND tld.requestType=${Constant.Payment.reqType.TLD.GamePlay}
                UNION ALL 
                SELECT ${tlwCols}, 'withdraw' AS wallet FROM gmsPaymentTransactionLogWithdraw tlw WHERE (tlw.fkSenderId=${userId} OR tlw.fkReceiverId=${userId}) AND tlw.pgRefNo='${pgRefNo}' AND tlw.requestType=${Constant.Payment.reqType.TLW.GamePlay}
                ) AS paymentLog ORDER BY createdAt DESC;`, { type: sequelize.QueryTypes.SELECT });

        } else if ([Constant.Payment.reqType.TLB.GameRefund, Constant.Payment.reqType.TLD.GameRefund, Constant.Payment.reqType.TLW.RefundToPlAc].indexOf(requestType) >= 0) {
            data = await models.sequelize.query(`SELECT ${depostBonusColumns} FROM (
                SELECT ${tlbCols}, 'bonus' AS wallet FROM gmsPaymentTransactionLogBonus tlb WHERE (tlb.fkSenderId=${userId} OR tlb.fkReceiverId=${userId}) AND tlb.pgRefNo='${pgRefNo}' AND tlb.requestType=${Constant.Payment.reqType.TLB.GameRefund}
                UNION ALL 
                SELECT ${tldCols}, 'deposit' AS wallet FROM gmsPaymentTransactionLogDeposit tld WHERE (tld.fkSenderId=${userId} OR tld.fkReceiverId=${userId}) AND tld.pgRefNo='${pgRefNo}' AND tld.requestType=${Constant.Payment.reqType.TLD.GameRefund}
                UNION ALL 
                SELECT ${tlwCols}, 'withdraw' AS wallet FROM gmsPaymentTransactionLogWithdraw tlw WHERE (tlw.fkSenderId=${userId} OR tlw.fkReceiverId=${userId}) AND tlw.pgRefNo='${pgRefNo}' AND tlw.requestType=${Constant.Payment.reqType.TLW.RefundToPlAc}
                ) AS paymentLog ORDER BY createdAt DESC;`, { type: sequelize.QueryTypes.SELECT });
        }

        if (data && data.length > 0) {
            for (const item of data) {
                if (item['wallet'] == "deposit" || item['wallet'] == "bonus") {
                    result.deposit += item['amount'];
                } else if (item['wallet'] == 'withdraw') {
                    result.withdraw += item['amount'];
                }
            }
        } else {
            if (wallet == 'deposit' || wallet == 'bonus') {
                result.deposit = amount;
            } else if (wallet == 'withdraw') {
                result.withdraw = amount;
            }
        }
        return result;
    } catch (error) {
        console.log("Error - (getTransactionDetails): ", error);
        return result;
    }
}



module.exports={
    getTxnHistory,
    getTxnHistoryV2
}