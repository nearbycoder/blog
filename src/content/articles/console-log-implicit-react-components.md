---
title: "Console log with implicitly returned React components"
description: "Sometimes it can be annoying when you are trying to quickly console log something within a component that it implicitily returned, here is a quick trick."
date: "2022-11-27"
tags: ["react", "debugging"]
readTime: "3 min read"
featured: true
accent: "cyan"
---

Sometimes it can be annoying when you are trying to quickly console log something within a component that it implicitily returned, here is a quick trick.

Let's take the below code for example. If you wanted to `console.log(task)` your first thought would be okay well now I need to change this to an explicit return so that I can log before the return right?!?!

```jsx
import React from 'react'

const Task = ({ task }) => <div>The id of the task is {task.id}</div>
```

⬇ Like below ⬇

```jsx
import React from 'react'

const Task = ({ task }) => {
  console.log(task)

  return <div>The id of the task is {task.id}</div>
}
```

However there is a much easier way of doing this that won't make you rewrite how the component returns the JSX.

The thing to think about in the below syntax is what does `console.log(task)` evaluate to? `false` right, and because of this we can `||` the result

```jsx
import React from 'react'

const Task = ({ task }) =>
  console.log(task) || <div>The id of the task is {task.id}</div>
```

Simple enough right?
