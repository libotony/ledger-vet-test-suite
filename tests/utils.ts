import { blake2b256, secp256k1, HDNode } from 'thor-devkit'

export const seeds = 'denial kitchen pet squirrel other broom bar gas better priority spoil cross'
export const publicKey = HDNode.fromMnemonic(seeds.split(' ')).derive(0).publicKey

export const verifySignature = (message: Buffer, signature: Buffer, publicKey: Buffer) => {
    const hash = blake2b256(message)
    const recoverd = secp256k1.recover(hash, signature)
    return recoverd.equals(publicKey)
}

export const toPersonal = (input: string) => {
    return Buffer.from('\u0019VeChain Signed Message:\n' + input.length + input, 'ascii')
}

export const hashToDisplay = (hash: Buffer) => {
    const hex = hash.toString('hex').toUpperCase()
    return `${hex.slice(0, 4)}...${hex.slice(-4)}`
}

export const findNextScreen = (events: { text: string }[], key: string) => {
    for (const [i, e] of events.entries()) {
        if (e.text === key) {
            if (events[i + 1]) {
                return events[i+1].text
            }
            return null
        }
    }
}

export const ensureScreen = (events: { text: string }[], key: string) => {
    for (const e of events) {
        if (e.text === key) {
            return true
        }
    }
    return false
}

