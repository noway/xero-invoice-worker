const express = require('express');

const app = express();
const port = 3000;

app.get('/invoices/events', (req, res) => {
  const pageSize = parseInt(req.query.pageSize ?? '10', 10);
  const afterEventId = parseInt(req.query.afterEventId ?? '0', 10);
  let data;

  const invoiceNumber = Math.ceil((afterEventId + 1) / 4);
  const invoiceId = `97f0821d-3517-471a-95f2-${`${invoiceNumber}`.padStart(12, '0')}`;
  const lineItemId = `2686350b-2656-48a0-912d-${`${invoiceNumber}`.padStart(12, '0')}`;

  if (afterEventId % 4 === 0) {
    // create
    data = {
      items: [
        {
          id: afterEventId + 1,
          type: 'INVOICE_CREATED',
          content: {
            invoiceId,
            invoiceNumber: `INV-${`${invoiceNumber}`.padStart(3, '0')}`,
            lineItems: [
              {
                lineItemId,
                description: 'Supplies',
                quantity: 2,
                unitCost: 10.15,
                lineItemTotalCost: 20.3,
              },
            ],
            status: 'DRAFT',
            dueDateUtc: '2020-04-30T10:00:00.000Z',
            createdDateUtc: '2020-04-19T10:00:00.000Z',
            updatedDateUtc: '2020-04-19T10:00:00.000Z',
          },
          createdDateUtc: '2020-04-19T10:00:00.000Z',
        },
      ],
    };
  } else if (afterEventId % 4 === 1) {
    // edit and update to sent
    data = {
      items: [
        {
          id: afterEventId + 1,
          type: 'INVOICE_UPDATED',
          content: {
            invoiceId,
            invoiceNumber: `INV-${`${invoiceNumber}`.padStart(3, '0')}`,
            lineItems: [
              {
                lineItemId,
                description: 'Supplies',
                quantity: 4,
                unitCost: 10.15,
                lineItemTotalCost: 40.6,
              },
            ],
            status: 'SENT',
            dueDateUtc: '2020-04-30T10:00:00.000Z',
            createdDateUtc: '2020-04-19T10:00:00.000Z',
            updatedDateUtc: '2020-04-20T10:00:00.000Z',
          },
          createdDateUtc: '2020-04-20T10:00:00.000Z',
        },
      ],
    };
  } else if (afterEventId % 4 === 2) {
    // update to paid
    data = {
      items: [
        {
          id: afterEventId + 1,
          type: 'INVOICE_UPDATED',
          content: {
            invoiceId,
            invoiceNumber: `INV-${`${invoiceNumber}`.padStart(3, '0')}`,
            lineItems: [
              {
                lineItemId,
                description: 'Supplies',
                quantity: 4,
                unitCost: 10.15,
                lineItemTotalCost: 40.6,
              },
            ],
            status: 'PAID',
            dueDateUtc: '2020-04-30T10:00:00.000Z',
            createdDateUtc: '2020-04-19T10:00:00.000Z',
            updatedDateUtc: '2020-04-21T10:00:00.000Z',
          },
          createdDateUtc: '2020-04-21T10:00:00.000Z',
        },
      ],
    };
  } else if (afterEventId % 4 === 3) {
    // delete
    data = {
      items: [
        {
          id: afterEventId + 1,
          type: 'INVOICE_DELETED',
          content: {
            invoiceId,
          },
          createdDateUtc: '2020-04-22T10:00:00.000Z',
        },
      ],
    };
  }

  res.json(data);
});

app.listen(port, () => {
  console.log(`Invoice Worker test server listening at http://localhost:${port}`);
});
