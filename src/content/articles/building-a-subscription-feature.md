---
title: "Building a Subscription Feature"
description: "Using Fastify and Sendgrid to build out a simple opt-in newsletter subscription feature so that I can start to gain a contact list to send out new blog posts."
date: "2021-03-22"
tags: ["backend", "growth"]
readTime: "7 min read"
featured: false
accent: "mist"
---

One of the first things that I thought about when restarting my blog up was how can I capture users who may want to know when the latest blog has been released? There are a bevy of different apps as well as services out their that can do alot of this for you with just a simple script and a iframe on your page. But why did I not use them?

## The Problem

The problem is that a lot of the existing ones today try to handle way to much of the work. This is great for someone who may not have the knowledge to hook up to an API but for me I really just want a simple API that I can use, hopefuly on the frontend if possible to just hit with a React component and send the information it requests. I am sure there are smaller startup SaaS products that may do this that I haven't found yet but ultimately I went with a simpler approach.

## The Approach

I ended up using [Fastify](https://www.fastify.io/) which you can kinda think of as a very simple and fast express alternative in order to bootstrap my API. For this project I really only needed one endpoint and really it only needs to send off one request to my email provider that I chose [SendGrid](https://sendgrid.com/). The reason for choosing SendGrid was more so for their simple API as well as their pricing isn't super expensive starting out at 100 emails a day, which I am sure will take awhile to get that many people on the contact list. In addition for just $14.95 at the time of this article being posted you can get 40,000 sends a month which is pretty good compared to the other services that I have found.

## The Frontend Code

For the Frontend I am using Formik with Yup and just a little React useState. This gives me a pretty good validation to make sure the form is filled in correctly before being submitted and if their is a problem with submission a way to reset back to a good known state.

```jsx
import React, { useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'

let schema = yup.object().shape({
  firstName: yup.string().required(),
  email: yup.string().email().required(),
})

export default function Subscribe() {
  const [subscribed, setSubscribed] = useState(false)
  const [error, setError] = useState(false)

  const formik = useFormik({
    initialValues: {
      firstName: '',
      email: '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        const response = await fetch('endpoint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        })
        const data = await response.text()

        if (data === 'true') {
          setSubscribed(true)
        } else {
          setError(true)
        }
      } catch (error) {
        setError(true)
      }
    },
  })

  if (error) {
    return (
      <div>
        <h3>Something Went Wrong</h3>
        <button onClick={() => setError(false)}>Want to Try Again?</button>
      </div>
    )
  }

  if (subscribed) {
    return (
      <div>
        <h3>Thank you for Subscribing!</h3>
      </div>
    )
  }

  return (
    <form onSubmit={formik.handleSubmit}>
      <h3>Want to follow along on my journey?</h3>
      <div>
        <div>
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.firstName}
          />
        </div>
        <div>
          <label htmlFor="email">
            Email Address
            {formik.touched?.email && formik.errors?.email && (
              <span>* {formik.errors.email}</span>
            )}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
          />
        </div>
        <div>
          <button
            disabled={!formik.isValid || formik.isSubmitting}
            type="submit"
          >
            Submit
          </button>
        </div>
      </div>
    </form>
  )
}
```

## The Backend Code

The code below is really just the simple endpoint that takes in the form data and sends it off to sendgrid for adding or updating a contact. SendGrid already takes care of duplicate emails for me so I don't have to worry about checking the list first.

```js
const fetch = require('cross-fetch')

module.exports = async function (fastify, opts) {
  fastify.post('/subscribe', async function (request, reply) {
    const { email, firstName } = request?.body

    try {
      const results = await fetch(
        'https://api.sendgrid.com/v3/marketing/contacts',
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            list_ids: ['list_id'],
            contacts: [{ email: email, first_name: firstName }],
          }),
        }
      )

      if (results.status === 400) {
        return false
      }
      return true
    } catch (error) {
      return false
    }
  })
}
```

## The Downsides

Currently right now I haven't implemented the second Opt-in feature which helps to reduce the number of spam accounts that sign up. In addition it's totally possible for a bot to just spam the form over and over again with random fake emails. If this blog ever gets to the point where someone want's to do that then that's when I will go about adding the spam filtering. For now this seemed like a good approach to just get users emails on a list. As far as sending a newsletter out, once I get a steady stream of subscribers the basic tools within SendGrid should be enough.

## Stay Tuned

Follow along below by subscribing to enjoy the feature journeys of this blog. I plan on adding a new blog post with each new feature that gets added.
