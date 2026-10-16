/**
 * The table works with copies of the application rows and columns and writes its service fields to the copies: the row number, the column class.
 * Outside, to events, cells, details, and config callbacks, it gives the application objects.
 * A copy keeps a link to the application object under a symbol: field enumeration, spread, and JSON.stringify do not see the link.
 */
const appObjectKey: unique symbol = Symbol('table-bro:app-object');

/**
 * A copy of an application object or of another copy; fields are added to the copy. An object of a class keeps the
 * values of the getters of its class: a spread copies only the own fields, and the cells, the sort and the search read
 * the copy. The getters run on the object of the application, so they read its private fields too.
 */
export function copyAppObject<T extends object>(object: T, fields?: Partial<T>): T {
  const copy: T = {...classValues(object), ...object, ...fields};

  Object.defineProperty(copy, appObjectKey, {value: appObject(object)});

  return copy;
}

/** The application object the copy was made from. An object the table created itself is returned as is. */
export function appObject<T extends object>(object: T): T {
  return (<T & {[appObjectKey]?: T}>object)?.[appObjectKey] || object;
}

/** The getters of the classes of an object, by its prototype: a class has the same getters for all its rows. */
const classGetters = new WeakMap<object, string[]>();

/** The values of the getters of the classes of an object; a plain object has none. */
function classValues(object: object): Record<string, unknown> {
  const prototype = Object.getPrototypeOf(object);

  if (!prototype || prototype === Object.prototype) {
    return {};
  }

  let names = classGetters.get(prototype);

  if (!names) {
    names = [];

    for (let level = prototype; level && level !== Object.prototype; level = Object.getPrototypeOf(level)) {
      for (const [name, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(level))) {
        if (descriptor.get && !names.includes(name)) {
          names.push(name);
        }
      }
    }

    classGetters.set(prototype, names);
  }

  return Object.fromEntries(names.map(name => [name, (<Record<string, unknown>>object)[name]]));
}
