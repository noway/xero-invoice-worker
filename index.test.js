const assert = require('assert').strict;
const { eventItemsToInvoices } = require('./index.js');

const invoicesEventsOnlyCreate = {
  items: [
    {
      id: 1,
      type: 'INVOICE_CREATED',
      content: {
        invoiceId: '97f0821d-3517-471a-95f2-f00da84ec56e',
        invoiceNumber: 'INV-001',
        lineItems: [
          {
            lineItemId: '2686350b-2656-48a0-912d-763c06ef5c04',
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

const invoicesEventsCreateThenUpdate = {
  items: [
    {
      id: 1,
      type: 'INVOICE_CREATED',
      content: {
        invoiceId: '97f0821d-3517-471a-95f2-f00da84ec56e',
        invoiceNumber: 'INV-001',
        lineItems: [
          {
            lineItemId: '2686350b-2656-48a0-912d-763c06ef5c04',
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
    {
      id: 2,
      type: 'INVOICE_UPDATED',
      content: {
        invoiceId: '97f0821d-3517-471a-95f2-f00da84ec56e',
        invoiceNumber: 'INV-001',
        lineItems: [
          {
            lineItemId: '2686350b-2656-48a0-912d-763c06ef5c04',
            description: 'Supplies',
            quantity: 20,
            unitCost: 10.00,
            lineItemTotalCost: 200.0,
          },
        ],
        status: 'DRAFT',
        dueDateUtc: '2020-05-30T10:00:00.000Z',
        createdDateUtc: '2020-04-19T10:00:00.000Z',
        updatedDateUtc: '2020-05-19T10:00:00.000Z',
      },
      createdDateUtc: '2020-05-19T10:00:00.000Z',
    },
  ],
};

const invoicesEventsCreateThenDelete = {
  items: [
    {
      id: 1,
      type: 'INVOICE_CREATED',
      content: {
        invoiceId: '97f0821d-3517-471a-95f2-f00da84ec56e',
        invoiceNumber: 'INV-001',
        lineItems: [
          {
            lineItemId: '2686350b-2656-48a0-912d-763c06ef5c04',
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
    {
      id: 2,
      type: 'INVOICE_DELETED',
      content: {
        invoiceId: '97f0821d-3517-471a-95f2-f00da84ec56e',
      },
      createdDateUtc: '2020-05-19T10:00:00.000Z',
    },
  ],
};

/** eventItemsToInvoices */

// should create an invoice
assert.deepEqual(eventItemsToInvoices(invoicesEventsOnlyCreate.items), [{
  invoiceId: '97f0821d-3517-471a-95f2-f00da84ec56e',
  invoiceNumber: 'INV-001',
  lineItems: [
    {
      lineItemId: '2686350b-2656-48a0-912d-763c06ef5c04',
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
}]);

// should create and then update invoice
assert.deepEqual(eventItemsToInvoices(invoicesEventsCreateThenUpdate.items), [{
  invoiceId: '97f0821d-3517-471a-95f2-f00da84ec56e',
  invoiceNumber: 'INV-001',
  lineItems: [
    {
      lineItemId: '2686350b-2656-48a0-912d-763c06ef5c04',
      description: 'Supplies',
      quantity: 20,
      unitCost: 10.00,
      lineItemTotalCost: 200.0,
    },
  ],
  status: 'DRAFT',
  dueDateUtc: '2020-05-30T10:00:00.000Z',
  createdDateUtc: '2020-04-19T10:00:00.000Z',
  updatedDateUtc: '2020-05-19T10:00:00.000Z',
}]);

// should create and then delete invoice
assert.deepEqual(eventItemsToInvoices(invoicesEventsCreateThenDelete.items), []);
