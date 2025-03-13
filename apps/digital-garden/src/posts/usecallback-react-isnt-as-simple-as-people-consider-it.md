---
title: useCallback - React isn't as simple as people consider it
description: "Recently I switched camps from Angular to React. Comparing these two technologies head-to-head is quite naive thing to do. There is a long-standing perception in the tech world, that React may lack some features, but it is simple and elegant, while Angular is complex and heavy, but it is a \"batteries included\" solution. Without experience with react I had nothing to do with this perception, but now it changed. I don't agree, that React is simple and `useCallback` is my proof"
tags:
  - react
  - programming
publishedAt: 2024-05-29
coverImage: ../assets/react-usecallback.png
coverAlt: AI generated art of React logo
---

## What is a UI in React's view

In the post [The Two Reacts](https://overreacted.io/the-two-reacts/) Dan Abramov gives a mindset behind React as something dual: from one side UI is a derivative of the app state, from another - it is a derivative of data, fetched from a server. It indeed sounds very simple and elegant especially after migration from class-based components to function-based components since the term "function" literally means "function".

In this blog I use React's JSX to decompose interface into reusable small pieces. To minimize client-side JS, the server renders all this React into HTML string and responds with it. Request handler consists from collecting the required data and passing it to a three of higher-order JSX functions. In the system like this it is easy to understand what where and when happens: finding a target piece of code always starts from the top and goes strictly down the tree without need to jump across different branches left or right. The only term really required for the job is a "function"/"derivative", nothing else.

Recently I started to work on a small pet-project and chose this time a fully-fledged client-side React as a basis, because here i needed a lot more interactive UI compared to this blog. Almost immediately i realised, that mindset "UI is a derivative of app state / data from a server" isn't enough, real code goes out of it very fast.

## First case: works correctly, but has excessive computations

```tsx
export const Counter: FC = () => {
  const [counter, setCounter] = useState(0);

  const logCounter = () => {
    console.log(`Count is: ${counter}`);
  };

  const increaseCounter = () => {
    setCounter(counter + 1);
  };

  return (
    <div className="flex flex-col gap-2 items-start">
      <p>{counter}</p>
      <button onClick={increaseCounter}>Increase Counter</button>
      <button onClick={logCounter}>Log Counter</button>
    </div>
  );
};
```

Lets look into this component. Component has state to store current value of the counter, `div` to show it and a couple of buttons to somehow interact with it. Everything is as straightforward as it can be, but any JS dev would notice here performance issues. In the current implementation every render cycle of the component (meaning execution of `Counter` function) creates new instances of functions `logCounter` and `increaseCounter`. The code of these functions doesn't change from render to render, but instances from the previous render cycles are thrown in to garbage collector adding load to the browser. Let's say you have 100 components like this on the screen, it means that besides 100 instances of `Counter` itself we store in the memory 100 instances of `logCounter` and 100 instances of `increaseCounter`, 300 instances in total. Each re-render is a clean up of 300 variables and creation of 300 new variables (if all the 100 components were changed between renders of course). React authors clearly see this issue, therefore they propose a solution - built-in `useCallback` hook, that knows to persist function instance between re-renders.

## Second case: works incorrectly, but minimal computations

```tsx
export const Counter: FC = () => {
  const [counter, setCounter] = useState(0);

  const logCounter = useCallback(() => {
    console.log(`Count is: ${counter}`);
  }, []);

  const increaseCounter = useCallback(() => {
    setCounter(counter + 1);
  }, []);

  return (
    <div className="flex flex-col gap-2 items-start">
      <p>{counter}</p>
      <button onClick={increaseCounter}>Increase Counter</button>
      <button onClick={logCounter}>Log Counter</button>
    </div>
  );
};
```

It looks something like this. This time any dev familiar with React would alarm: empty dependency arrays of `useCallback` (because of which instances of `logCounter` and `increaseCounter` are created only once)! The thing is that React hooks are immutable, meaning that on each render we are getting not only new instance of our functions (without usage of `useCallback`) but also state (`counter` and `setCounter`) is created again. The value of a state of course is persisted across render cycles, but pointers to memory are already new. Because of closure without creating new instances, old instanced of functions are in use, and they use old values. For more clarity if we run this component we get the following result:

- initially `counter` is rendered as 0
- when we click on "Increase Counter" `counter` is incremented by 1, but consequent button clicks have no effect. The reason for it is that `increaseCounter` uses pointer to an old value of 0 and 0+1=1
- when we click "Log Counter" we see only only zeros in the console regardless of what is shown on the screen (0 or 1). The reason for it is that `logCounter` also uses old value of 0

To simultaneously avoid creation of excessive instances and to have the valid instances we need to tell to React, that when `counter` value changes it needs to re-create functions as well meaning we need to add dependency array of `useCallback`.

## Third case: works correctly, but computations...

```tsx
export const Counter: FC = () => {
  const [counter, setCounter] = useState(0);

  const logCounter = useCallback(() => {
    console.log(`Count is: ${counter}`);
  }, [counter]);

  const increaseCounter = useCallback(() => {
    setCounter(counter + 1);
  }, [counter, setCounter]);

  return (
    <div className="flex flex-col gap-2 items-start">
      <p>{counter}</p>
      <button onClick={increaseCounter}>Increase Counter</button>
      <button onClick={logCounter}>Log Counter</button>
    </div>
  );
};
```

At last we got to good quality React component, but if we look back we can notice something odd now. Why do we have to re-create functions (or behavior in other words) of the component when it's state changes?!

## "What's the catch?" ©️

In JS inheritance implemented via prototyping. Lets say we have a class of `Person` with `firstName` and `secondName` fields and `getFullName` method. Each instance of this class has it's own `firstName` and `lastName`. But at the same time all of them are referencing to the one and only `getFullName`, that sits on the prototype of our class instead of specific instance. How does a standalone `getFullName` method knows, that it is being executed in the context of `person1` instance and not `person2`? With the help of `this.`! But React abandoned class-based components long time ago, so we don't have `this.` in function-based components, therefore authors of React had to find a solution in the dependency array of `useCallback`. It reminds me of something.

Imagine you have another state, that depends on `counter`. Let's call it `doubleCounter`, it is by definition should be updated each time when `counter` changes and React handles well with `useMemo` hook. Now compare schematically usage of `useCallback` and `useMemo`. They are identical from the component perspective! `increaseCounter` and `logCounter` are responsible for defining **behavior of the component**, but component itself looks onto them like they are yet another **state** like `doubleCounter`, that should be updated based on dependencies and that should be stored in each instance of the component separately!

```tsx
export const Counter: FC = () => {
  const [counter, setCounter] = useState(0);

  const doubleCounter = useMemo(() => counter * 2, [counter]);

  const logCounter = useCallback(() => {
    console.log(`Count is: ${counter}`);
  }, [counter]);

  const increaseCounter = useCallback(() => {
    setCounter(counter + 1);
  }, [counter, setCounter]);

  return (
    <div className="flex flex-col gap-2 items-start">
      <p>{counter}</p>
      <p>{doubleCounter}</p>
      <button onClick={increaseCounter}>Increase Counter</button>
      <button onClick={logCounter}>Log Counter</button>
    </div>  );
};
```

I don't know what are the issues, that authors of React faced, that they decided to abandon class-based components. I would be glad to hear more on it from someone who knows. But it doesn't change the fact, that component isn't only the derivative of the state or data, but also a behavior, attached to it. Denial of this either intentional or not leads to a situation, where on the paper there are less terms (there are no directives, no services or modules like in the Angular), but on practice it means you need to squeeze the same number of things into lesser amount of categories. Less in not always more


---

Upd. on the matter:

Apparently, there is no performance difference between the first and last cases (at least from the perspective of garbage collection)…

The deal is how `useCallback` (а так же `useState`) technically works:

- on the first render, it takes and uses passed to him initial value
- on the consequent renders passed value is still created in the memory, since component is just a JS function, but hook ignores it and returns back the initial value

When there is a benefit of using `useCallback`? When its value is needed to be passed down to child component or to some other custom hook. If child component is wrapped with `memo` or the value is mentioned in dependency array of hook, then child component and/or hook won't get re-rendered when not needed. In parent component there is no difference at all.

Meaning after all redundant dozens and hundreds of function instances would be created and immediately cleaned up by garbage collector. I am really surprised, how such an architecture can be productive performance-wise, but, yes, I need to read docs more thoughtfully😕
