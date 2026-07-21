---
layout: post
title: Advanced JavaScript - Exercises and Gotchas
tags: [engineering]
---

A while back I worked through a set of JavaScript exercises designed to expose the parts of the language people gloss over: function binding, named vs. anonymous functions, method references, memoization, and the classic chained-assignment puzzle. They look trivial, but each one hides a real behavior you'll hit in production. Here are my notes, with the "why" spelled out.

## 1. Reimplementing `Function.prototype.bind`

The goal was to understand this snippet (the `bind` polyfill from early Prototype.js):

```javascript
Function.prototype.bind = function(){
  var fn = this, args = Array.prototype.slice.call(arguments), object = args.shift();
  return function(){
    return fn.apply(object,
      args.concat(Array.prototype.slice.call(arguments)));
  };
};
```

To read it you need three basics:

- `slice(start, end)` returns a subarray. With no arguments it clones the whole array.
- `shift()` removes and returns the **first** element.
- `concat()` joins two arrays.

The subtle part is `call` vs. `apply`. They do the same thing — bind a function to a `this` object — the only difference is how you pass arguments: `call` takes them individually, `apply` takes an array.

```javascript
func.call(this, arg1, arg2);
func.apply(this, [arg1, arg2]);
```

In the polyfill, `arguments` is **not** a real array, so it has no `slice` method. The trick `Array.prototype.slice.call(arguments)` borrows `slice` from `Array.prototype` and runs it against `arguments`. The later `concat` folds in any arguments that were bound up front. Once you see that, the whole function reads cleanly.

## 2. Named vs. anonymous functions

**#11 — a function with a name:**

```javascript
var ninja = function myNinja(){
  assert( ninja == myNinja, "This function is named two things - at once!" );
};
ninja();
assert( typeof myNinja == "undefined", "But myNinja isn't defined outside of the function." );
log( ninja );
```

Output:

```
PASS This function is named two things - at once!
PASS But myNinja isn't defined outside of the function.
LOG function myNinja(){ ... }
```

The takeaway: a named function expression keeps its name **inside** itself but is invisible outside. An anonymous function is `undefined` when referenced by name from the outside.

**#12 — a method on an object:**

```javascript
var ninja = {
  yell: function(n){
    return n > 0 ? ninja.yell(n-1) + "a" : "hiy";
  }
};
assert( ninja.yell(4) == "hiyaaaa", "A single object isn't too bad, either." );
```

Even though `yell` is defined inside `ninja`, you can still call it from outside via `ninja.yell(...)`.

## 3. The danger of referencing `this` by name

**#13 — what happens when you delete the original object?**

```javascript
var ninja = {
  yell: function(n){
    return n > 0 ? ninja.yell(n-1) + "a" : "hiy";
  }
};
assert( ninja.yell(4) == "hiyaaaa", "A single object isn't too bad, either." );

var samurai = { yell: ninja.yell };
var ninja = null;

try {
  samurai.yell(4);
} catch(e){
  assert( false, "Uh, this isn't good! Where'd ninja.yell go?" );
}
```

Output:

```
PASS A single object isn't too bad, either.
FAIL Uh, this isn't good! Where'd ninja.yell go?
```

Object assignment copies a **reference**, not the function. When `ninja` becomes `null`, the `ninja.yell` inside the method points at nothing.

**#14 — give the inner function a name and it fixes itself:**

```javascript
var ninja = {
  yell: function yell(n){
    return n > 0 ? yell(n-1) + "a" : "hiy";
  }
};
assert( ninja.yell(4) == "hiyaaaa", "Works as we would expect it to!" );

var samurai = { yell: ninja.yell };
var ninja = {};
assert( samurai.yell(4) == "hiyaaaa", "The method correctly calls itself." );
```

Naming the function lets it recurse via its own name instead of `ninja.yell(n-1)`. If you'd rather stay anonymous, `arguments.callee(n-1)` achieves the same (though `arguments.callee` is deprecated in strict mode).

## 4. Memoization (caching function results)

**#19 — caching via a static property:**

```javascript
function getElements( name ) {
  var results;
  if ( getElements.cache[name] ) {
    results = getElements.cache[name];
  } else {
    results = document.getElementsByTagName(name);
    getElements.cache[name] = results;
  }
  return results;
}
getElements.cache = {};
```

Simple and effective: attach a `cache` object to the function itself.

**#20 — the interview puzzle:** cache the result of `isPrime`. The catch is the chained assignment `a.x = a = {n:2}` in the setup. The short version: JavaScript resolves **all** the assignment targets' references first, then points them all at the rightmost value. So `a` ends up as `{n:2}` with no `x` property, while `b` (which still referenced the old object) ends up with `x` pointing at `{n:2}`. The answers (`a.x === undefined`, `b.x === {n:2}`) fall out of that.

The real lesson of the exercise, though, is memoization:

```javascript
function isPrime( num ) {
  if(isPrime.cache[num]) return isPrime.cache[num];
  else {
      var prime = num != 1; // Everything but 1 can be prime
      for ( var i = 2; i < num; i++ ) {
        if ( num % i == 0 ) {
          prime = false;
          break;
        }
      }
      isPrime.cache[num] = prime;
      return prime;
  }
}
isPrime.cache = {};
```

## 5. Looping with a callback

**#27 — implement the body so the callback receives the value and the array as `this`:**

```javascript
function loop(array, fn){
  for ( var i = 0; i < array.length; i++ )
    fn.call( array, array[i], i );
}
var num = 0;
loop([0, 1, 2], function(value, i){
  assert(value == num++, "Make sure the contents are as we expect it.");
  assert(this instanceof Array, "The context should be the full array.");
});
```

The trick is `fn.call(array, ...)` so that `this` inside the callback is the whole array, exactly as the assertion expects.

## My take

None of these are "hard" in isolation, but they're the kind of thing that separates someone who has *read* about closures and `this` from someone who has *been bitten* by them. The two I see most in real code reviews: (1) recursively referencing an object by variable name instead of using a named function / `arguments.callee`, and (2) forgetting that `this` inside a callback is whatever you bound it to — which is exactly why `fn.call(array, ...)` matters. If you internalize these six exercises, you'll debug a surprising number of "why is this undefined?" bugs in seconds.

*This page is original content; please cite the source if you repost.*
