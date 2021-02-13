const { Command } = require('commander');
const program = new Command();
program.version('0.0.0');


program
  .option('-f, --feed-url <http url>', 'HTTP url for the JSON event feed')
  .option('-i, --invoice-dir <directory path>', 'Folder where the PDF files are stored')

program.parse(process.argv);

const options = program.opts();
if (options.feedUrl) console.log(`- ${options.feedUrl}`);
if (options.invoiceDir) console.log(`- ${options.invoiceDir}`);
