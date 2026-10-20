// The import of the skin defines <table-bro> and registers the skin nv
import '@table-bro/native';

const cols = [
  {
    title: 'Description',
    name: 'description'
  }, {
    title: 'Price',
    name: 'price',
    dataType: 'number',
    className: 'bro-col_text-right'
  }
];

const rows = [
  {
    description: 'Modern Cotton Chair',
    price: 100
  }, {
    description: 'Awesome Concrete Ball',
    price: 200
  }
];

const conf = {
  skin: 'nv',
  toolbarTitle: 'Orders'
};

const table = document.createElement('table-bro');

table.id = 'orders';
table.configure({cols, rows, conf});
table.addEventListener('bro-action', event => console.log(event.detail.action));

// The shadows of the table fall into the margins of this element: the visible table takes its full width
const container = document.createElement('div');

container.className = 'bro-table-shadow-container';
container.append(table);
document.body.append(container);
