import { expect } from 'chai'
import { Speculos } from '../src/speculos'
import { decodeGetAccount, encodeGetAccount } from '../src/ledger'
import { HDNode } from 'thor-devkit'

const backend = 'http://localhost:5001'
const seeds = 'denial kitchen pet squirrel other broom bar gas better priority spoil cross'

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