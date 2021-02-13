/* eslint-disable no-console */
/* eslint-disable no-constant-condition */
/* eslint-disable no-await-in-loop */
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const pdf = require('html-pdf');
const Handlebars = require('handlebars');
const { Command } = require('commander');

const POLLING_INTERVAL = 7000;

const program = new Command();
program.version('0.0.0');
program
  .requiredOption('-f, --feed-url <http url>', 'HTTP url for the JSON event feed')
  .requiredOption('-i, --invoice-dir <directory path>', 'Folder where the PDF files are stored');

function listInvoices(invoices) {
  return invoices.map(({ invoiceNumber }) => invoiceNumber).join(', ');
}
function log(...args) {
  console.log(...args);
}

function eventItemsToInvoices(sortedEventItems, previousInvoices) {
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
    }
  }
  return invoices;
}
module.exports.eventItemsToInvoices = eventItemsToInvoices;

async function syncInvoicesToFilesystem(invoiceDir, template, invoices) {
  const deletionPromises = [];
  const invoicePutPromises = [];

  // tries to delete all of the invoices every time... not ideal
  // might delete something which is has been created by user?
  const deletedInvoices = invoices.filter((invoice) => invoice.status === 'DELETED');
  for (let i = 0; i < deletedInvoices.length; i += 1) {
    const deleteInvoiceNumber = deletedInvoices[i].invoiceNumber;
    const pdfPath = path.resolve(invoiceDir, `./${deleteInvoiceNumber}.pdf`);
    deletionPromises.push(
      new Promise((resolve, reject) => fs.unlink(pdfPath, (err) => {
        if (err) {
          if (err.code === 'ENOENT') {
            resolve();
          } else {
            reject(err);
          }
        } else {
          resolve();
        }
      })),
    );
  }
  await Promise.all(deletionPromises);
  log('Deleted invoices:', listInvoices(deletedInvoices));

  // overwrites all of the invoices at once. not eficient.
  const nonDeletedInvoices = invoices.filter((invoice) => invoice.status !== 'DELETED');
  for (let i = 0; i < nonDeletedInvoices.length; i += 1) {
    const invoice = nonDeletedInvoices[i];
    const html = template(invoice);
    const pdfOptions = { format: 'Letter' };
    const pdfPath = path.resolve(invoiceDir, `./${invoice.invoiceNumber}.pdf`);

    invoicePutPromises.push(
      new Promise((resolve, reject) => pdf.create(html, pdfOptions)
        .toFile(pdfPath, (err, pdfRes) => {
          if (err) {
            reject(err);
          } else {
            resolve(pdfRes);
          }
        })),
    );
  }
  await Promise.all(invoicePutPromises);
  log('Wrote invoices:', listInvoices(nonDeletedInvoices));
}

async function getProgress() {
  try {
    const contents = await new Promise((resolve, reject) => fs.readFile('./state.json', 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    }));
    const parsed = JSON.parse(contents);
    return [parsed.lastEventId, parsed.invoices];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [0, []];
    }
    throw error;
  }
}

async function persistProgress(lastEventId, invoices) {
  const serialized = JSON.stringify({ lastEventId, invoices }, null, 2);
  await new Promise((resolve, reject) => fs.writeFile('./state.json', serialized, (err) => {
    if (err) {
      reject();
    } else {
      resolve();
    }
  }));
}

async function fetchFeedUrl(options, template, lastEventId, invoices) {
  // TODO: implement pageSize

  const url = new URL(options.feedUrl);
  const searchParams = new URLSearchParams();
  searchParams.set('afterEventId', lastEventId);
  url.search = searchParams.toString();
  const res = await fetch(url.href);
  const data = await res.json();

  log(`${data.items.length} events fetched`);

  const sortedEventItems = [...data.items].sort((a, b) => a.id - b.id);
  const newLastEventId = sortedEventItems[sortedEventItems.length - 1].id;
  const updatedInvoices = eventItemsToInvoices(sortedEventItems, invoices);

  await syncInvoicesToFilesystem(options.invoiceDir, template, invoices);

  return [newLastEventId, updatedInvoices];
}

async function main() {
  program.parse(process.argv);
  const options = program.opts();

  log('Settings: ');
  log(`  --feed-url ${options.feedUrl}`);
  log(`  --invoice-dir ${options.invoiceDir}\n`);

  let [lastEventId, invoices] = await getProgress();

  const templateSource = await new Promise((resolve, reject) => fs.readFile('./invoice-template.html', 'utf8', (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  }));

  const template = Handlebars.compile(templateSource);

  do {
    [lastEventId, invoices] = await fetchFeedUrl(options, template, lastEventId, invoices);
    await persistProgress(lastEventId, invoices);
    log('Progress persisted\n');
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
  }
  while (true); // until Ctrl-C is pressed
}
if (require.main === module) {
  main();
}
