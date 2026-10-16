import type {BroMcpExtension}      from '../extension.js';
import {generateCode}              from '../generate/generate-code.js';
import {type BroTarget, setupText} from '../generate/setup.js';
import {builtinSpecs}              from '../spec/builtin-specs.js';
import type {BroSpecSkin}          from '../spec/spec.js';
import {tableBroVersion}           from '../version.js';
import {type BroDocTopic, topics}  from './topics.js';

/** The short text the MCP server gives a client when it connects. */
export const serverInstructions = `Table, Bro ${tableBroVersion}: pixel-perfect Material data tables for Angular, and more. A Web Components table engine on top of existing UI components: `
  + 'the Custom Element <table-bro> with the skins mat (Angular Material), bs (Bootstrap 5) and nv (native HTML). '
  + 'Call get_started first: it explains how the table works and which tool to use when. Describe a table as a BroTableSpec '
  + '(with row details by default), check it with validate_spec, and get its code from generate_code. The server writes no files.';

/**
 * The one text an agent always reads: how the table works, a minimal working example for the target and the skin
 * of the project, and the topics of the reference.
 */
export function getStarted(options: {target?: BroTarget; skin?: BroSpecSkin} = {}, extensions: BroMcpExtension[] = []): string {
  const target = options.target ?? 'angular';
  const skin = options.skin ?? (target === 'angular' ? 'mat' : 'bs');
  const products = builtinSpecs.find(builtin => builtin.name === 'products')!;
  const code = generateCode(products.spec, {target, skin});
  // The page holds the cols, the rows and the config: the second file, after the type of the row
  const page = code.files[1];

  return [
    header(extensions).trim(),
    '## How Table, Bro works',
    find('basics')!.text().trim(),
    '## The order of the tools',
    find('workflow')!.text().trim(),
    `## A minimal table: ${target}, skin ${skin}`,
    `Setup, once per project:\n\n${setupText(code.setup)}`,
    `${page.path}:\n\n\`\`\`ts\n${page.content}\`\`\``,
    '## Topics of get_docs',
    topicList(extensions)
  ].join('\n\n');
}

/** One topic of the reference, the topics that match a query, or the list of the topics. */
export function getDocs(request: {topic?: string; query?: string} = {}, extensions: BroMcpExtension[] = []): string {
  const all = allTopics(extensions);

  if (request.topic) {
    const topic = all.find(item => item.name === request.topic);

    if (!topic) {
      return `${header(extensions)}No topic ${request.topic}. The topics:\n\n${topicList(extensions)}`;
    }

    return `${header(extensions)}# ${topic.title}\n\n${topic.text().trim()}`;
  }

  if (request.query) {
    const found = search(all, request.query).slice(0, 2);

    if (found.length) {
      return header(extensions) + found.map(topic => `# ${topic.title}\n\n${topic.text().trim()}`).join('\n\n');
    }

    return `${header(extensions)}Nothing found for "${request.query}". The topics:\n\n${topicList(extensions)}`;
  }

  return `${header(extensions)}The topics:\n\n${topicList(extensions)}`;
}

function find(name: string): BroDocTopic | undefined {
  return topics.find(topic => topic.name === name);
}

/** The topics of the reference with the topics of the paid modules that the server loads. */
export function allTopics(extensions: BroMcpExtension[]): BroDocTopic[] {
  return [...topics, ...extensions.flatMap(extension => extension.topics ?? [])];
}

function topicList(extensions: BroMcpExtension[]): string {
  return allTopics(extensions).map(topic => `- \`${topic.name}\`: ${topic.summary}`).join('\n');
}

/** Every answer names the version it describes and the paid modules that the server loads. */
function header(extensions: BroMcpExtension[]): string {
  const modules = extensions.length ? `, with ${extensions.map(extension => extension.package).join(', ')}` : '';

  return `_table-bro ${tableBroVersion}${modules}_\n\n`;
}

/**
 * The topics of a query, the best first. A word that most topics have weighs little, as row, and a rare one decides,
 * as height. A title and a summary weigh more than the text, and every next repeat of a word in the text adds less.
 */
function search(all: BroDocTopic[], query: string): BroDocTopic[] {
  const words = [...new Set(query.toLowerCase().split(/[^a-z0-9]+/).filter(word => word.length > 2).map(stem))];
  const docs = all.map(topic => ({topic, head: tokens(`${topic.name} ${topic.title} ${topic.summary}`), text: tokens(topic.text())}));
  const weights = words.map(word => Math.log((docs.length + 1) / (docs.filter(doc => count(doc.head, word) + count(doc.text, word)).length + 0.5)));

  return docs
    .map(doc => ({
      topic: doc.topic,
      score: words.reduce((sum, word, index) => {
        const repeats = count(doc.text, word);

        return sum + weights[index] * ((count(doc.head, word) ? 2 : 0) + 2 * repeats / (repeats + 1));
      }, 0)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.topic);
}

/** The words of a text in lower case; a name in camelCase gives itself and its parts, as replaceRows, replace and rows. */
function tokens(text: string): string[] {
  return text.split(/[^A-Za-z0-9]+/).flatMap(word => {
    const parts = word.split(/(?<=[a-z0-9])(?=[A-Z])/);

    return (parts.length > 1 ? [word, ...parts] : parts).map(part => part.toLowerCase());
  });
}

/** A word of a query without the s of the plural: rows finds row and rows. */
function stem(word: string): string {
  return (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) ? word.slice(0, -1) : word;
}

/** A word of the text matches by its start: row finds rows, but not arrow. */
function count(words: string[], word: string): number {
  return words.filter(item => item.startsWith(word)).length;
}
