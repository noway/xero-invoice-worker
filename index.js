const { Command } = require('commander');
const fetch = require('node-fetch');


const program = new Command();
program.version('0.0.0');

program
  .option('-f, --feed-url <http url>', 'HTTP url for the JSON event feed')
  .option('-i, --invoice-dir <directory path>', 'Folder where the PDF files are stored');

program.parse(process.argv);


const options = program.opts();
if (options.feedUrl) console.log(`- ${options.feedUrl}`);
if (options.invoiceDir) console.log(`- ${options.invoiceDir}`);

async function fetchFeedUrl() {
	// TODO: implement pageSize
	// TODO: implement afterEventId

	const res = await fetch(options.feedUrl)
	const data = await res.json()

	console.log('data', data)	
}

async function main() {
	fetchFeedUrl()
}

main()