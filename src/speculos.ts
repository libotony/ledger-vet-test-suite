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

    async deleteEvents() {
        const response = await fetch(this.url + '/events', {
            method: 'DELETE',
        })
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    }

    async getEvents() {
        const response = await fetch(this.url + '/events', {
            method: 'GET',
        })
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json() as { events: Array<{ text: string; x: number; y: number; }> }
    }

    async button(button: 'left' | 'right' | 'both', action: 'press' | 'release' | 'press-and-release'){
        const response = await fetch(this.url + '/button/'+button, {
            method: 'POST',
            body: JSON.stringify({ action: action })
        })
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const body = await response.json()
        return body
    }

    autoSignMessage() {
        return this.enableRule(Rules.AutoSignMessage)
    }

    autoSignCertificate() {
        return this.enableRule(Rules.AutoSignMessage)
    }

    autoSignTransaction() {
        return this.enableRule(Rules.AutoSignTransaction)
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