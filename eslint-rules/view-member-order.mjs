// Puts the members of a view of Table, Bro in the order of BroView, so that its HTML comes first, as in an Angular component:
//
//   selector, template(), el, the other fields and static members, the constructor, events(), render(), renderAnimation(),
//   the other members
//
// A view is a class that implements BroView or a class of a *.view.ts file. The other fields and the other members keep
// their order. A member moves with the comments above it; a class with a comment at the end of a line is only reported.
const ranks = {selector: 0, template: 1, el: 2, events: 5, render: 6, renderAnimation: 7};

/**
 * The place of a member in a view: the rank of its name in BroView, 3 for the other fields and static members, such as
 * observedAttributes of a custom element, 4 for the constructor and 8 for the other members.
 * @param member - the member of the class
 */
function rank(member) {
  const name = member.key?.type === 'Identifier' && !member.computed ? member.key.name : null;
  const field = member.type === 'PropertyDefinition';

  if (name === 'selector' || name === 'el') {
    return field ? ranks[name] : 8;
  }

  if (name in ranks && member.type === 'MethodDefinition' && member.kind === 'method') {
    return ranks[name];
  }

  if (member.type === 'MethodDefinition' && member.kind === 'constructor') {
    return 4;
  }

  return (field || member.static) ? 3 : 8;
}

export default {
  meta: {
    type: 'layout',
    docs: {description: 'Put the members of a view of Table, Bro in the order of BroView, its template first'},
    fixable: 'code',
    schema: [],
    messages: {order: 'Put the members of the view in the order selector, template, el, the fields and static members, the constructor, events, render, renderAnimation, the rest.'}
  },
  create(context) {
    const source = context.sourceCode;
    const viewFile = /\.view\.ts$/.test(context.filename);

    return {
      ClassBody(body) {
        const view = viewFile || (body.parent.implements ?? []).some(clause => clause.expression.type === 'Identifier' && clause.expression.name === 'BroView');
        const members = body.body;

        if (!view || members.length < 2) {
          return;
        }

        const sorted = members.map((member, index) => ({member, index, rank: rank(member)})).sort((a, b) => a.rank - b.rank || a.index - b.index);

        if (sorted.every(({index}, i) => index === i)) {
          return;
        }

        // A member starts with the comments on the lines above it
        const starts = members.map(member => source.getCommentsBefore(member).find(comment => comment.loc.start.line > (source.getTokenBefore(member).loc.end.line))?.range[0] ?? member.range[0]);
        const trailing = members.some(member => source.getCommentsBefore(member).some(comment => comment.loc.start.line === source.getTokenBefore(member).loc.end.line && source.getTokenBefore(member).value !== '{'));
        const indent = source.lines[members[0].loc.start.line - 1].match(/^\s*/)[0];
        // Two members that were on adjacent lines stay so, such as a block of fields; the others take a blank line between them
        const adjacent = (a, b) => b === a + 1 && source.getLocFromIndex(starts[b]).line === members[a].loc.end.line + 1;
        const text = sorted.map(({index}, i) => {
          const chunk = source.text.slice(starts[index], members[index].range[1]);

          return i === 0 ? chunk : (adjacent(sorted[i - 1].index, index) ? `\n${indent}` : `\n\n${indent}`) + chunk;
        }).join('');

        context.report({
          node: sorted.find(({index}, i) => index !== i).member,
          messageId: 'order',
          fix: trailing ? null : fixer => fixer.replaceTextRange([starts[0], members.at(-1).range[1]], text)
        });
      }
    };
  }
};
