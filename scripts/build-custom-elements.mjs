// The Custom Elements Manifest of the core, dist/custom-elements.json, that editors and documentation tools read: the
// public elements <table-bro> and <table-bro-filter-drawer-container> with their attributes, properties, methods, events
// and slots. The API of an element is its interface of types/table-bro.ts, as TableBroHTMLElement, and its attributes
// are the observedAttributes of its class, so the manifest is written from the TypeScript sources by the compiler API:
// the analyzer of the manifests reads the classes, whose fields are private and whose public API is in the interfaces.
// Usage: node build-custom-elements.mjs, from the build of the core
import fs              from 'node:fs';
import {createRequire} from 'node:module';
import path            from 'node:path';
import url             from 'node:url';

const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const core = path.join(root, 'packages/core');
const ts = createRequire(import.meta.url)('typescript');

// The module of the elements in the package: the ESM build, which defines <table-bro> on import
const modulePath = 'dist/table-bro.esm.js';

const elements = [
  {
    tagName: 'table-bro',
    className: 'TableBro',
    classFile: 'table-bro.ts',
    api: 'TableBroHTMLElement',
    events: 'TableBroHTMLElementEventMap',
    attributes: {},
    slots: []
  },
  {
    tagName: 'table-bro-filter-drawer-container',
    className: 'TableBroFilterDrawerContainer',
    classFile: 'view/features/filters/filter-drawer.view.ts',
    api: 'BroFilterDrawerHTMLElement',
    events: 'BroFilterDrawerHTMLElementEventMap',
    // The attributes without a property of the interface
    attributes: {
      skin: {type: 'BroSkin', description: 'The skin of the drawer, as the skin of its table: its card, its header and its close button take the look of the skin.'}
    },
    slots: [
      {name: '', description: 'The table: <table-bro> or a wrapper of a framework.'},
      {name: 'filters', description: 'The filters of the application in the drawer.'}
    ],
    definedBy: 'defineTableBroFilterDrawerContainer()'
  }
];

const typesFile = path.join(core, 'types/table-bro.ts');
const types = ts.createSourceFile(typesFile, fs.readFileSync(typesFile, 'utf8'), ts.ScriptTarget.Latest, true);

/**
 * The text of a JSDoc comment of a node, without its tags; undefined without a comment.
 * @param node - the node with the comment
 */
function description(node) {
  const doc = ts.getJSDocCommentsAndTags(node).filter(item => ts.isJSDoc(item)).at(-1);
  const text = doc && ts.getTextOfJSDocComment(doc.comment);

  return text ? text.replace(/\s*\n\s*/g, ' ').trim() : undefined;
}

/**
 * The text of a node as it is in the source, on one line.
 * @param node - the node, as a type
 */
function source(node) {
  return node.getText(types).replace(/\s*\n\s*/g, ' ');
}

/**
 * The interface of types/table-bro.ts with the name.
 * @param name - the name of the interface
 */
function findInterface(name) {
  const found = types.statements.find(statement => ts.isInterfaceDeclaration(statement) && statement.name.text === name);

  if (!found) {
    throw new Error(`build-custom-elements: no interface ${name} in types/table-bro.ts`);
  }

  return found;
}

/**
 * The names that observedAttributes of a class returns.
 * @param file - the source of the class, relative to the core
 * @param className - the name of the class
 */
function observedAttributes(file, className) {
  const sourceFile = ts.createSourceFile(file, fs.readFileSync(path.join(core, file), 'utf8'), ts.ScriptTarget.Latest, true);
  const declaration = sourceFile.statements.find(statement => ts.isClassDeclaration(statement) && statement.name?.text === className);
  const getter = declaration?.members.find(member => ts.isGetAccessor(member) && member.name.getText(sourceFile) === 'observedAttributes');
  const list = getter?.body?.statements.find(statement => ts.isReturnStatement(statement))?.expression;

  if (!list || !ts.isArrayLiteralExpression(list)) {
    throw new Error(`build-custom-elements: no observedAttributes of ${className} in ${file}`);
  }

  return list.elements.map(item => item.text);
}

/**
 * The parameters of a method signature, with their types and the texts of their @param tags.
 * @param method - the method signature
 */
function parameters(method) {
  return method.parameters.map(parameter => {
    const tag = ts.getJSDocParameterTags(parameter)[0];
    const text = tag && ts.getTextOfJSDocComment(tag.comment)?.replace(/^-\s*/, '').replace(/\s*\n\s*/g, ' ');

    return {
      name: parameter.name.getText(types),
      ...(parameter.questionToken && {optional: true}),
      type: {text: source(parameter.type)},
      ...(text && {description: text})
    };
  });
}

/**
 * The declaration of an element in the manifest.
 * @param element - the element, from the list above
 */
function declaration(element) {
  const api = findInterface(element.api);
  const fields = api.members.filter(member => ts.isPropertySignature(member));
  const methods = api.members.filter(member => ts.isMethodSignature(member) && !['addEventListener', 'removeEventListener'].includes(member.name.getText(types)));
  const attributeNames = observedAttributes(element.classFile, element.className);

  const members = [
    ...fields.map(field => ({
      kind: 'field',
      name: field.name.getText(types),
      type: {text: source(field.type) + (field.questionToken ? ' | undefined' : '')},
      description: description(field),
      ...(attributeNames.includes(field.name.getText(types)) && {attribute: field.name.getText(types), reflects: true})
    })),
    ...methods.map(method => ({
      kind: 'method',
      name: method.name.getText(types),
      description: description(method),
      parameters: parameters(method),
      return: {type: {text: source(method.type)}}
    }))
  ];

  const attributes = attributeNames.map(name => {
    const field = fields.find(item => item.name.getText(types) === name);

    if (field) {
      return {name, type: {text: source(field.type)}, description: description(field), fieldName: name};
    }

    if (!element.attributes[name]) {
      throw new Error(`build-custom-elements: no description of the attribute ${name} of <${element.tagName}>`);
    }

    return {name, type: {text: element.attributes[name].type}, description: element.attributes[name].description};
  });

  const events = findInterface(element.events).members.filter(member => ts.isPropertySignature(member)).map(event => ({
    name: event.name.text,
    type: {text: source(event.type)},
    description: description(event)
  }));

  const defined = element.definedBy ? ` The application defines it with ${element.definedBy}.` : ' The core defines it on import.';

  return {
    kind: 'class',
    name: element.className,
    description: description(api) + defined,
    tagName: element.tagName,
    customElement: true,
    attributes,
    members,
    events,
    ...(element.slots.length > 0 && {slots: element.slots})
  };
}

const manifest = {
  schemaVersion: '2.1.0',
  readme: '',
  modules: [
    {
      kind: 'javascript-module',
      path: modulePath,
      declarations: elements.map(declaration),
      exports: elements.map(element => ({kind: 'custom-element-definition', name: element.tagName, declaration: {name: element.className, module: modulePath}}))
    }
  ]
};

fs.mkdirSync(path.join(core, 'dist'), {recursive: true});
fs.writeFileSync(path.join(core, 'dist/custom-elements.json'), JSON.stringify(manifest, null, 2) + '\n');
