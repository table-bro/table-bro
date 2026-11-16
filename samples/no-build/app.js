// The import of the skin defines <table-bro> and registers the skin bs, and useBootstrap() gives it the Dropdown and
// the Tooltip of Bootstrap
import {useBootstrap}      from '@table-bro/bootstrap';
import {Dropdown, Tooltip} from 'bootstrap';

useBootstrap({Dropdown, Tooltip});

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

// The orders of the demos of Docs on table-bro.com
const rows = [
  {description: 'Handcrafted Wooden Table, Gorgeous Bronze Watch, Modern Fresh Salad, Refined Plastic Keyboard, Practical Rubber Shoes', price: 80},
  {description: 'Small Concrete Gloves, Licensed Frozen Pizza, Refined Plastic Keyboard, Modern Fresh Salad, Practical Rubber Shoes', price: 57},
  {description: 'Rustic Cotton Shirt, Ergonomic Steel Chair, Handcrafted Wooden Table, Small Concrete Gloves, Sleek Granite Lamp', price: 13},
  {description: 'Refined Plastic Keyboard, Ergonomic Steel Chair, Modern Fresh Salad, Gorgeous Bronze Watch, Sleek Granite Lamp', price: 27},
  {description: 'Licensed Frozen Pizza, Practical Rubber Shoes, Gorgeous Bronze Watch, Sleek Granite Lamp, Rustic Cotton Shirt', price: 96},
  {description: 'Small Concrete Gloves, Handcrafted Wooden Table, Gorgeous Bronze Watch, Ergonomic Steel Chair, Practical Rubber Shoes', price: 69},
  {description: 'Practical Rubber Shoes, Modern Fresh Salad, Refined Plastic Keyboard, Handcrafted Wooden Table, Gorgeous Bronze Watch', price: 91},
  {description: 'Modern Fresh Salad, Practical Rubber Shoes, Ergonomic Steel Chair, Licensed Frozen Pizza, Gorgeous Bronze Watch', price: 48},
  {description: 'Gorgeous Bronze Watch, Refined Plastic Keyboard, Licensed Frozen Pizza, Ergonomic Steel Chair, Rustic Cotton Shirt', price: 75},
  {description: 'Small Concrete Gloves, Refined Plastic Keyboard, Handcrafted Wooden Table, Rustic Cotton Shirt, Practical Rubber Shoes', price: 97},
  {description: 'Modern Fresh Salad, Refined Plastic Keyboard, Licensed Frozen Pizza, Practical Rubber Shoes, Sleek Granite Lamp', price: 54},
  {description: 'Modern Fresh Salad, Refined Plastic Keyboard, Ergonomic Steel Chair, Practical Rubber Shoes, Handcrafted Wooden Table', price: 99},
  {description: 'Sleek Granite Lamp, Ergonomic Steel Chair, Handcrafted Wooden Table, Gorgeous Bronze Watch, Practical Rubber Shoes', price: 55},
  {description: 'Refined Plastic Keyboard, Sleek Granite Lamp, Modern Fresh Salad, Handcrafted Wooden Table, Ergonomic Steel Chair', price: 81},
  {description: 'Refined Plastic Keyboard, Modern Fresh Salad, Practical Rubber Shoes, Small Concrete Gloves, Rustic Cotton Shirt', price: 86},
  {description: 'Practical Rubber Shoes, Small Concrete Gloves, Refined Plastic Keyboard, Licensed Frozen Pizza, Rustic Cotton Shirt', price: 56},
  {description: 'Rustic Cotton Shirt, Practical Rubber Shoes, Small Concrete Gloves, Ergonomic Steel Chair, Licensed Frozen Pizza', price: 20},
  {description: 'Modern Fresh Salad, Refined Plastic Keyboard, Small Concrete Gloves, Sleek Granite Lamp, Handcrafted Wooden Table', price: 34},
  {description: 'Refined Plastic Keyboard, Modern Fresh Salad, Small Concrete Gloves, Licensed Frozen Pizza, Rustic Cotton Shirt', price: 72},
  {description: 'Ergonomic Steel Chair, Practical Rubber Shoes, Gorgeous Bronze Watch, Rustic Cotton Shirt, Modern Fresh Salad', price: 57}
];

const conf = {
  skin: 'bs',
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
