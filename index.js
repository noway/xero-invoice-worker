const { Command } = require('commander');
const fetch = require('node-fetch');
const fs = require('fs');
const pdf = require('html-pdf');
const Handlebars = require('handlebars');
const path = require('path');

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
      invoices.splice(index, 1);
    }
  }
  return invoices;
}
module.exports.eventItemsToInvoices = eventItemsToInvoices;

async function fetchFeedUrl(template) {
  // TODO: implement pageSize
  // TODO: implement afterEventId

  const res = await fetch(options.feedUrl);
  const data = await res.json();

  const invoices = eventItemsToInvoices(data.items);

  for (let i = 0; i < invoices.length; i += 1) {
    const invoice = invoices[i];
    const result = template(invoice);
    const pdfOptions = { format: 'Letter' };
    const pdfPath = path.resolve(options.invoiceDir, `./${invoice.invoiceNumber}.pdf`);

    pdf.create(result, pdfOptions).toFile(pdfPath, (err, pdfRes) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(pdfRes);
    });
  }

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
  fetchFeedUrl(template);
}
if (require.main === module) {
  main();
}
