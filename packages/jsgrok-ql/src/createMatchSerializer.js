const MAX_LINE_LEN = 80;
const cram = line => line.substr(0, MAX_LINE_LEN - 3);

const createMatchSerializer = ({ sourceCode }) => {
  const sourceLines = sourceCode.split('\n');

  return node => {
    const line = sourceLines[node.loc.start.line - 1];
    const startLine = node.loc.start.line;
    const startColumn = node.loc.start.column;
    const endColumn = node.loc.end.line !== node.loc.start.line ?
      line.length :
      node.loc.end.column
    ;

    if (line.length > MAX_LINE_LEN) {
      const token = cram(line.substring(startColumn, endColumn));
      const leadingChars = startColumn;
      const trailingChars = line.length - endColumn;
      const leadingString = leadingChars > 0 ?
        `+${leadingChars} ... ` :
        ``
      ;

      const trailingString = trailingChars > 0 ?
        ` ... +${trailingChars}` :
        ``
      ;

      return {
        match: `${leadingString}${token}${trailingString}`,
        line: startLine,
        start: leadingString.length,
        end: leadingString.length + token.length,
      }
    }
    else {
      return {
        match: line,
        line: startLine,
        start: startColumn,
        end: endColumn
      }
    }
  }
}

module.exports = createMatchSerializer