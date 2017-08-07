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

EXAMPLES

    foo()
    foo().then()

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
    f(:string, *)

    # Call to static function "f" with 2 arguments, the last
    # being an object that has a "bar" property
    f(*, { bar })

    # Call to static function "f" with 2 arguments, the last
    # being an object that does not have a "bar" property
    f(*, { ^bar })

    # Call to static function "f" with an argument that is a function 
    # of arity 2
    f(:func(2))

MEMBER FUNCTION CALLS EXAMPLES:

    # Call to function "f" on any receiver with any number of arguments
    .f()

    # Call to function "f" on the receiver "this"
    this.f()

    # Call to function "f" on either the receiver "this" or "store"
    (this | store).f()

    # Call to function "f" on instances of class X
    :of(X).f()

    # Call to function "f" on the default export of the "store.js" module
    :exportOf(store.js).f()

    # Call to function "f" on an *instance* of the default export of the 
    # "store.js" module
    :of(:exportOf(store.js)).f()

    # Call to function "then" (e.g. Promise) with the second argument being
    # a function
    **.then(*, :func)

    # Call to function "then" where:
    # 1) the receiver is the return value of the call to function "request" 
    #    provided by the module "ajax.js"
    # 2) the first argument is null
    # 3) the second argument is a function of any arity
    :exportOf(ajax.js).request().then(null, :func)

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
    <Link onClick={:boolean} />

    # find Link components with onClick being a function of arity 2:
    <Link onClick={:func(2)} />

    # find Link components with an href value of either an array of strings, 
    # or an object:
    <Link href={(Array(String)|Object)} />

Type matchers
=============

Built-in class matchers
-----------------------

    :number
    :bool
    :string
    :object
    :func
    :regexp

`Function` type matcher
-----------------------

String type matcher
-------------------

EXAMPLES

    # Any string
    :string

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

    :func[(Type[,...Type])]

`Object` class matcher
----------------------

SYNOPSIS:

    :object

EXAMPLES:

    # Object has 0 more properties
    :object

`Object` structure matcher
---------------------

SYNOPSIS:

    { [ObjectProperty[,...ObjectProperty]] }

Where ObjectProperty is defined as:

    [^]%key%[: [^]TypeExpression]

EXAMPLES:

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

    # Object has the "a" property with a value of a numerical type
    { a: :number }

    # Object has the "a" property with a value of type other than a number
    { a: ^:number }

Module exports matcher
----------------------

This matcher is available only for scripts that use either the ES6 Module
format or the CommonJS format.

SYNOPSIS:

    :exportOf(%file%[, %symbol%])

When `%export%` is omitted, the `default` export is assumed.

EXAMPLES:

    # All references to the identifier assigned to the default export of the 
    # "ajax.js" module
    :exportOf(ajax.js)

    # Call to the default export of the ajax.js module
    :exportOf(ajax.js)()

    # Access to the "x" member of the default export of the ajax.js module
    :exportOf(ajax.js).x

    # Call to the "toJSON" member of the default export of the ajax.js module
    :exportOf(ajax.js).toJSON()

    # Import of the "x" export of the ajax.js module
    :exportOf(ajax.js, x)

Class instance matcher
----------------------

Match objects instantiated using the `new` keyword.

SYNOPSIS:

    :of(%identifier% | Type)

EXAMPLES:

    # An instance of a class or function named X
    :of(X)

    # An instance of the return value of the call to factory()
    :of(factory())

    # An instance of the default export of the module "class.js"
    :of(:exportOf(class.js))

Union type matching
-------------------

Group the type matchers with paranthesis (`()`) and separate them using `|`.

SYNOPSIS:

    (Type|Type[|...Type])

EXAMPLES:

    (:object | :string)

    # Object does not have the "a" property or does but its type is not equal 
    # to Type
    ({ ^a } | { a: ^Type })

Numerical value matchers
------------------------

SYNOPSIS

      :number
    | -? [0-9]+

EXAMPLES

    # Any number
    :number

    # The number literal 42
    42

    # The number literal -0.5
    -0.5

Regular expression matchers
---------------------------

EXAMPLES

    # match any kind of regex; literal or constructed using new RegExp()
    :regexp

    # match a regexp by pattern:
    /foo/

Function type matchers
----------------------

SYNOPSIS

    :func[(Arity[, Type])]

Where `Arity` is a number denoting the number of arguments the function has,
and `Type` is the type of the return value of the function.

EXAMPLES

    # Any function
    :func

    # A function that accepts 1 argument
    :func(1)

    # A function that accepts any number of argument
    :func(*)

    # A function that returns a boolean value
    :func(*, :bool)

    # A function that returns something other than a boolean (or just nothing)
    :func(*, ^:bool)

    # Equivalent to :func
    :func(*, *)

Miscellaneous type matchers
---------------------------

This group of matchers may receive a special treatment depending on where
they're used.

- `*` - anything (including nothing)
- `**` - greedy anything
- `:void` - nothing
- `^:void` - something

EXAMPLES

    # A function call with no arguments
    f(:void)

    # A function call with the first argument being of any type
    f(*)

    # A function call to "f" on any receiver (*)
    *.f()

    # A function call to "f" on any receiver, no matter how deeply nested:
    **.f()

    # A callback that accepts any number of arguments and returns nothing
    f(:func(*, :void))
