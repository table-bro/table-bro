// The vanilla stand: a plain <table-bro> in <table-bro-filter-drawer-container>, with the UMD builds of the core and of
// the skins bs and nv, with their tags and switches. The filters go to the table by its action, the table filters its rows.

const {defineTableBroFilterDrawerContainer, dispatchAction, events} = window.TableBro;
const {TableBroBootstrap, TableBroNative} = window;

const categories = ['Basics', 'Design', 'Details', 'Filtering'];

const rows = [
  {category: ['Basics'], featureName: 'Fixed row height', done: true},
  {category: ['Basics'], featureName: 'Fixed column width', done: true},
  {category: ['Basics'], featureName: 'Auto-detected column width', done: true},
  {category: ['Basics', 'Tooltip'], featureName: 'Truncated text with hover tooltips', done: true},
  {category: ['Basics'], featureName: 'Animated pagination <small>(including server-side data)</small>', done: true},
  {category: ['Design', 'CSS'], featureName: 'Supports CSS styling of <code>&lsaquo;table&rsaquo;</code>', done: true},
  {category: ['Design', 'Shadows'], featureName: 'Shadows', done: true},
  {category: ['Design', 'Dark', 'Light'], featureName: 'Dark/Light mode', done: true},
  {category: ['Details'], featureName: 'Default Details <small>as a regular row below</small>', done: true},
  {category: ['Filtering', 'Sorting', 'Search'], featureName: 'Toolbar with Search <small>(including server-side data)</small>', done: true},
  {category: ['Filtering', 'Sorting', 'Custom filters'], featureName: 'Custom user filters', done: false}
];

/**
 * The columns of the skin: its tags and its switch.
 * @param {string} skin - the skin of the table
 */
function columns(skin) {
  return [
    {title: 'Feature', name: 'featureName', html: true},
    {title: 'Category', name: 'category', component: {selector: `bro-${skin}-tags`}},
    {title: 'Done', name: 'done', component: {selector: 'bro-switch', attrs: {checked: (col, row) => row.done}}}
  ];
}

/**
 * The text of a feature name, without its markup.
 * @param {string} html - the feature name
 */
function toText(html) {
  const div = document.createElement('div');

  div.innerHTML = html;

  return div.textContent || '';
}

/**
 * The fields of the skin: Bootstrap for bs, native elements for nv.
 * @param {string} skin - the skin of the table
 */
function renderFilters(skin) {
  const form = document.createElement('form');
  const options = categories.map(category => `<option value="${category}">${category}</option>`).join('');

  form.setAttribute('slot', 'filters');
  form.innerHTML = (skin === 'bs')
    ? `
      <div class="mb-2"><label class="form-label w-100 mb-0">Feature<input type="search" class="form-control mt-1" name="featureName" autocomplete="off"></label></div>
      <div class="mb-2"><label class="form-label w-100 mb-0">Category<select class="form-select mt-1" name="category"><option value="">Any</option>${options}</select></label></div>
      <button type="reset" class="nav-link px-0">Clear</button>`
    : `
      <p><label>Feature<br><input type="search" name="featureName" autocomplete="off"></label></p>
      <p><label>Category<br><select name="category"><option value="">Any</option>${options}</select></label></p>
      <p><button type="reset">Clear</button></p>`;

  return form;
}

/**
 * The filters go to the table by its action; a cleared field goes as an empty value.
 * @param {HTMLElement} table - the table
 * @param {HTMLFormElement} form - the filters
 */
function applyFilters(table, form) {
  const data = new FormData(form);

  dispatchAction(table, events.filtersFilterEvent, {
    featureName: data.get('featureName') || undefined,
    category: data.get('category') || undefined
  });
}

/**
 * The skin of a table is set at init, so another skin creates the table and its filters again.
 * @param {string} skin - the skin of the table
 */
function render(skin) {
  const container = document.querySelector('table-bro-filter-drawer-container');
  const table = document.createElement('table-bro');
  const form = renderFilters(skin);

  table.configure({
    cols: columns(skin),
    rows,
    conf: {
      skin,
      toolbarTitle: 'Features',
      components: {toolbarMain: {buttons: [{buttonTitle: 'Filters', eventType: events.filtersToggleEvent}]}},
      // The local mode: the rule of the page for the rows and the filters
      filtersTransform: (rows, filters) => rows.filter(feature => {
        return (!filters.featureName || toText(feature.featureName).toLowerCase().includes(filters.featureName.toLowerCase()))
          && (!filters.category || feature.category.includes(filters.category));
      })
    }
  });

  container.replaceChildren(table, form);
  container.setAttribute('skin', skin);

  form.addEventListener('input', () => applyFilters(table, form));
  // A reset changes the fields after its event
  form.addEventListener('reset', () => setTimeout(() => applyFilters(table, form)));
}

TableBroBootstrap.withTags();
TableBroBootstrap.withSwitch();
TableBroNative.withTags();
defineTableBroFilterDrawerContainer();
render('bs');

document.querySelectorAll('input[name="vanilla-skin"]').forEach(radio => {
  radio.addEventListener('change', () => render(radio.value));
});
