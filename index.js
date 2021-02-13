const { Command } = require('commander');
const fetch = require('node-fetch');
const fs = require('fs');
const pdf = require('html-pdf');
const Handlebars = require('handlebars');
const path = require('path');

const templateSource = fs.readFileSync('./invoice-template.html', 'utf8'); // TODO: async
const template = Handlebars.compile(templateSource);

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
  const invoices = [];
  for (let i = 0; i < events.length; i += 1) {
    const event = events[i];
    if (event.type === 'INVOICE_CREATED') {
      invoices.push(event.content);
    }
    // TODO: other event types
  }
  return invoices;
}

async function fetchFeedUrl() {
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
  fetchFeedUrl();
}

main();
