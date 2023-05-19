import fetch from 'node-fetch'
import { Buffer } from 'buffer'
import * as Rules from './automations'

export class Speculos {
    constructor(readonly url: string) { }

    async exchange(payloads: Buffer[]) {
        let response: Buffer = Buffer.alloc(0)
        for (const p of payloads) {
            try {
                response = await this.send(p)
            } catch {
                break
            }
        }
        return response
    }

    autoSignMessage() {
        return this.enableRule(Rules.AutoSignMessage)
    }

    resetAutomation() {
        return this.enableRule(Rules.Default)
    }

    private async send(data: Buffer) {
        const response = await fetch(this.url + '/apdu', {
            method: 'POST',
            body: JSON.stringify({ data: data.toString('hex') })
        })
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const body = await response.json() as { data: string }
        return Buffer.from(body.data, 'hex')
    }

    private async enableRule(rule: any) {
        const response = await fetch(this.url + '/automation', {
            method: 'POST',
            body: JSON.stringify(rule)
        })
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const body = await response.json()
        return body
    }

}