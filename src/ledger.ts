import { Buffer } from 'buffer'

const VET_DERIVATION_PATH = `44'/818'/0'/0/0`

export const encodeGetConf = (): Buffer[] => {
    return [makePayload(0xE0,0x06,0x00,0x00,Buffer.alloc(0))]
}

export const encodeGetAccount = (index: number, display?: boolean, chainCode?: boolean): Buffer[] => {
    const paths = splitPath(VET_DERIVATION_PATH.slice(0,-1)+index)
        const buffer = Buffer.alloc(1 + paths.length * 4)
        buffer[0] = paths.length
        paths.forEach((element, index) => {
            buffer.writeUInt32BE(element, 1 + 4 * index)
        })
    
    const payload = makePayload(0xE0, 0x02,
        display ? 0x01 : 0x00,
        chainCode ? 0x01 : 0x00,
        buffer)
    return [payload]
}

export const decodeGetAccount = (res: Buffer) => {
    verifyResponse(res)

    const pubLen = res[0]
    const addressLen = res[1 + pubLen]
    
    return {
        publicKey: res.subarray(1, 1 + pubLen),
        address: '0x'+ res.subarray(1 + pubLen +1, 1+pubLen+1+addressLen).toString('ascii')
    }
}

export const encodeSignTx = (rawTx: Buffer)=> {
    return sign(rawTx, true, 0xE0, 0x04)
}

export const encodeSignMessage = (message: Buffer) => {
    return sign(message, false, 0xE0, 0x08)
}

export const encodeSignCertificate = (message: Buffer) => {
    return sign(message, false, 0xE0, 0x09)
}

export const decodeSignature = (res: Buffer) => {
    verifyResponse(res)

    return res.subarray(0, 65)
}

const verifyResponse = (res: Buffer) => {
    const code = res.readUint16BE(res.length-2) 
    if (code!== StatusCodes.OK) {
        throw new Error('invalid response with code 0x'+ res.subarray(-2).toString('hex'))
    }
}

const sign = (raw: Buffer, isTransaction: boolean, cla: number, ins: number) => {
    const buffers = splitRaw(VET_DERIVATION_PATH, raw, isTransaction)
    const payloads = [] as Buffer[]
    for (let i = 0; i < buffers.length; i++) {
        const data = buffers[i]
        payloads.push(makePayload(cla, ins, i === 0 ? 0x00 : 0x80, 0x00, data))
    }
    return payloads
}

function makePayload(cla: number, ins: number, p1: number, p2: number, data: Buffer) {
    return Buffer.concat([
        Buffer.from([cla, ins, p1, p2]),
        Buffer.from([data.length]),
        data,
    ])
}

function splitPath(path: string) {
    return path.split('/')
        .map(elem => {
            let num = parseInt(elem, 10)
            if (elem.length > 1 && elem[elem.length - 1] === `'`) {
                num += 0x80000000
            }
            return num
        })
        .filter(num => !isNaN(num))
}

function splitRaw(path: string, raw: Buffer, isTransaction: boolean) {
    const contentByteLength = isTransaction ? 0 : 4
    const paths = splitPath(path)
    let offset = 0
    const buffers = []
    while (offset !== raw.length) {
        const maxChunkSize = offset === 0 ? 255 - 1 - paths.length * 4 - contentByteLength : 255
        const chunkSize = offset + maxChunkSize > raw.length ?
            raw.length - offset : maxChunkSize
        const buffer = Buffer.alloc(offset === 0 ? 1 + paths.length * 4 + contentByteLength + chunkSize : chunkSize)
        if (offset === 0) {
            buffer[0] = paths.length
            paths.forEach((element, index) => {
                buffer.writeUInt32BE(element, 1 + 4 * index)
            })
            if (isTransaction) {
                raw.copy(buffer, 1 + 4 * paths.length, offset, offset + chunkSize)
            } else {
                buffer.writeUInt32BE(raw.length, 1 + 4 * paths.length)
                raw.copy(buffer, 1 + 4 * paths.length + 4, offset, offset + chunkSize)
            }
        } else {
            raw.copy(buffer, 0, offset, offset + chunkSize)
        }
        buffers.push(buffer)
        offset += chunkSize
    }
    return buffers
}

export enum StatusCodes {
    PIN_REMAINING_ATTEMPTS = 0x63c0,
    INCORRECT_LENGTH = 0x6700,
    COMMAND_INCOMPATIBLE_FILE_STRUCTURE = 0x6981,
    SECURITY_STATUS_NOT_SATISFIED = 0x6982,
    CONDITIONS_OF_USE_NOT_SATISFIED = 0x6985,
    INCORRECT_DATA = 0x6a80,
    NOT_ENOUGH_MEMORY_SPACE = 0x6a84,
    REFERENCED_DATA_NOT_FOUND = 0x6a88,
    FILE_ALREADY_EXISTS = 0x6a89,
    INCORRECT_P1_P2 = 0x6b00,
    INS_NOT_SUPPORTED = 0x6d00,
    CLA_NOT_SUPPORTED = 0x6e00,
    TECHNICAL_PROBLEM = 0x6f00,
    OK = 0x9000,
    MEMORY_PROBLEM = 0x9240,
    NO_EF_SELECTED = 0x9400,
    INVALID_OFFSET = 0x9402,
    FILE_NOT_FOUND = 0x9404,
    INCONSISTENT_FILE = 0x9408,
    ALGORITHM_NOT_SUPPORTED = 0x9484,
    INVALID_KCV = 0x9485,
    CODE_NOT_INITIALIZED = 0x9802,
    ACCESS_CONDITION_NOT_FULFILLED = 0x9804,
    CONTRADICTION_SECRET_CODE_STATUS = 0x9808,
    CONTRADICTION_INVALIDATION = 0x9810,
    CODE_BLOCKED = 0x9840,
    MAX_VALUE_REACHED = 0x9850,
    GP_AUTH_FAILED = 0x6300,
    LICENSING = 0x6f42,
    HALTED = 0x6faa
}
