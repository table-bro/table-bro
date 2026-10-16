// Puts the signal inputs of a component in order: col, row and config (or conf) first as a group of their own, then
// a blank line and the other inputs by the name of the field:
//
//   readonly col = input<BroCol>();
//   readonly row = input<BroRow>();
//   readonly config = input<BroResolvedConfig>();
//
//   readonly buttonTitle = input<string>('');
//   readonly icon = input<string>();
//
// An input moves with the comments above it; the line comments above the first input stay at the top, as they speak of
// all the inputs. Inputs that other members split apart, and a class with a comment at the end of a line, are only
// reported.
const ranks = {col: 0, row: 1, config: 2, conf: 2};

/**
 * Whether a member is a field that takes input() or input.required().
 * @param member - the member of the class
 */
function isInput(member) {
  const callee = member.type === 'PropertyDefinition' && member.value?.type === 'CallExpression' ? member.value.callee : null;

  return callee?.type === 'Identifier' ? callee.name === 'input' : callee?.type === 'MemberExpression' && callee.object.type === 'Identifier' && callee.object.name === 'input' && callee.property.name === 'required';
}

/**
 * The name of the field of an input.
 * @param member - the input
 */
function nameOf(member) {
  return member.key.type === 'Identifier' ? member.key.name : String(member.key.value);
}

export default {
  meta: {
    type: 'layout',
    docs: {description: 'Put the inputs of a component in order: col, row, config first as a group, then the others by name'},
    fixable: 'code',
    schema: [],
    messages: {
      order: 'Put the inputs in order: col, row, config, a blank line, then the other inputs by the name of the field.',
      together: 'Keep the inputs of the component together.'
    }
  },
  create(context) {
    const source = context.sourceCode;

    return {
      ClassBody(body) {
        const members = body.body;
        const first = members.findIndex(isInput);

        if (first === -1) {
          return;
        }

        const count = members.filter(isInput).length;
        const inputs = members.slice(first, first + count);

        if (!inputs.every(isInput)) {
          context.report({node: members.slice(first).find(member => !isInput(member)), messageId: 'together'});

          return;
        }

        // An input starts with the comments on the lines above it
        const above = inputs.map(input => source.getCommentsBefore(input).filter(comment => comment.loc.start.line > source.getTokenBefore(input).loc.end.line));
        const trailing = inputs.some(input => source.getCommentsBefore(input).some(comment => comment.loc.start.line === source.getTokenBefore(input).loc.end.line && source.getTokenBefore(input).value !== '{'));
        const head = above[0].slice(0, above[0].findIndex(comment => comment.type !== 'Line') === -1 ? above[0].length : above[0].findIndex(comment => comment.type !== 'Line'));
        const starts = inputs.map((input, i) => (i === 0 ? above[i].slice(head.length) : above[i])[0]?.range[0] ?? input.range[0]);
        const indent = source.lines[inputs[0].loc.start.line - 1].match(/^\s*/)[0];
        const sorted = inputs.map((input, index) => ({index, name: nameOf(input)})).sort((a, b) => ((ranks[a.name] ?? 3) - (ranks[b.name] ?? 3)) || (a.name in ranks ? 0 : a.name.localeCompare(b.name, 'en')));
        const grouped = sorted.findIndex(({name}) => !(name in ranks));
        const text = (head.length ? source.text.slice(head[0].range[0], head.at(-1).range[1]) + `\n${indent}` : '') + sorted.map(({index}, i) => {
          const chunk = source.text.slice(starts[index], inputs[index].range[1]);

          return i === 0 ? chunk : (i === grouped ? `\n\n${indent}` : `\n${indent}`) + chunk;
        }).join('');
        const range = [head[0]?.range[0] ?? starts[0], inputs.at(-1).range[1]];

        if (source.text.slice(...range) === text) {
          return;
        }

        context.report({
          node: inputs[sorted.find(({index}, i) => index !== i)?.index ?? 0],
          messageId: 'order',
          fix: trailing ? null : fixer => fixer.replaceTextRange(range, text)
        });
      }
    };
  }
};
