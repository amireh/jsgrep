const { t } = require('./utils');
const { L_ANY, L_THIS } = require('../constants');

class Visitor {
  constructor([ , query ]) {
    this.query = query;
  }

  CallExpression(node) {
    let matchingNode;

    if (this.query.receiver) {
      matchingNode = this.checkMemberFunctionCall(node)
    }
    else {
      matchingNode = this.checkStaticFunctionCall(node)
    }

    if (!matchingNode) {
      return false;
    }

    return this.checkArguments(node);
  }

  checkStaticFunctionCall(node) {
    if (!t.identifier(node.callee)) {
      return false;
    }
    else if (this.query.id !== node.callee.name) {
      return false;
    }

    return node.callee
  }

  checkMemberFunctionCall(node) {
    if (!t.memberExpression(node.callee)) {
      return false;
    }
    else if (!t.identifier(node.callee.property)) {
      return false;
    }
    else if (this.query.id !== node.callee.property.name) {
      return false;
    }
    else if (!this.doesReceiverMatch(node.callee)) {
      return false;
    }

    return node.callee;
  }

  doesReceiverMatch(node) {
    if (this.query.receiver === L_ANY) {
      return true;
    }
    else if (this.query.receiver === L_THIS) {
      return t.thisExpression(node.object);
    }
    else if (t.identifier(node.object)) {
      return this.query.receiver === node.object.name;
    }
    else {
      return false;
    }
  }

  checkArguments(node) {
    if (!this.query.arguments.length) {
      return node;
    }

    if (this.query.arguments.length !== node.arguments.length) {
      return false;
    }

    return node;
  }
}

module.exports = {
  applyOn: [ 'function-call' ],
  Visitor: Visitor
}