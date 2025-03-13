---
title: Dart through the eyes of a JS/TS dev
description: Earlier this year I had an app idea (hopefully I'll write about it too), which led me out from my programmers "homeland", front-end web dev, to another direction. Since the idea was an app, I needed to learn mobile dev a little bit. I decided to go cross-platform with Dart & Flutter. It is my first experience of somewhat serious programming not in JS/TS and I'd like to share with you what I learned so far
tags:
  - programming
  - dart
  - typescript
publishedAt: 2023-11-27
coverImage: ../assets/dart-logo-with-background.webp
coverAlt: Dart logo on blue background with some small icons
---

## Intro

For those who may not be familiar already with Dart in general and Flutter in particular, those are relatively new players in the field. Dart is the dynamically-typed programming language and Flutter is a cross-platform UI framework. Both are developed by Google.

They were built from the ground up with the goal to be used to write client-side applications (but of course there are already ways to use Dart to write server-side code or CLI-application or whatever you might think of). So Dart doesn't have a huge legacy background to be backward-compatible with nor the first version of it had to be written in 10 days. JavaScript suffers from it up until today and will suffer in future. From the other side Dart can take inspiration from other widely-spread programming languages and Flutter has the opportunity to adopt best practices from a huge JS/TS ecosystem of frameworks.

My personal experience with it so far was pretty depthless based on the requirements of the projects that I used Flutter in, so I won't go into technical details of how for example Dart Event Loop is built and whether it is different from JavaScript implementation or not, I'll focus more on the developer experience of Dart compared to what we have in JS/TS and some insights that I found along the way.

## Backward variable/function declaration syntax

As I said previously Dart is taking inspiration from its older brothers at least to lower entry-level for newcomers. So the syntax in general can be considered Java-like. One of the things that I didn't think is a problem before is a variable or function declaration syntax.

In Typescript it goes like this: first you decide whether it is a constant value or not (use `const` or `let`/`var`) or use `function` keyword in case of function, then you come up with a variable name and then optionally add type to it after semicolon:

```typescript
function powOfTwo(a: number): number {
  return Math.pow(a, 2);
}

const result: number = powOfTwo(3);
```

In Java and as a result in Dart you too decide about variable mutability first (`var`/`final`/`const`, i'll talk about in deeper in a moment), but then you write type of it and only in the end you come up with a name:

```dart
double powOfTwo(double a) {
	return pow(a, 2);
}

final double result = powOfTwo(3);
```

It really blows my mind to write stuff in this order because I'm used to first find a good name for the variable and only after it think about its type since often times a name is literally a type hint (something that is called `isDisabled` obviously suggests that it should be of type `boolean`). Damn, there is even a [GitHub Issue](https://github.com/dart-lang/sdk/issues/56) for it so the maintainers/contributors had to address why they decided to put type declaration on the left side of variable name and not right. How do you, guys who write Java for a living, do it?

> Not sure if it is related or not, but `async/await` syntax is also mirrored: where in TS you place `async` you place function return type in Dart, where you place type definition in TS you place `async` in Dart. Feels like there are number of "slots" in the function declaration syntax and the developers each time have to decide where to put new keywords based on those slots that are not yet occupied😅

Also while I was writing this post I just realized that `function` keyword in `JS/TS` is simply redundant. When compiler / interpreter parses the code there is already enough info to distinguish between regular variable and a function: in case name is followed by assignment operator it is a variable, in case it is followed by parenthesis - it is a function. Simple as that considering the fact that class methods in `ES6` don't require any additional keywords. Now I wonder what is the history behind `function` keyword in `JS` in the first place🤔

## Two types of constant values

Both of JavaScript and Dart are somewhat compiled and interpreted languages at the same time based on the definition that we agree upon, but even so Dart came with a new for me concept of compile-time constants.

In modern JS/TS you have a `let` declaration, which mean that variable is mutable, and `const` declaration which means its immutable (although it is still not frozen at all). In Dart you have `var` as an alternative for `let`, but alternative for JS/TS `const` is Dart's `final`. E.g. you make variable `final` if it is assigned only one time and cannot be mutated afterwards.

One of Dart perks that are related to built or compiled languages is that it can distinguish between values that can be fully calculated and frozen at compile-time and those that can only be calculated once at run-time. For example we can create compile-time constant value like calculating the sum of two pre-defined numbers e.g. `const sum = 1 + 3`, but we have to use run-time constant in case like defining current timestamp e.g. `final now = DateTime.now()`. Under the hood it allows all sorts of optimizations and linters even automatically highlights the cases where you are able use compile-time syntax, but anyway it forced me to think differently from what I used to: now in addition to binary choice about mutability I also have another binary decision about immutability itself.

## Class method extensions

Have you ever thought while using some built-in class methods or some third-party library classes that it would be better if they implement this and that? For example I'd find it quite useful if ES6 `Map` class exposed `getOrThrow` method, which instead of returning `undefined` when it didn't find anything would well... throw an error. Without it I need to do it manually each time. The way to avoid unnecessary code duplication in JS/TS is to declare a helper function

```typescript
function getOrThrow<K, V>(map: Map<K, V>, key: K): V {
  if (!map.has(key)) {
    throw new Error("Not found");
  }

  return map.get(key)!;
}
```

Then we will use it each time we want to retrieve a non-nullable value from a map. But to me it still feels a bit dirty. We create a wrapper over pre-defined class and from my experience fewer wrappers the better. No need to say that IDE cannot suggest this wrapper to you during autocompletion. We can also modify `Map.prototype` to add our method, but it feels even dirtier...

In Dart there is a thing exactly for it, it is called Method Extensions. We can define an extension for any class even the one that we didn't define and those files that import both class and its extension will behave like the original class had all extension methods to begin with.

Let's take an example: just like in JS in order to map an array of values we use `map` method in Dart in order to map list of values we have `map` method. But while [JS's map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) gives us three callback arguments (element itself, its index and the whole array), [Dart's map](https://api.dart.dev/stable/3.2.1/dart-core/Iterable/map.html) only gives us one (element itself). So there is no out-of-the-box way to get element's index inside the callback. We need to convert list to map, and iterate over its entries so we have access to both element and its index:

```dart
const months = ['Jan', 'Feb', 'March'];

const monthIndexes = months.asMap().entries.map((entry) => entry.key).toList();
/// [0, 1, 2]
```

We could create the same wrapper function like we do in JS:

```dart
Iterable<T> indexedMap<E, T>(List<E> list, T Function(E e, int index) toElement) {
	return list.asMap().entries.map((entry) => toElement(entry.value, entry.key));
}

const months = ['Jan', 'Feb', 'March'];

const monthIndexes = indexedMap(months, (_, index) => index).toList();
/// [0, 1, 2]
```

But we can do even better in Dart (pay attention how `indexedMap` method magically appears on a simple list variable):

```dart
extension ListIndexedMap<E> on List<E> {
  Iterable<T> indexedMap<T>(T Function(E e, int index) toElement) {
    return asMap().entries.map((entry) => toElement(entry.value, entry.key));
  }
}

const months = ['Jan', 'Feb', 'March'];

const monthIndexes = months.indexedMap((_, index) => index).toList();
/// [0, 1, 2]
```

It gives a much cleaner code as third-party developers can enrich built-in Dart or Flutter API's without forcing us into endless wrappers hell. Also IDE's language server can scan available extensions and suggest their methods during autocompletion, which really blurs the boundary between built-in and extension-based methods (IDE does necessary import by itself).

A good example of it is [GoRouter](https://pub.dev/packages/go_router) lib that is used for implementing a web-like deep-link navigation in mobile apps. Each widget / component in a Flutter has a reference to its context of type `BuildContext` and the first way to navigate with GoRouter is this

```dart
build(BuildContext context) {
  return TextButton(
    onPressed: () => GoRouter.of(context).go('/users/123'),
  );
}
```

You pass your widget context to exposed GoRouter API and then call the `go` method. But lib authors also provide extension for `BuildContext` class, so you can navigate simply like this

```dart
build(BuildContext context) {
  return TextButton(
    onPressed: () => context.go('/users/123'),
  );
}
```

It gives a feeling of a very deep integration between built-in and third-party libraries, as you can tap into inner language / framework stuff and enhance it by your meaning, which in total leads to betted dev experience. But besides this fully subjective advantage the way the IDE autocompletion handles method extension makes sharing common practices between team members as lean as possible: you don't need to inform your teammate about new `indexedMap` helper function, he/she will see it inside IDE autocompletion suggestions.

## Reflection

Another new for me concept that I used in my everyday job, but didn't know it was a thing up until now, is reflection. According to Wikipedia reflection - is the ability of a process to examine, introspect, and modify its own structure and behavior. I don't know about you, but it ain't say much for me, so lets see reflection of JS in action:

```javascript
const a = {
  firstName: "Hello",
};

a.lastName = "World";
```

Did you notice anything strange here? I wouldn't notice it before, but here we see that despite the fact that object `a` was defined with a particular structure (e.g. having only one property of `firstName`), later on it is modified and now has two properties (`firstName` and `lastName`). It has no built-in dynamic structure, but it is dynamic by nature and it is an outcome of the fact that JS is a reflective programming language.

> This concept becomes very handy when you think of "Why would I use ES6 `Map` instead of plain object?". Besides the fact that `Map` allows to use literally anything you want as keys (not only `number`, `string` or `Symbol`), is there any real difference between `Map` and just `{}`? It happens so technically it is way more performant to avoid object structure changes at all. So as a result ES6 comes with a new `Map` class that is dynamic to begin with and when you add or remove new things with `Map` it doesn't need to change itself. Along the way `delete` operator, which is used to manually remove some variables or object properties, starts to be considered a bad practice based on the same reasons

Ok, so how did I get here, you ask? Long story short I tried to access a property by its name and without reflection it is impossible. Sounds weird, right? Lets take another example:

```javascript
const a = {
  firstName: "Hello",
};

console.log(a.firstName); // ✅ perfectly fine
console.log(a["firstName"]); // ✅ fine as well
```

In JS both ways to access `firstName` are valid, but the second implies reflection. In order to access property this way process should be able to examine the structure of the `a`. Lets make it a little more clear:

```javascript
function logProperty(value, propertyName) {
  console.log(value[propertyName]);
}

const a = {
  firstName: "Hello",
};

logProperty(a, "firstName");
```

In this example `logProperty` function has no clue about `value` structure, but it still is able to process normally. Why? Because it examines `value`. And in Dart as well as in a bunch of other languages you simply cannot do it

```dart
class Person {
	Person(this.firstName);

	final String firstName;
}

final person = Person('Hello');

person.firstName = 'World'; // ✅ right, Person class has this prop
person.lastName = 'World'; // ❌ wrong, Person class doesn't have this prop
person['lastName'] = 'World'; // ❌ wrong, Person class doesn't have this prop

log(person.firstName); // ✅ right
log(person['firstName']); // ❌ wrong
```

It makes you less flexible, but pays you back with way safer code. You don't need to take into account that some library function that you are using and passing there a variable might change it's variable structure and as a result will cause your next code to throw an exception. The structure is fixed. If you need to have an object of dynamic structure in Dart use maps:

```dart
final person1 = Map();
person['firstName'] = 'Hello';

// Dart also has a "Map Literal" shortland syntax, that is more alike plain objects in JS

final person2 = { 'firstName': 'Hello' };
person2['lastName'] = 'World';
```

It really boggled my mind why other language developers have two different words for the same concept, "object" and "map"/"dictionary", I considered it to be semantic stuff... no more🤓

## Types actually have runtime impact

One of the obvious things that Dart can benefit from is that it has built-in type system. TypeScript is really great and have even way more advanced and complex type system than Dart, but still after you compile it to JavaScript you loose all these features. I knew and expected it to be different in Dart, but one particular example caught me like "Aha! Gotcha" and it is how you can use generics in conjunction with Flutter `BuildContext`. Long story short in case you want to access a widget / component higher up the widget tree e.g. parent widget, you can get it from the context of your current widget. Looks something like that

```dart
final parent = context.findAncestorStateOfType<ParentWidget>();
```

Nothing special, generics syntax is the same as it is in TypeScript, except one thing: we don't pass any of arguments to `findAncestorStateOfType` call. How can it know what type of ancestor to look for? And here I get caught, because in TypeScript type assertion like above is used only to tell the compiler not to yell at me in case it cannot detect proper return type by itself. But in Dart types are internal language thing, so obviously function is able to somehow look on generic type that is being used during a call and process accordingly. For comparison the same code in TypeScript would look like this:

```typescript
const parent = context.findAncestorStateOfType(ParentWidget);
```

We have to pass parent widget type as an argument to the method. Not a big difference, but still makes you think about stuff under the hood.

## Outro

There are a number of Dart features that I still don't fully get and also Flutter framework itself, but this post is already long enough, so I'll stop here. But anyway learning new programming language is just like learning a new speaking language: by learning something different to what you are used to, you both learn new stuff and dive deeper into already known things.
