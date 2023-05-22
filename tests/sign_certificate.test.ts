import { expect } from 'chai'
import { Speculos } from '../src/speculos'
import { decodeSignature, encodeSignCertificate } from '../src/ledger'
import { verifySignature, publicKey, hashToDisplay, findNextScreen } from './utils'
import { address, blake2b256, Certificate} from 'thor-devkit'
import {faker} from '@faker-js/faker'

const backend = 'http://localhost:5001'
const client = new Speculos(backend)
const signer = address.fromPublicKey(publicKey)

describe('sign certificate', () => {
    before(async () => {
        await client.autoSignMessage()
    })

    it('certificate', async () => {
        const cert: Certificate = {
            purpose: 'identification',
            payload: {
                type: 'text',
                content: 'fyi'
            },
            domain: 'example.com',
            timestamp: 1545035330,
            signer: signer
        }

        const encoded = Buffer.from(Certificate.encode(cert))
        const hash = blake2b256(encoded)
        await client.deleteEvents()
        const res = await client.exchange(encodeSignCertificate(encoded))
        const {events} = await client.getEvents()

        const signature = decodeSignature(res)
        expect(findNextScreen(events, 'Message hash')).equal(hashToDisplay(hash))
        expect(verifySignature(encoded,signature, publicKey)).to.be.true
    })

    const tests: Array<{ domain: string;  content:string}> = []
    for (let i = 0; i < 40; i++){
        tests.push({
            domain: faker.internet.domainName(),
            content: faker.word.words({ count: { min: 4, max: 8 } })
        })
    }

    tests.forEach((input, i) => {
        it('random case ' + i, async () => {
            const cert: Certificate = {
                purpose: 'identification',
                payload: {
                    type: 'text',
                    content: input.content
                },
                domain: input.domain,
                timestamp: 1545035330,
                signer: signer
            }
    
            const encoded = Buffer.from(Certificate.encode(cert))
            const hash = blake2b256(encoded)
            await client.deleteEvents()
            const res = await client.exchange(encodeSignCertificate(encoded))
            const {events} = await client.getEvents()
    
            const signature = decodeSignature(res)
            expect(findNextScreen(events, 'Message hash')).equal(hashToDisplay(hash))
            expect(verifySignature(encoded, signature, publicKey)).to.be.true
        })
    })

    after(async () => {
        await client.resetAutomation()
    })
})