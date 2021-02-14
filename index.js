/* eslint-disable no-console */
/* eslint-disable no-constant-condition */
/* eslint-disable no-await-in-loop */

const path = require('path');
const fetch = require('node-fetch');
const moment = require('moment');
const Handlebars = require('handlebars');
const { Command } = require('commander');
const {
  readFile, writeFile, unlink, wait, listInvoices, log, writePdf,
} = require('./utils');

const POLLING_INTERVAL = 7000;

const program = new Command();
program.version('0.0.0');
program
  .requiredOption('-f, --feed-url <http url>', 'HTTP url for the JSON event feed')
  .requiredOption('-i, --invoice-dir <directory path>', 'Folder where the PDF files are stored');

class InvoiceTracker {
  constructor(options, template) {
    this.options = options;
    this.template = template;
  }

  static async getProgress() {
    try {
      const contents = await readFile(path.resolve(__dirname, './state.json'), 'utf8');
      const parsed = JSON.parse(contents);
      return [parsed.lastEventId, parsed.invoices];
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [0, []];
      }
      throw error;
    }
  }

  static async persistProgress(lastEventId, invoices) {
    const serialized = JSON.stringify({ lastEventId, invoices }, null, 2);
    await writeFile(path.resolve(__dirname, './state.json'), serialized);
  }

  static eventItemsToInvoices(sortedEventItems, previousInvoices) {
    const invoices = [...previousInvoices];
    for (let i = 0; i < sortedEventItems.length; i += 1) {
      const item = sortedEventItems[i];
      if (item.type === 'INVOICE_CREATED') {
        invoices.push(item.content);
      } else if (item.type === 'INVOICE_UPDATED') {
        const index = invoices.findIndex((invoice) => invoice.invoiceId === item.content.invoiceId);
        invoices[index] = { ...invoices[index], ...item.content };
      } else if (item.type === 'INVOICE_DELETED') {
        const index = invoices.findIndex((invoice) => invoice.invoiceId === item.content.invoiceId);
        invoices[index] = { ...invoices[index], status: 'DELETED' };
      } else {
        // ignore
      }
    }
    return invoices;
  }

  async syncInvoicesToFilesystem(invoices) {
    const deletionPromises = [];
    const deletedInvoices = invoices.filter((invoice) => invoice.status === 'DELETED');
    for (let i = 0; i < deletedInvoices.length; i += 1) {
      const deleteInvoiceNumber = deletedInvoices[i].invoiceNumber;
      const pdfPath = path.resolve(this.options.invoiceDir, `./${deleteInvoiceNumber}.pdf`);
      deletionPromises.push(unlink(pdfPath).catch((err) => {
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }));
    }
    await Promise.all(deletionPromises);
    log('Deleted invoices:', listInvoices(deletedInvoices));

    const invoicePutPromises = [];
    const nonDeletedInvoices = invoices.filter((invoice) => invoice.status !== 'DELETED');
    for (let i = 0; i < nonDeletedInvoices.length; i += 1) {
      const invoice = nonDeletedInvoices[i];
      const invoiceTotalCost = invoice.lineItems.reduce(
        (acc, cur) => acc + cur.lineItemTotalCost, 0,
      );
      const html = this.template({ invoice, invoiceTotalCost });
      const pdfOptions = { format: 'Letter' };
      const pdfPath = path.resolve(this.options.invoiceDir, `./${invoice.invoiceNumber}.pdf`);
      invoicePutPromises.push(writePdf(html, pdfOptions, pdfPath));
    }
    await Promise.all(invoicePutPromises);
    log('Wrote invoices:', listInvoices(nonDeletedInvoices));
  }

  async fetchFeedUrl(lastEventId, invoices) {
    try {
      const url = new URL(this.options.feedUrl);
      const searchParams = new URLSearchParams();
      searchParams.set('afterEventId', lastEventId);
      url.search = searchParams.toString();
      const res = await fetch(url.href);
      const data = await res.json();

      log(`${data.items.length} events fetched`);

      const sortedEventItems = [...data.items].sort((a, b) => a.id - b.id);
      const newLastEventId = sortedEventItems[sortedEventItems.length - 1].id;
      const updatedInvoices = InvoiceTracker.eventItemsToInvoices(sortedEventItems, invoices);

      await this.syncInvoicesToFilesystem(updatedInvoices);
      return [newLastEventId, updatedInvoices];
    } catch (error) {
      log(`Error: ${error.message} while fetching feed url. Retrying.`);
      return [lastEventId, invoices];
    }
  }

  async startLoop() {
    let [lastEventId, invoices] = await InvoiceTracker.getProgress();
    do {
      [lastEventId, invoices] = await this.fetchFeedUrl(lastEventId, invoices);
      await InvoiceTracker.persistProgress(lastEventId, invoices);
      log('Progress persisted\n');
      await wait(POLLING_INTERVAL);
    }
    while (true); // until Ctrl-C is pressed
  }
}

async function main() {
  program.parse(process.argv);
  const options = program.opts();

  Handlebars.registerHelper('dateFormat', (date) => moment(date).format('lll'));
  const templateSource = await readFile(path.resolve(__dirname, './invoice-template.html'), 'utf8');
  const template = Handlebars.compile(templateSource);

  log('Current settings: ');
  log(`  --feed-url ${options.feedUrl}`);
  log(`  --invoice-dir ${options.invoiceDir}\n`);

  const invoiceTracker = new InvoiceTracker(options, template);
  await invoiceTracker.startLoop();
}
module.exports = InvoiceTracker;

if (require.main === module) {
  main();
}
