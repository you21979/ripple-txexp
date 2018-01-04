'use strict'; 
//const MAX_LEDGER_HOLD = 300000
const MAX_LEDGER_HOLD = 100000

class RippleRequest{
    constructor(connect){
        this.api = connect
        this.max_ledger_hold = MAX_LEDGER_HOLD
    }
    async getBalance(address){
        return this.api.getBalances(address)
    }
    async getTransaction(txid){
        return this.api.getTransaction(txid)
    }
    async getTransactions(address){
        const ledger = await this.api.getLedger()
        return this.api.getTransactions(address, {minLedgerVersion:ledger.ledgerVersion - this.max_ledger_hold})
    }
    async getLedger(){
        return this.api.getLedger()
    }
    async getFee(){
        const result = await this.api.getFee()
        return parseFloat(result).toFixed(6)
    }
    async getServerInfo(){
        return this.api.getServerInfo()
    }
    async broadcast(signedtx){
        return this.api.submit(signedtx)
    }
}

module.exports = RippleRequest
