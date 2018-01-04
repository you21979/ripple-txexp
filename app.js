const fastify = require('fastify')()
const rippleConnect = require("./ripple_connect")
const RippleRequest = require("./ripple_request")
const moment = require("moment")

let s_conn = null

const rippleTemplate2 = async (req, reply, handler) => {
    const txid = req.params.txid
    return getRippleConn().then(async(conn) => {
        try{
            const api = new RippleRequest(conn)
            const result = await handler(api)
            releaseRippleConn(conn)
            reply.type('text/plain').code(200)
            return result
        }catch(e){
            releaseRippleConn(conn)
            reply.type('application/json').code(500)
            return { status : 0 , message : e.message}
        }
    })
}

const rippleTemplate = async (req, reply, handler) => {
    const txid = req.params.txid
    return getRippleConn().then(async(conn) => {
        try{
            const api = new RippleRequest(conn)
            const result = await handler(api)
            releaseRippleConn(conn)
            reply.type('application/json').code(200)
            return { status : 1, result : result }
        }catch(e){
            releaseRippleConn(conn)
            reply.type('application/json').code(500)
            return { status : 0 , message : e.message}
        }
    })
}

const rippleInitialize = async() => {
    const conn = rippleConnect("wss://s1.ripple.com", (code) => {
        conn.connect()
    })
    await conn.connect()
    s_conn = conn
}

const releaseRippleConn = (conn) => {
}

const getRippleConn = async() => {
    return s_conn
}

fastify.get('/txs/:address', async (req, reply) => {
    const address = req.params.address
    return await rippleTemplate2(req, reply, async(api) => {
        const list = await api.getTransactions(address)
        return list.map(v =>
            [ moment(new Date(v.outcome.timestamp)).format("YYYY-MM-DD HH:mm:ss"), v.outcome.result, v.id, v.specification.destination.address, v.specification.destination.amount.value ].join(',')
        ).join("\n")
    })
})

fastify.get('/api/tx/:txid', async (req, reply) => {
    const txid = req.params.txid
    return await rippleTemplate(req, reply, async(api) => {
        const tx = await api.getTransaction(txid)
        return tx
    })
})

fastify.get('/api/history/:address', async (req, reply) => {
    const address = req.params.address
    return await rippleTemplate(req, reply, async(api) => {
        const list = await api.getTransactions(address)
        return list
    })
})

fastify.get('/api/ledger', async (req, reply) => {
    return await rippleTemplate(req, reply, async(api) => {
        const res = await api.getLedger()
        return res 
    })
})

const main = async() => {
    await rippleInitialize()
    fastify.listen(3000, function (err) {
        if (err) throw err
        console.log(`server listening on ${fastify.server.address().port}`)
    })
}

main()


