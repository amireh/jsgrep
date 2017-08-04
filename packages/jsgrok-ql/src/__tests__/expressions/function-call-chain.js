const { matchify } = require('../utils')

module.exports = [
  // function-call . function-call
  matchify({
    query: 'f().g()',
    source: `
      [+] f().g()
      [+] f("Hello!").g()
      [+] f().g().h()
      [ ] f().h()
      [ ] f()
      [ ] g().g()
      [ ] g()
    `,
  }),

  matchify({
    query: 'foo().bar(String())',
    source: `
      [+] foo().bar("Hello!")
      [ ] foo().bar()
    `,
  }),

  // function-call . function-call . function-call
  matchify({
    query: 'f().g().h()',
    source: `
      [+] f().g().h()
      [ ] f().g().j()
      [ ] f().g()
      [ ] f()
    `
  }),

  // identifier . function-call
  matchify({
    query: 'x.f()',
    source: `
      [+] x.f()
      [ ] x.f
      [ ] x.g()
      [ ] y.f()
    `
  }),

  // identifier (L_THIS) . function-call
  matchify({
    query: 'this.f()',
    source: `
      [+] this.f()
      [+] this.f(23)
      [+] this.f().g()
      [ ] x.f()
      [ ] f().f()
      [ ] f()
    `,
  }),

  // identifier . identifier
  matchify({
    query: 'x.y',
    source: `
      [+] x.y
      [ ] x.z
      [ ] x.y()
      [ ] x.z()
      [ ] y.y
      [ ] y.y()
    `,
  }),

  // identifier . identifier . identifier
  matchify({
    query: 'a.b.c',
    source: `
      [+] a.b.c
      [ ] a.b.c()
      [ ] a.b().c
      [ ] a().b.c
      [ ] a().b().c()
      [ ] a.b.d
      [ ] a.c.c
      [ ] b.b.c
    `,
  }),
];
