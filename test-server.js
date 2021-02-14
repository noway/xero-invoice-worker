const express = require('express');

const app = express();
const port = 3000;

app.get('/invoices/events', (req, res) => {
  const afterEventId = parseInt(req.query.afterEventId ?? '0', 10);
  let data;

  const invoiceNumber = Math.ceil((afterEventId + 1) / 8) * 2 - 1;
  const invoiceId1 = `97f0821d-3517-471a-0001-${`${invoiceNumber}`.padStart(12, '0')}`;
  const invoiceId2 = `97f0821d-3517-471a-0002-${`${invoiceNumber}`.padStart(12, '0')}`;
  const lineItemId1 = `2686350b-2656-48a0-0001-${`${invoiceNumber}`.padStart(12, '0')}`;
  const lineItemId2 = `2686350b-2656-48a0-0002-${`${invoiceNumber}`.padStart(12, '0')}`;
  const lineItemId3 = `2686350b-2656-48a0-0003-${`${invoiceNumber}`.padStart(12, '0')}`;
  const lineItemId4 = `2686350b-2656-48a0-0004-${`${invoiceNumber}`.padStart(12, '0')}`;

  if (afterEventId % 8 === 0) {
    // create
    data = {
      items: [
        {
          id: afterEventId + 1,
          type: 'INVOICE_CREATED',
          content: {
            invoiceId: invoiceId1,
            invoiceNumber: `INV-${`${invoiceNumber}`.padStart(3, '0')}`,
            lineItems: [
              {
                lineItemId: lineItemId1,
                description: 'Supplies',
                quantity: 2,
                unitCost: 10.15,
                lineItemTotalCost: 20.3,
              },
              {
                lineItemId: lineItemId2,
                description: 'Services',
                quantity: 10,
                unitCost: 30,
                lineItemTotalCost: 300,
              },
            ],
            status: 'DRAFT',
            dueDateUtc: '2020-04-30T10:00:00.000Z',
            createdDateUtc: '2020-04-19T10:00:00.000Z',
            updatedDateUtc: '2020-04-19T10:00:00.000Z',
          },
          createdDateUtc: '2020-04-19T10:00:00.000Z',
        },
        {
          id: afterEventId + 2,
          type: 'INVOICE_CREATED',
          content: {
            invoiceId: invoiceId2,
            invoiceNumber: `INV-${`${invoiceNumber + 1}`.padStart(3, '0')}`,
            lineItems: [
              {
                lineItemId: lineItemId3,
                description: 'Toys',
                quantity: 2,
                unitCost: 10.15,
                lineItemTotalCost: 20.3,
              },
              {
                lineItemId: lineItemId4,
                description: 'Cars',
                quantity: 10,
                unitCost: 30,
                lineItemTotalCost: 300,
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
  } else if (afterEventId % 8 === 2) {
    // edit and update to sent
    data = {
      items: [
        {
          id: afterEventId + 1,
          type: 'INVOICE_UPDATED',
          content: {
            invoiceId: invoiceId1,
            invoiceNumber: `INV-${`${invoiceNumber}`.padStart(3, '0')}`,
            lineItems: [
              {
                lineItemId: lineItemId1,
                description: 'Supplies',
                quantity: 4,
                unitCost: 10.15,
                lineItemTotalCost: 40.6,
              },
              {
                lineItemId: lineItemId2,
                description: 'Services',
                quantity: 15,
                unitCost: 30,
                lineItemTotalCost: 450,
              },
            ],
            status: 'SENT',
            dueDateUtc: '2020-04-30T10:00:00.000Z',
            createdDateUtc: '2020-04-19T10:00:00.000Z',
            updatedDateUtc: '2020-04-20T10:00:00.000Z',
          },
          createdDateUtc: '2020-04-20T10:00:00.000Z',
        },
        {
          id: afterEventId + 2,
          type: 'INVOICE_UPDATED',
          content: {
            invoiceId: invoiceId2,
            invoiceNumber: `INV-${`${invoiceNumber + 1}`.padStart(3, '0')}`,
            lineItems: [
              {
                lineItemId: lineItemId1,
                description: 'Toys',
                quantity: 4,
                unitCost: 10.15,
                lineItemTotalCost: 40.6,
              },
              {
                lineItemId: lineItemId2,
                description: 'Cars',
                quantity: 15,
                unitCost: 30,
                lineItemTotalCost: 450,
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
  } else if (afterEventId % 8 === 4) {
    // update to paid
    data = {
      items: [
        {
          id: afterEventId + 1,
          type: 'INVOICE_UPDATED',
          content: {
            invoiceId: invoiceId1,
            invoiceNumber: `INV-${`${invoiceNumber}`.padStart(3, '0')}`,
            lineItems: [
              {
                lineItemId: lineItemId1,
                description: 'Supplies',
                quantity: 4,
                unitCost: 10.15,
                lineItemTotalCost: 40.6,
              },
              {
                lineItemId: lineItemId2,
                description: 'Services',
                quantity: 15,
                unitCost: 30,
                lineItemTotalCost: 450,
              },
            ],
            status: 'PAID',
            dueDateUtc: '2020-04-30T10:00:00.000Z',
            createdDateUtc: '2020-04-19T10:00:00.000Z',
            updatedDateUtc: '2020-04-21T10:00:00.000Z',
          },
          createdDateUtc: '2020-04-21T10:00:00.000Z',
        },
        {
          id: afterEventId + 2,
          type: 'INVOICE_UPDATED',
          content: {
            invoiceId: invoiceId2,
            invoiceNumber: `INV-${`${invoiceNumber + 1}`.padStart(3, '0')}`,
            lineItems: [
              {
                lineItemId: lineItemId3,
                description: 'Toys',
                quantity: 4,
                unitCost: 10.15,
                lineItemTotalCost: 40.6,
              },
              {
                lineItemId: lineItemId4,
                description: 'Cars',
                quantity: 15,
                unitCost: 30,
                lineItemTotalCost: 450,
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
  } else if (afterEventId % 8 === 6) {
    // delete
    data = {
      items: [
        {
          id: afterEventId + 1,
          type: 'INVOICE_DELETED',
          content: {
            invoiceId: invoiceId1,
          },
          createdDateUtc: '2020-04-22T10:00:00.000Z',
        },
        {
          id: afterEventId + 2,
          type: 'INVOICE_DELETED',
          content: {
            invoiceId: invoiceId2,
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
