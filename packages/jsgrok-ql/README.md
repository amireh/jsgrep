% jsgrok-ql(1)
% Ahmad Amireh
% July 29, 2017

Description
===========

jsgrok-ql is the query language used by jsgrok(1) to search for JavaScript
expressions.

Queries are designed to be familiar to the JavaScript programmer by loosely
following the JavaScript syntax.

Using this guide
----------------

How to read the synopsis of functions in the following sections:

- Placeholders for arguments that you should substitute are denoted by
  surrounding the placeholder with the `%` symbol. For example, the
  `%identifier%` argument for a function call expression should be substituted
  by the function name that is being searched for.
- Tokens inside brackets (`[]`) are optional.
- Tokens inside nested brackets (`[X[,...X]]`) indicates the token may be
  repeated.

Otherwise, all other characters must be regarded as literals.

Expression matchers
===================

Function calls
--------------

SYNOPSIS:

    [Receiver.]%identifier%([ void | [ Type[, ...Type] ] ])

EXAMPLES:

    # Call to static function "f" with any number of arguments
    f()

    # Call to static function "f" with 0 arguments
    f(void)

    # Call to static function "f" with 2 arguments of any type
    f(*, *)

    # Call to static function "f" with 2 arguments, the first
    # being the number value 42 while the second being of any type
    f(42, *)

    # Call to static function "f" with 2 arguments, the first
    # being a String of any value
    f(String, *)

    # Call to static function "f" with 2 arguments, the last
    # being an object that has a "bar" property
    f(*, Object(bar))

    # Call to static function "f" with 2 arguments, the last
    # being an object that does not have a "bar" property
    f(*, Object(^bar))

    # Call to static function "f" with an argument that is a function 
    # of arity 2
    f(Function(*,*))

MEMBER FUNCTION CALLS EXAMPLES:

    # Call to function "f" on any receiver with any number of arguments
    .f()

    # Call to function "f" on the receiver "this"
    this.f()

    # Call to function "f" on either the receiver "this" or "store"
    (this | store).f()

    # Call to function "f" on instances of class X
    Of(X).f()

    # Call to function "f" on the default export of the "store.js" module
    Module(store.js).f()

    # Call to function "f" on an *instance* of the default export of the 
    # "store.js" module
    Of(Module(store.js)).f()

    # Call to function "then" (e.g. Promise) with the second argument being
    # a function
    .then(*, Function)

    # Call to function "then" where:
    # 1) the receiver is the return value of the call to function "ajax" 
    #    provided by the module "ajax.js"
    # 2) the first argument is null
    # 3) the second argument is a function
    Module(ajax.js).ajax().then(null, Function)

JSX
---

SYNOPSIS:

    <%name% [...Property] />

Where Property is defined as:

    %key%={Type}

EXAMPLES:

    # find Link components:
    <Link />

    # find Link components with an onClick property defined:
    <Link onClick />

    # find Link components with onClick having a boolean value
    <Link onClick={Boolean} />

    # find Link components with onClick being a function of arity 2:
    <Link onClick={Function(*,*)} />

    # find Link components with an href value of either an array of strings, 
    # or an object:
    <Link href={(Array(String)|Object)} />

Type matchers
=============

`Function` type matcher
-----------------------

String type matcher
-------------------

EXAMPLES

    # Any string
    String()

    # An empty string
    ""

    # The "foo" string
    "foo"

**Wildcards**

The character sequence ".*" found in string matchers is treated as a wildcard.

EXAMPLES

    # Match "Hello", "Hello World!", or "Hello anything"
    "Hello.*"

SYNOPSIS:

    Function([Type[,...Type]])

`Object` type matcher
---------------------

SYNOPSIS:

    Object([ObjectProperty[,...ObjectProperty]])

Where ObjectProperty is defined as:

    [^]%key%[: [^]Type]

EXAMPLES:

    # Object has 0 more properties
    Object()

    # Object has 0 properties (i.e. an empty object)
    {}
    
    # Object has the "a" property
    { a }

    # Object does not have the "a" property
    { ^a }

    # Object has both the "a" and "b" properties
    { a, b }

    # Object has the "a" property but not the "b" property
    { a, ^b }

    # Object may have the "a" property but not the "b" property
    { ?a, ^b }

    # Object is not empty but has neither "a" nor "b" for properties
    { ^a, ^b }

    # Object has the "a" property with a value of type Type
    { a: Type }

    # Object has the "a" property with a value of type other than Type
    { a: ^Type }

Module exports matcher
----------------------

This matcher is available only for scripts that use either the ES6 Module
format or the CommonJS format.

SYNOPSIS:

    Module(%file%)[.%export%]

When `%export%` is omitted, the `default` export is assumed.

EXAMPLES:

    # Call to the default export of the ajax.js module
    Module(ajax.js).default()

    # Call to the "toJSON" exports of the ajax.js module
    Module(ajax.js).toJSON()

    # Access to the "x" export of the ajax.js module
    Module(ajax.js).x

Module imports matcher
----------------------

This matcher is available only for scripts that use either the ES6 Module
format or the CommonJS format.

SYNOPSIS:

    Import(%file%).%export%

EXAMPLES:

    # Import of any symbol from the ajax.js module
    Import(ajax.js)

    # Import of the "default" symbol from the ajax.js module
    Import(ajax.js, default)

    # Import of the "x" symbol from the ajax.js module
    Import(ajax.js, x)

Class instance matcher
----------------------

Match objects instantiated using the `new` keyword.

SYNOPSIS:

    Of(%identifier% | Type)

EXAMPLES:

    # An instance of a class or function named X
    Of(X)

    # An instance of the return value of the call to factory()
    Of(factory())

    # An instance of the default export of the module "class.js"
    Of(Module(class.js).default)

Union type matching
-------------------

Group the type matchers with paranthesis (`()`) and separate them using `|`.

SYNOPSIS:

    (Type|Type[|...Type])

EXAMPLES:

    (Object|String)

    # Object does not have the "a" property or does but its type is not equal 
    # to Type
    (Object(^a) | Object(a != Type))

```shell
# A function call to "foo" with the first argument being either an Object or a 
# String
echo ".foo((Object|String))" | jsgrok
```

Numerical value matchers
------------------------

EXAMPLES

    Number()
    42
    -0.5

Regular expression matchers
---------------------------

EXAMPLES

    # match any kind of regex; literal or constructed using new RegExp()
    RegExp()

    # match a regexp by pattern:
    /foo/

#### Exact decimals and integers

```sql
SELECT node
WHERE
      type = "function"
  AND arg-count = 3
  AND (
        arg-at(1) > 0
    OR  arg-at(1) = 1..3
  )

SELECT "function"
WHERE
  name = "Store"
  AND arg-count = 3
  AND TYPE(args[3]) = "object"
  AND NOT OBJECT_HAS_PROPERTY(args[3], "schema")
```

```shell
[arg-count=1]
[arg[1]=1.5]
```

Range matchers
--------------

SYNOPSIS:

    %begin%..%end%

EXAMPLES:

    1..3

### Ranges

```shell
[call=func][arg-count=1..3]
```
