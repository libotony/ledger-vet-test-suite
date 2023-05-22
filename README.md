# Ledger VET app test suite

Test [ledger vechain app](https://github.com/LedgerHQ/app-vechain/) with arbitrary test data, supports NanoS/NanoX/NanoSP.

## How

First, compile firmware by this [guide](https://github.com/LedgerHQ/app-boilerplate#compilation-and-load), put the firmware into the `firmware` folder, named by `<device name>.elf`.

Then run `npm run speculos:<device name>` starts the emulator.

Run `npm t`

## Note

This is a side project while verifying new changes to ledger vechain app, the official [repo](https://github.com/LedgerHQ/app-vechain/) have already built a test framework, check it for further development.
