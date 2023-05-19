import { expect } from 'chai'
import { Speculos } from '../src/speculos'
import { decodeGetAccount, decodeSignature, encodeGetAccount, encodeSignMessage } from '../src/ledger'
import { HDNode, blake2b256, secp256k1 } from 'thor-devkit'

const backend = 'http://localhost:5001'
const client = new Speculos(backend)

const seeds = 'denial kitchen pet squirrel other broom bar gas better priority spoil cross'
const publicKey = HDNode.fromMnemonic(seeds.split(' ')).derive(0).publicKey

const verifySignature = (message: Buffer, signature: Buffer, publicKey: Buffer) => {
    const hash = blake2b256(message)
    const recoverd = secp256k1.recover(hash, signature)
    return recoverd.equals(publicKey)
}

const toPersonal = (input: string) => {
    return Buffer.from('\u0019VeChain Signed Message:\n' + input.length + input)
}

describe('sign message', () => {
    before(async () => {
        await client.autoSignMessage()
    })

    it('message', async () => {
        const msg = 'hello'
        const res = await client.exchange(encodeSignMessage(Buffer.from(msg)))

        const signature = decodeSignature(res)

        expect(verifySignature(toPersonal(msg), signature, publicKey)).to.be.true
    })

    after(async () => {
        await client.resetAutomation()
    })
})