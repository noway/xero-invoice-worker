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

const invoicesEventsShuffled = {
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
      id: 3,
      type: 'INVOICE_UPDATED',
      content: {
        invoiceId: '97f0821d-3517-471a-95f2-f00da84ec56e',
        invoiceNumber: 'INV-001',
        lineItems: [
          {
            lineItemId: '2686350b-2656-48a0-912d-763c06ef5c04',
            description: 'Supplies',
            quantity: 40,
            unitCost: 9.00,
            lineItemTotalCost: 360.0,
          },
        ],
        status: 'DRAFT',
        dueDateUtc: '2020-06-30T10:00:00.000Z',
        createdDateUtc: '2020-04-19T10:00:00.000Z',
        updatedDateUtc: '2020-06-19T10:00:00.000Z',
      },
      createdDateUtc: '2020-06-19T10:00:00.000Z',
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

const invoicesEventsCreateMultiple = {
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
      type: 'INVOICE_CREATED',
      content: {
        invoiceId: 'd2fc1b32-c0cb-4d07-b2a0-a8470b13e53a',
        invoiceNumber: 'INV-002',
        lineItems: [
          {
            lineItemId: '2a701a96-f4ce-4891-8000-fb83a80fecc9',
            description: 'Services rendered',
            quantity: 1,
            unitCost: 300.0,
            lineItemTotalCost: 300.0,
          },
        ],
        status: 'DRAFT',
        dueDateUtc: '2020-05-30T10:00:00.000Z',
        createdDateUtc: '2020-05-19T10:00:00.000Z',
        updatedDateUtc: '2020-05-19T10:00:00.000Z',
      },
      createdDateUtc: '2020-05-19T10:00:00.000Z',
    },
  ],
};
/** eventItemsToInvoices */

// should create an invoice
assert.deepEqual(eventItemsToInvoices(invoicesEventsOnlyCreate.items, []), [{
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
assert.deepEqual(eventItemsToInvoices(invoicesEventsCreateThenUpdate.items, []), [{
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
assert.deepEqual(eventItemsToInvoices(invoicesEventsCreateThenDelete.items, []), [{
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
  status: 'DELETED',
  dueDateUtc: '2020-04-30T10:00:00.000Z',
  createdDateUtc: '2020-04-19T10:00:00.000Z',
  updatedDateUtc: '2020-04-19T10:00:00.000Z',
}]);

// should sort events before constructing invoices
assert.deepEqual(eventItemsToInvoices(invoicesEventsShuffled.items, []), [{
  invoiceId: '97f0821d-3517-471a-95f2-f00da84ec56e',
  invoiceNumber: 'INV-001',
  lineItems: [
    {
      lineItemId: '2686350b-2656-48a0-912d-763c06ef5c04',
      description: 'Supplies',
      quantity: 40,
      unitCost: 9.00,
      lineItemTotalCost: 360.0,
    },
  ],
  status: 'DRAFT',
  dueDateUtc: '2020-06-30T10:00:00.000Z',
  createdDateUtc: '2020-04-19T10:00:00.000Z',
  updatedDateUtc: '2020-06-19T10:00:00.000Z',
}]);

// should create multiple invoices
assert.deepEqual(eventItemsToInvoices(invoicesEventsCreateMultiple.items, []), [
  {
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
  {
    invoiceId: 'd2fc1b32-c0cb-4d07-b2a0-a8470b13e53a',
    invoiceNumber: 'INV-002',
    lineItems: [
      {
        lineItemId: '2a701a96-f4ce-4891-8000-fb83a80fecc9',
        description: 'Services rendered',
        quantity: 1,
        unitCost: 300.0,
        lineItemTotalCost: 300.0,
      },
    ],
    status: 'DRAFT',
    dueDateUtc: '2020-05-30T10:00:00.000Z',
    createdDateUtc: '2020-05-19T10:00:00.000Z',
    updatedDateUtc: '2020-05-19T10:00:00.000Z',
  },
]);
