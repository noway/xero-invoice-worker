const fs = require('fs');
const pdf = require('html-pdf');
const util = require('util');

module.exports.readFile = util.promisify(fs.readFile);
module.exports.writeFile = util.promisify(fs.writeFile);
module.exports.unlink = util.promisify(fs.unlink);
module.exports.wait = util.promisify(setTimeout);

module.exports.listInvoices = function listInvoices(invoices) {
  return invoices.map(({ invoiceNumber }) => invoiceNumber).join(', ');
};

module.exports.log = function log(...args) {
  console.log(...args);
};

module.exports.writePdf = function writePdf(html, pdfOptions, pdfPath) {
  return new Promise((resolve, reject) => pdf.create(html, pdfOptions)
    .toFile(pdfPath, (err, pdfRes) => {
      if (err) {
        reject(err);
      } else {
        resolve(pdfRes);
      }
    }));
};
