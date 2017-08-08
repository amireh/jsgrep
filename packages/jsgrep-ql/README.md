# jsgrep-ql(1) -- jsgrep(1) query evaluator

## DESCRIPTION

jsgrep-ql defines and evaluates the query language used by jsgrep(1) to search
for JavaScript expressions.

jsgrep-ql queries are designed to be familiar to the JavaScript programmer by
following the JavaScript syntax when possible.

## HOW TO USE THIS GUIDE

- Placeholder tokens that should be substituted are denoted by surrounding the
  token with the `%` symbol. For example, the `%identifier%` token in a
  function call expression must be substituted by the function name that is
  being searched for.
- Tokens inside brackets (`[]`) are optional.
- Tokens inside nested brackets (`[X[,...X]]`) indicates the token may be
  repeated.
- All other characters must be regarded verbatim.

## EXPRESSIONS

A jsgrep-ql query is composed of either a single expression or multiple
expressions joined by an expression production operator like `.`.

### Calls to static functions

Query calls to static functions.

SYNTAX

    %identifier%([ :void | Type[, ...Type] ])

WHERE

- `Type` may be a type expression or the symbol `*` to match any type

EXAMPLES

    # Call to static function "f" with any number of arguments
    f()

    # Call to static function "f" with 0 arguments
    f(:void)

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

### Calls to member functions

Query calls to functions defined on an object.

SYNTAX

    [Receiver.]%identifier%([ :void | [ Type[, ...Type] ] ])

WHERE

- `Receiver` may be an identifier or `*` to match any identifier or `**`
  to match all preceding identifiers if any

EXAMPLES

    # Call to function "f" on any receiver with any number of arguments
    *.f()

    # Call to function "f" on the receiver "this"
    this.f()

    # Call to function "f" on either the receiver "this" or "store"
    (this | store).f()

    # Call to function "f" on the default export of the "store.js" module
    :exportOf(store.js).f()

    # Call to function "f" on instances of class X
    :of(X).f()

    # Call to function "f" on an *instance* of the default export of the 
    # "store.js" module
    :of(:exportOf(store.js)).f()

    # Call to function "then" (e.g. Promise) with the second argument being
    # a function that returns another Promise using the "new" keyword
    **.then(*, :func(*, :of(Promise)))

    # Call to function "then" where:
    # 1) the receiver is the return value of the call to function "request" 
    #    provided by the module "ajax.js"
    # 2) the first argument is null
    # 3) the second argument is a function of any arity
    :exportOf(ajax.js).request().then(null, :func)

### Access of object properties

SYNTAX

    [Receiver.]%identifier%

WHERE

- `Receiver` may be an identifier or `*` to match any identifier or `**`
  to match all preceding identifiers if any

EXAMPLES

    # Access to the property "x" of the identifier "a"
    a.x

### Properties of JSX elements

Query instantiated JSX elements with certain properties.

SYNTAX

    <%identifier% [...JSXProperty] />

Where `JSXProperty` is defined as:

    %key%[={Type}]

EXAMPLES

    # find Link components:
    <Link />

    # find Link components with an onClick property defined:
    <Link onClick /

    # find Link components without an onClick property defined:
    <Link ^onClick />

    # find Link components with onClick having a boolean value
    <Link onClick={:bool} />

    # find Link components with onClick being a function of arity 2:
    <Link onClick={:func(2)} />

    # find Link components with an href value of either an array of strings, 
    # or an object:
    <Link href={(:array(:string) | :object)} />

### Use of exported symbols from modules

This type matcher is available only for scripts that use either the ES6 Module
format or the CommonJS format.

SYNTAX

    :exportOf(%file%[, %symbol%])

When `%export%` is omitted, the `default` export is assumed.

EXAMPLES

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

## TYPE EXPRESSIONS

The constructs described in this section may be used anywhere `Type` is
referenced in an expression syntax synopsis but can not be used as a query
expression unless stated otherwise in the documentation.

Type expressions may be negated by prefixing them with the `^` symbol if the
expression syntax defines it.

The special `*` type expression will match any type.

The special `:void` type expression will not match if anything in its position
is defined.

### Function values

SYNTAX

    :func[(Arity[, Type | :void])]

WHERE

- `Arity` is a number denoting the number of arguments the function has,
- `Type` is the type of the return value of the function.

EXAMPLES

    # Any function
    :func

    # A function that accepts 1 argument
    :func(1)

    # A function that accepts any number of argument and returns anything
    :func(*)

    # A function that accepts anything and returns a boolean value
    :func(*, :bool)

    # A function that accepts anything and returns nothing
    :func(*, :void)

    # A function that returns something other than a boolean (or nothing at
    # all)
    :func(*, ^:bool)

    # Equivalent to :func
    :func(*, *)

### String values

SYNTAX

    :string | "%string%"

EXAMPLES

    # Any string
    :string

    # An empty string
    ""

    # The "foo" string
    "foo"

**Wildcards**

The character sequence `.*` found in string matchers is treated as a wildcard.

EXAMPLES

    # Match "Hello", "Hello World!", or `Hello ${'anything'}`
    "Hello.*"

### Object values

SYNTAX

    :object | { [ObjectProperty[,...ObjectProperty]] }

Where `ObjectProperty` is defined as:

    [^]%key%[: [^]Type]

EXAMPLES

    # Object has 0 more properties
    :object

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

### Boolean values

SYNTAX

    :bool | true | false

EXAMPLES

    # Any boolean value
    :bool

    # A true value
    true

    # A false value
    false

### Class instances

Match objects instantiated using the `new` keyword.

SYNTAX

    :of(%identifier% | Type)

EXAMPLES

    # An instance of a class or function named X
    :of(X)

    # An instance of the default export of the module "class.js"
    :of(:exportOf(class.js))

### Numerical values

SYNTAX

    :number | [-]%number%

EXAMPLES

    # Any number
    :number

    # The number 42
    42

    # The number -0.5
    -0.5

### Regular expressions

SYNTAX

    :regexp | /%pattern%/

EXAMPLES

    # match any kind of regex; literal or constructed using new RegExp()
    :regexp

    # match a regexp that has "foo" for a pattern:
    /foo/

## TYPE EXPRESSION KEYWORDS

This group of matchers may receive a special treatment depending on where
they're used.

- `*` - denotes anything (including nothing)
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

## TYPE EXPRESSION UNIONS

A type expression union makes it possible to match multiple types at any
certain position.

SYNTAX

    (Type | Type [|...Type])

EXAMPLES

    # An object or a string
    (:object | :string)

    # Object does not have the "a" property or does but it's not a number
    ({ ^a } | { a: ^:number })
