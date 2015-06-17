module.exports = function tokenize(line) {
  var elements = [];
  var curElement = '';
  for (var i = 0; i < line.length; i++) {
    switch (line[i]) {
    case ' ':
      elements.push(curElement);
      curElement = '';
      break;
    case ']':
    case '=':
    case ')':
      elements.push(curElement);
      elements.push(line[i]);
      curElement = '';
      break;
    case '[':
      elements.push('[');
      break;
    case '(':
      elements.push('(');
      break;
    default:
      curElement += line[i];
      break;
    }
  }
  if (curElement)
    elements.push(curElement);
  return elements;
};