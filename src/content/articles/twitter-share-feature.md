---
title: "Twitter Share Feature"
description: "Easily adding a simple share button to a blog around sharing on Twitter"
date: "2021-03-28"
tags: ["frontend", "product"]
readTime: "4 min read"
featured: false
accent: "rose"
---

There are so many tools out there that you can use to add a share button on your blog for social media. But, that also begs the question why not build your own, is it really that hard. In this post I will go over how simple it is to adding a tweet share button for twitter to your blog posts.

## Code Snippet

We will begin with a simple code snippet that literally does the bare minimum and requires no tie-ins to any frameworks. The snippet is in React but you can easily see it uses no React internals to accomplish this.

```jsx
import React from 'react'

export default function Share({ post }) {
  const url = window.location.href
  const message = `${url} ${post.excerpt}`

  return (
    <div>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
          message
        )}`}
        target="_blank"
        rel="noreferrer"
      >
        Share on Twitter
      </a>
    </div>
  )
}
```

From the above you can see we are just creating a link and passing the context of the tweet to the text param passed to twitter. You can get fancy with this and add some logos with it but ultimately if you are reaching for a third party library to add this type of feature it's no different than requiring in **left-pad** to pad a string.

## Rebuilding the Wheel

There is an argument out their about not rebuilding the wheel and try to use solutions that are already out their. I say I agree with this most of the time but when you are requiring in something that basically just compiles a url to send to twitter and you have to override all of the styles to get it to look like how you would like then that is using a wheel that has been living in a junk yard and requires a lot of work to get back to a ready to use state, and not worth it.
