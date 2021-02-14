# Invoice Tracker

## Installation
```bash
npm install
```

## Usage
```bash
npm start -- --feed-url <http url> --invoice-dir <directory path>
```
or
```bash
npm start -- -f <http url> -i <directory path>
```

## Example usage
```bash
npm run test-server &
npm start -- -f http://localhost:3000/invoices/events -i ./output/
```

The test server creates 2 invoices at a time, sends them, pays them and then deletes them. This allows the operator to see the lifecycle of the invoices happen in the `./output/` directory.

# Run tests
```bash
npm run test
```

## Overview
- `startLoop` starts the feed url polling
- `fetchFeedUrl` fetches the feed url. After the fetch is completed, invoices are synced to filesystem and then the progress is saved. If `fetchFeedUrl` fails, the loop continues to run and fetching is attempted on the next iteration again.
- Events array is transformed to invoices array, with the help of previously saved invoices from previous events. All deleted invoices are removed from filesystem on each iteration, and all existing invoices are overwritten.
- `invoices` and `lastEventId` are persisted in state.json file
- Polling interval is 7s

## Compromises 
- New event types are skipped.
- `pageSize` for feed url is not implemented, so it will always default to 10 events.  Which might lead to longer processing time if there are a lot of events, but it is a sensible default.
- Only some unit tests are written, there are no integration tests which verify that invoices are being written/deleted or if state is being persisted/read.
- Invoice contents is not validated. Any statuses are allowed, not just DRAFT, SENT, PAID, DELETED

## Assumptions 
- Invoice number never changes
- `lineItems` are always replaced as a whole, not diffed.
- The directory user specified only contains files generated by the Invoice Tracker

## How would you improve
- Don’t overwrite invoices which didn’t change and don’t try to delete already deleted invoices.
- Integration tests which test that files are being created and state is persisted
- Add status verification and invoice validation
- More invoice fields, such as issuing company, recipient
- Use mocha for tests instead of `assert`
- Improve invoice styling
