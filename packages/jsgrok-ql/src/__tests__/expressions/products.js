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
      [ ] g().f()
      [ ] g()
    `,
  }),

  // T . function-call
  matchify({
    query: 'f()',
    source: `
      [+] f()
      [+] f().g()
      [ ] x.f()
      [ ] this.f()
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
      [ ] x.a.f()
      [ ] a.x.f()
      [ ] x.g()
      [ ] y.f()
      [ ] x.f
    `
  }),

  // identifier(L_THIS) . function-call
  matchify({
    query: 'this.f()',
    source: `
      [+] this.f()
      [+] this.f(23)
      [+] this.f().g()
      [ ] this.a.f()
      [ ] x.f()
      [ ] g().f()
      [ ] f().f()
      [ ] f()
    `,
  }),

  // identifier(L_ANY) . function-call
  matchify({
    query: '*.f()',
    source: `
      [+] a.f()
      [+] this.f()
      [ ] a.b.f()
      [ ] a.b.c.f()
      [ ] a.b.c.d.f()
      [ ] g().f()
      [ ] f().f()
      [ ] f()
    `,
  }),

  // identifier(L_ANY_GREEDY) . function-call
  matchify({
    query: '**.f()',
    source: `
      [+] a.f()
      [+] a.b.f()
      [+] a.b.c.f()
      [+] this.f()
      [+] this.f().g()
      [+] this.a.f()
      [+] this.a.b.f()
      [ ] f()
    `,
  }),

  // identifier:+ . function-call
  matchify({
    query: 'a.b.c.f()',
    source: `
      [+] a.b.c.f()
      [ ] a.b.f()
      [ ] a.f()
      [ ] f()
    `
  }),

  // identifier (mixed) . function-call
  matchify({
    spec: 'identifier (mixed) . function-call',
    query: '*.a.f()',
    source: `
      [+] b.a.f()
      [+] this.a.f()
      [ ] b.c.a.f()
      [ ] this.b.a.f()
      [ ] b.c.d.a.f()
      [ ] a.f()
      [ ] a.b.f()
      [ ] a.b.c.f()
      [ ] f()
    `,
  }),

  // identifier . identifier
  matchify({
    // debug: true,
    spec: 'identifier . identifier',
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

  // identifier:+ . identifier
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
