---
title: "Reader Mode"
date: 2023-01-08T17:59:00-05:00
tags:
- Programs
- Web
- Cloud
---
Have you ever been on a website? It can be really annoying. Many pages have an absurd amount of ads, and a lot of sites have limits on how much you can read before they ask you to sign up for some account or get a newsletter or whatever.

It's annoying enough, but it's more annoying on a dual-core Intel Celeron processor with 4 GB of ram. So a while ago, I created a bookmarklet.

If you've ever used Firefox, you've probably used the reader mode: ![The Firefox reader-mode icon](readermode.png)

If not, what it does is it takes out all of the formatting ads, and other annoying stuff from a page and just lets you read it. But what you don't know is that Mozilla actually has an [NPM package](https://www.npmjs.com/package/readability-js) that implements this functionality. So what this bookmarklet (a bookmark that has a javascript: url in it that runs on the page when clicked) did is that it would load that package from NPM and apply it to the current page, allowing me to have access to reader mode from a locked down Chromebook. 

And that worked great for a while, but then one day, I noticed that the button stopped doing anything. In fact, none of my bookmarklets did anything anymore. What I eventually realized had happened was that my school had created a policy that blocked bookmarklets from running, so my reader mode was dead.

Until I had an idea. One of the perks of the [Github Student Developer Pack](https://education.github.com/pack#offers) is $100.00 in credits for Microsoft Azure. I wondered if I could run this same NPM package in a cloud function so I could still have access to it.

Now the pricing thing ended up not mattering, since it doesn't get anywhere close to the limit for Azure's preexisting free tier.

If you want to try it out, you can get the link [here](https://read.jonot.me)

Overall, I can't be too upset about the bookmarklets being blocked, because the only one that I regularly used has now been replaced, and it allowed me to try out a technology that I never would have tried out otherwise.