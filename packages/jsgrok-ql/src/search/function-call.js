const { t } = require('./utils');
const { L_ANY, L_THIS, L_VOID } = require('../constants');
const notVoid = x => x !== L_VOID

const collectMatchingStaticFunctionCalls = (query, nodes) => {
  return nodes.filter(node => {
    if (!t.identifier(node.callee)) {
      return false;
    }
    else if (query.id !== node.callee.name) {
      return false;
    }
    else {
      return true;
    }
  })
}

const collectMatchingMemberFunctionCalls = (query, nodes) => {
  return nodes.filter(node => {
    if (!t.memberExpression(node.callee)) {
      return false;
    }
    else if (!t.identifier(node.callee.property)) {
      return false;
    }
    else if (query.id !== node.callee.property.name) {
      return false;
    }
    else {
      return true;
    }
  })
}

const collectMatchingReceiverCalls = (query, nodes) => {
  return nodes.filter(node => {
    if (query.receiver === L_ANY) {
      return true;
    }
    else if (query.receiver === L_THIS) {
      return t.thisExpression(node.callee.object);
    }
    else if (t.identifier(node.callee.object)) {
      return query.receiver === node.callee.object.name;
    }
    else {
      return false;
    }
  })
}

const collectMatchingArgumentCalls = (query, nodes) => {
  return nodes.filter(node => {
    if (!query.arguments.length) {
      return node;
    }
    else if (query.arguments[0] === L_VOID) {
      return node.arguments.length === 0;
    }
    else if (query.arguments.length !== node.arguments.length) {
      return false;
    }
    else {
      return true;
    }
  })
}

const collectMatchingArgumentValueCalls = (query, nodes) => {
  return nodes.filter(node => {
    return query.arguments.filter(notVoid).every((argSpec, index) => {
      const argNode = node.arguments[index]

      if (argSpec === L_ANY) {
        return true;
      }
      else if (typeof argSpec === 'number') {
        return t.literal(argNode) && argNode.value === argSpec;
      }
      else if (typeof argSpec === 'string') {
        return t.literal(argNode) && argNode.value === argSpec;
      }
      else {
        return false;
      }
    })
  })
}

// we'll avoid pipe / compose for the overhead
const collectStaticCalls = (query, nodes) => (
  collectMatchingArgumentValueCalls
  (
    query,
    collectMatchingArgumentCalls
    (
      query,
      collectMatchingStaticFunctionCalls
      (
        query,
        nodes
      )
    )
  )
)

const collectMemberCalls = (query, nodes) => (
  collectMatchingMemberFunctionCalls
  (
    query,
    collectMatchingReceiverCalls
    (
      query,
      collectMatchingArgumentCalls
      (
        query,
        collectMatchingArgumentValueCalls
        (
          query,
          nodes
        )
      )
    )
  )
)

class Visitor {
  constructor([ , query ]) {
    this.query = query;
  }

  CallExpression(node) {
    const { query } = this;

    if (query.receiver) {
      return collectMemberCalls(query, [node])
    }
    else {
      return collectStaticCalls(query, [node])
    }
  }
}

module.exports = {
  applyOn: [ 'function-call' ],
  Visitor: Visitor
}