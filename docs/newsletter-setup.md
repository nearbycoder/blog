# Email subscription activation

The subscription entry point is implemented, but live email is not configured. This release must remain a draft until the real provider flow is verified. The blog does not collect addresses or claim a subscription succeeded. It links readers to the mailing service’s hosted signup page, which owns enrollment, confirmation, suppression, and unsubscribe behavior.

## What is needed

Supply the existing newsletter’s public HTTPS signup URL and access to its mailing-service settings. If there is no list yet, choose and configure a service first. No email API key is needed in this static blog. Do not put a secret into `NEWSLETTER_SIGNUP_URL`; it becomes a public link.

Set `NEWSLETTER_SIGNUP_URL` on the Vercel project for the appropriate environment and rebuild. Missing configuration shows an honest RSS fallback on `/subscribe` and hides email invitations on articles and the homepage. Invalid URLs fail the build; the configuration also rejects a loop back to `/subscribe`.

## New-post delivery

Use the blog’s existing published-only RSS feed: `https://nearbycoder.com/rss.xml`. Configure the provider’s RSS-to-email automation and a verified sender. Enable confirmation for new subscriptions and verify that every notification includes a working unsubscribe link. Start by creating drafts so old feed entries do not accidentally trigger a backlog of emails; establish the provider’s initial feed cursor before enabling new-post sends.

As one supported example, Buttondown provides a [hosted signup URL](https://docs.buttondown.com/building-your-subscriber-base), [confirmation emails](https://docs.buttondown.com/transactional-emails-confirmation), and [RSS-to-email with draft or send behavior](https://docs.buttondown.com/rss-to-email). Another service with these capabilities can use the same blog configuration. No provider account or paid service has been created by this change.

## Release verification

1. Set the real signup URL in Preview. Open `/subscribe` on the PR deployment and follow its signup link.
2. With an authorized test address, complete signup and confirmation. Verify the confirmed subscription in the provider.
3. Create a test newsletter draft from the RSS feed; verify the title, excerpt, canonical article link, sender, and unsubscribe link. Do not publish a dummy blog article or send to the whole list to test.
4. Send only to the authorized test address, verify receipt, unsubscribe, and confirm suppression from future notifications. Remove test data as appropriate.
5. Configure the initial feed cursor and new-post delivery, set the production URL, rerun `npm run verify`, and merge only after Vercel passes.

The automated suite checks the unconfigured page, feed copy behavior, invalid configuration, and a separately built configured page using a reserved example URL. This verifies the site integration; it does not substitute for delivery and unsubscribe checks with the real service.
