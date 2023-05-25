import { expect } from 'chai'
import { Speculos } from '../src/speculos'
import { decodeSignature, encodeSignMessage } from '../src/ledger'
import { toPersonal, verifySignature, publicKey, findNextScreen, hashToDisplay } from './utils'
import {faker} from '@faker-js/faker'
import { blake2b256 } from 'thor-devkit'

const backend = 'http://localhost:5001'
const client = new Speculos(backend)

describe('sign message', () => {
    before(async () => {
        await client.autoSignMessage()
    })

    it('message', async () => {
        const msg = 'hello'
        await client.deleteEvents()
        const res = await client.exchange(encodeSignMessage(Buffer.from(msg)))
        const {events} = await client.getEvents()

        const signature = decodeSignature(res)
        expect(findNextScreen(events, 'Message hash')).equal(hashToDisplay(blake2b256(toPersonal(msg))))
        expect(verifySignature(toPersonal(msg), signature, publicKey)).to.be.true
    })

    const tests: string[] = []
    for (let i = 0; i < 40; i++){
        tests.push(faker.word.words({ count: { min: 4, max: 8 } }))
    }

    tests.forEach((input, i) => {
        it('random case ' + i, async () => {
            await client.deleteEvents()
            const res = await client.exchange(encodeSignMessage(Buffer.from(input)))
            const {events} = await client.getEvents()

            const signature = decodeSignature(res)
            expect(findNextScreen(events, 'Message hash')).equal(hashToDisplay(blake2b256(toPersonal(input))))
            const verified = verifySignature(toPersonal(input), signature, publicKey)
                if (!verified) {
                console.log(input)
            }
            expect(verified).to.be.true
        })
    })


    after(async () => {
        await client.resetAutomation()
    })
})