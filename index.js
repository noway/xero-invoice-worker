/* eslint-disable no-await-in-loop */
const { Command } = require('commander');
const fetch = require('node-fetch');
const fs = require('fs');
const pdf = require('html-pdf');
const Handlebars = require('handlebars');
const path = require('path');

const POLLING_INTERVAL = 7000;
const program = new Command();
program.version('0.0.0');

program
  .option('-f, --feed-url <http url>', 'HTTP url for the JSON event feed')
  .option('-i, --invoice-dir <directory path>', 'Folder where the PDF files are stored');

program.parse(process.argv);

const options = program.opts();
if (options.feedUrl) console.log(`- ${options.feedUrl}`);
if (options.invoiceDir) console.log(`- ${options.invoiceDir}`);

function eventItemsToInvoices(events) {
  const sortedEvents = [...events].sort((a, b) => a.id - b.id);
  const deletedInvoiceNumbers = [];
  const invoices = [];
  for (let i = 0; i < sortedEvents.length; i += 1) {
    const event = sortedEvents[i];
    if (event.type === 'INVOICE_CREATED') {
      invoices.push(event.content);
    } else if (event.type === 'INVOICE_UPDATED') {
      const index = invoices.findIndex((invoice) => invoice.invoiceId === event.content.invoiceId);
      Object.assign(invoices[index], event.content);
    } else if (event.type === 'INVOICE_DELETED') {
      const index = invoices.findIndex((invoice) => invoice.invoiceId === event.content.invoiceId);
      const deletedInvoice = invoices[index];
      deletedInvoiceNumbers.push(deletedInvoice.invoiceNumber);
      invoices.splice(index, 1);
    }
  }
  return [deletedInvoiceNumbers, invoices];
}
module.exports.eventItemsToInvoices = eventItemsToInvoices;

async function syncInvoicesToFilesystem(template, deletedInvoiceNumbers, invoices) {
  const deletionPromises = [];
  const invoicePutPromises = [];
  for (let i = 0; i < deletedInvoiceNumbers.length; i += 1) {
    const deleteInvoiceName = deletedInvoiceNumbers[i];
    const pdfPath = path.resolve(options.invoiceDir, `./${deleteInvoiceName}.pdf`);
    deletionPromises.push(
      new Promise((resolve, reject) => fs.unlink(pdfPath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      })),
    );
  }
  await Promise.all(deletionPromises);

  for (let i = 0; i < invoices.length; i += 1) {
    const invoice = invoices[i];
    const html = template(invoice);
    const pdfOptions = { format: 'Letter' };
    const pdfPath = path.resolve(options.invoiceDir, `./${invoice.invoiceNumber}.pdf`);

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

async function fetchFeedUrl(template) {
  // TODO: implement pageSize
  // TODO: implement afterEventId

  const res = await fetch(options.feedUrl);
  const data = await res.json();

  const [deletedInvoiceNumbers, invoices] = eventItemsToInvoices(data.items);

  syncInvoicesToFilesystem(template, deletedInvoiceNumbers, invoices);

  console.log('data', data);
}

async function main() {
  const templateSource = await new Promise((resolve, reject) => fs.readFile('./invoice-template.html', 'utf8', (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  }));

  const template = Handlebars.compile(templateSource);

  do {
    await fetchFeedUrl(template);
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
  }
  while (true); // until Ctrl-C is pressed
}
if (require.main === module) {
  main();
}
