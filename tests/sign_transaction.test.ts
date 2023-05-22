import { expect } from 'chai'
import { Speculos } from '../src/speculos'
import { decodeSignature, encodeSignTx } from '../src/ledger'
import { verifySignature, publicKey, findNextScreen, ensureScreen } from './utils'
import { address, Transaction} from 'thor-devkit'
import { randomBytes } from 'crypto'

const backend = 'http://localhost:5001'
const client = new Speculos(backend)

describe('sign transaction', () => {
    before(async () => {
        // enable contract data
        await client.button('right', 'press-and-release')
        await client.button('both', 'press-and-release')
        await client.button('both', 'press-and-release')
        await client.button('right', 'press-and-release')
        await client.deleteEvents()
        await client.button('both', 'press-and-release')
        const { events } = await client.getEvents()
        // nanox does not return to home when click back in settings sub menu
        if (events[events.length - 1].text !== 'is ready') {
            await client.button('right', 'press-and-release')
            await client.button('right', 'press-and-release')
            await client.button('both', 'press-and-release')
        }

        // multi clause
        await client.button('right', 'press-and-release')
        await client.button('both', 'press-and-release')
        await client.button('right', 'press-and-release')
        await client.button('both', 'press-and-release')
        await client.button('right', 'press-and-release')
        await client.button('both', 'press-and-release')
        // nanox does not return to home when click back in settings sub menu
        if (events[events.length - 1].text !== 'is ready') {
            await client.button('right', 'press-and-release')
            await client.button('right', 'press-and-release')
            await client.button('both', 'press-and-release')
        }
        await client.autoSignTransaction()
    })

    it('transaction', async () => {
        const recipient = '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed'

        const body: Transaction.Body = {
            chainTag: 0x9a,
            blockRef: '0x0000000000000000',
            expiration: 32,
            clauses: [{
                to: recipient,
                value: '1'+'0'.repeat(18),
                data: '0x'
            }],
            gasPriceCoef: 0,
            gas: 21000,
            dependsOn: null,
            nonce: 12345678
        }
        const encoded = (new Transaction(body)).encode()
        await client.deleteEvents()
        const res = await client.exchange(encodeSignTx(encoded))
        const { events } = await client.getEvents()
        const signature = decodeSignature(res)


        let to = ''
        for (const [i, e] of events.entries()) {
            if (e.text === 'Amount') {
                if (events[i + 2].text === 'Address') {
                    to = `${events[i+3].text}${events[i+4].text}${events[i+5].text}`
                } else {
                    // nanos
                    to =  `${events[i+3].text}${events[i+5].text}${events[i+7].text}`
                }
            }
        }

        expect(verifySignature(encoded,signature, publicKey)).to.be.true
        expect(findNextScreen(events, 'Max Fees')).equals('VTHO 0.21')
        expect(to).equals(address.toChecksumed(recipient))
    })

    it('transaction with data', async () => {
        const body: Transaction.Body = {
            chainTag: 0x9a,
            blockRef: '0x0000000000000000',
            expiration: 32,
            clauses: [{
                to: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
                value: '1'+'0'.repeat(18),
                data: '0xdd'
            }],
            gasPriceCoef: 0,
            gas: 21000,
            dependsOn: null,
            nonce: 12345678
        }
        const encoded = (new Transaction(body)).encode()
        await client.deleteEvents()
        const res = await client.exchange(encodeSignTx(encoded))
        const { events } = await client.getEvents()
        const signature = decodeSignature(res)

        expect(verifySignature(encoded, signature, publicKey)).to.be.true
        expect(events[3].text).equals('Data present')
    })

    it('transaction with multi clause', async () => {
        const body: Transaction.Body = {
            chainTag: 0x9a,
            blockRef: '0x0000000000000000',
            expiration: 32,
            clauses: [{
                to: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
                value: '1'+'0'.repeat(18),
                data: '0x'
            },{
                to: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
                value: '1'+'0'.repeat(18),
                data: '0x'
            }],
            gasPriceCoef: 0,
            gas: 21000,
            dependsOn: null,
            nonce: 12345678
        }
        const encoded = (new Transaction(body)).encode()
        await client.deleteEvents()
        const res = await client.exchange(encodeSignTx(encoded))
        const { events } = await client.getEvents()
        const signature = decodeSignature(res)

        expect(verifySignature(encoded, signature, publicKey)).to.be.true
        expect(events[3].text).equals('Multiple Clauses')
    })
    it('transaction with multi clause and data', async () => {
        const body: Transaction.Body = {
            chainTag: 0x9a,
            blockRef: '0x0000000000000000',
            expiration: 32,
            clauses: [{
                to: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
                value: '1'+'0'.repeat(18),
                data: '0xdd'
            },{
                to: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
                value: '1'+'0'.repeat(18),
                data: '0x'
            }],
            gasPriceCoef: 0,
            gas: 21000,
            dependsOn: null,
            nonce: 12345678
        }
        const encoded = (new Transaction(body)).encode()
        await client.deleteEvents()
        const res = await client.exchange(encodeSignTx(encoded))
        const { events } = await client.getEvents()
        const signature = decodeSignature(res)

        console.log(events[3])
        console.log(events[5])
        expect(verifySignature(encoded, signature, publicKey)).to.be.true
        expect(ensureScreen(events, 'Data present')).to.be.true
        expect(ensureScreen(events, 'Multiple Clauses')).to.be.true
    })

    const simple: Buffer[] = []

    // chainTag blockRef expiration  gasPriceCoef gas(uint64) dependsOn   nonce   recipient amount
    // 1byte    8bytes    4bytes       1byte        4bytes     32 bytes   8 bytes  20bytes 1byte
    for (let i = 0; i < 20; i++){
        simple.push(randomBytes(79))
    }

    simple.forEach((input, i) => {
        it('simple ' + i, async () => {
            const body: Transaction.Body = {
                chainTag: input.readUint8(0),
                blockRef: '0x' + input.subarray(1, 1 + 8).toString('hex'),
                expiration: input.readUint32BE(9),
                clauses: [{
                    to: '0x' + input.subarray(58, 58+20).toString('hex'),
                    value: input.readUint8(78).toString()+'0'.repeat(18),
                    data: '0x'
                }],
                gasPriceCoef: input.readUint8(13),
                gas: input.readUint32BE(14),
                dependsOn: i%3==0?null: '0x'+input.subarray(18, 18+32).toString('hex'),
                nonce: input.readBigUint64BE(50).toString()
            }
            const encoded = (new Transaction(body)).encode()
            await client.deleteEvents()
            const res = await client.exchange(encodeSignTx(encoded))
            const signature = decodeSignature(res)
    
            expect(verifySignature(encoded, signature, publicKey)).to.be.true
        })
    })

    simple.forEach((input, i) => {
        it('with data ' + i, async () => {
            const body: Transaction.Body = {
                chainTag: input.readUint8(0),
                blockRef: '0x' + input.subarray(1, 1 + 8).toString('hex'),
                expiration: input.readUint32BE(9),
                clauses: [{
                    to: '0x' + input.subarray(58, 58+20).toString('hex'),
                    value: input.readUint8(78).toString()+'0'.repeat(18),
                    data: '0x'+randomBytes((i%3+1)*5).toString('hex')
                }],
                gasPriceCoef: input.readUint8(13),
                gas: input.readUint32BE(14),
                dependsOn: i%3==0?null: '0x'+input.subarray(18, 18+32).toString('hex'),
                nonce: input.readBigUint64BE(50).toString()
            }
            const encoded = (new Transaction(body)).encode()
            await client.deleteEvents()
            const res = await client.exchange(encodeSignTx(encoded))
            const signature = decodeSignature(res)
    
            expect(verifySignature(encoded, signature, publicKey)).to.be.true
        })
    })

    // simple + 20bytes address + 1byte amount
    const multi: Buffer[] = []
    for (let i = 0; i < 20; i++){
        multi.push(randomBytes(79+21))
    }

    multi.forEach((input, i) => {
        it('multi clause ' + i, async () => {
            const body: Transaction.Body = {
                chainTag: input.readUint8(0),
                blockRef: '0x' + input.subarray(1, 1 + 8).toString('hex'),
                expiration: input.readUint32BE(9),
                clauses: [{
                    to: '0x' + input.subarray(58, 58+20).toString('hex'),
                    value: input.readUint8(78).toString()+'0'.repeat(18),
                    data: '0x'+randomBytes((i%3)*5).toString('hex')
                },{
                    to: '0x' + input.subarray(79, 79+20).toString('hex'),
                    value: input.readUint8(99).toString()+'0'.repeat(18),
                    data: '0x'+randomBytes((i%3)*5).toString('hex')
                }],
                gasPriceCoef: input.readUint8(13),
                gas: input.readUint32BE(14),
                dependsOn: i%3==0?null: '0x'+input.subarray(18, 18+32).toString('hex'),
                nonce: input.readBigUint64BE(50).toString()
            }
            const encoded = (new Transaction(body)).encode()
            await client.deleteEvents()
            const res = await client.exchange(encodeSignTx(encoded))
            const signature = decodeSignature(res)
    
            expect(verifySignature(encoded, signature, publicKey)).to.be.true
        })
    })

    after(async () => {
        await client.resetAutomation()
    })
})