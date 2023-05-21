import { expect } from 'chai'
import { Speculos } from '../src/speculos'
import { decodeGetAccount, encodeGetAccount } from '../src/ledger'
import { HDNode } from 'thor-devkit'
import { seeds } from './utils'

const backend = 'http://localhost:5001'

describe('account', () => {
    it('get account', async () => {
        const node = HDNode.fromMnemonic(seeds.split(' ')).derive(0)

        const client = new Speculos(backend)
        const res = await client.exchange(encodeGetAccount(0))
        const acc = decodeGetAccount(res)
        expect(acc.publicKey.equals(node.publicKey)).to.be.true
        expect(acc.address).equal(node.address)
    })
})