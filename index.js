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
  console.log('deletedInvoices', deletedInvoices);
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
}

async function getLastEventId() {
  try {
    const contents = await new Promise((resolve, reject) => fs.readFile('./state.json', 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    }));
    const parsed = JSON.parse(contents);
    return parsed.lastEventId;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return 0;
    }
    throw error;
  }
}

async function setLastEventId(lastEventId) {
  const serialized = JSON.stringify({ lastEventId }, null, 2);
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

  const sortedEventItems = [...data.items].sort((a, b) => a.id - b.id);
  const newLastEventId = sortedEventItems[sortedEventItems.length - 1].id;
  const updatedInvoices = eventItemsToInvoices(sortedEventItems, invoices);

  await setLastEventId(newLastEventId);
  await syncInvoicesToFilesystem(options.invoiceDir, template, invoices);

  console.log('data', data);
  return [newLastEventId, updatedInvoices];
}

async function main() {
  program.parse(process.argv);
  const options = program.opts();

  console.log('Settings: ');
  console.log(`  --feed-url ${options.feedUrl}`);
  console.log(`  --invoice-dir ${options.invoiceDir}`);

  let lastEventId = await getLastEventId();
  let invoices = [];

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
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
  }
  while (true); // until Ctrl-C is pressed
}
if (require.main === module) {
  main();
}
