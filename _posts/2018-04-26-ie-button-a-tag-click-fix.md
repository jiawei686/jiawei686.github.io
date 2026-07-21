---
layout: post
title: "IE Quirk: Clicks on `<a>` Inside `<button>` Don't Fire"
tags: [engineering]
---

A friend in the US asked me to help with a parent-child education website. During our conversation I learned there are still a fair number of IE users over there, so he wanted the site to work in IE. The pay wasn't much, but he's a friend — and every detail of a site you ship should be handled carefully.

While debugging in IE, I found that an `<a>` tag nested inside a `<button>` simply stopped working. The markup looked roughly like this:

```html
<button class ="link">Health and Safety <a href ="Health&Safety.html"></a></button>
```

Clicking the link did nothing. My first guess was that IE was rendering the `<button>` *on top of* the `<a>`, so I added `z-index: 1` to the link's stylesheet. No effect whatsoever.

A quick search confirmed IE really does have this bug — and it goes both ways: an `<a>` wrapping a `<button>` also fails to navigate.

I tried a snippet from a blog that solved the "`<a>` outside `<button>` won't navigate" case, hoping it would cover ours too:

```html
<a href ="1.html" onclick ="Javascript:window.location.href='2.html'"><button>click me</button></a>
```

Still didn't fix our problem.

So I had to solve it myself. I didn't want to manually move every `<a>`'s `href` onto its parent `<button>` and bind a click handler one by one. Instead I wrote a small script: for each button, grab the `href` of the `<a>` inside it, then bind a click handler that navigates. To make the URL correct on every click I used a **closure** to capture the loop index — otherwise every click would jump to whatever the last `<a>` pointed at.

```javascript
function isIE() { // ie?
     if (!!window.ActiveXObject || "ActiveXObject" in window) return true;
     else return false;
}
if (isIE()) {
    var index = 0;
    $(".small-link").each(function () {
        $(this).click(function () {
            var index_inner = index;
            return function () {
                window.location.href = $(".small-link a").eq(index_inner).attr('href');
            }
        }(index));
        index++;
    });
}
```

Debugging inside a virtual machine was painful, but in the end it worked.

## My take

The root cause is an old IE rendering quirk: it doesn't treat a nested `<a>` inside a `<button>` as a clickable navigation target, so the click is swallowed by the button. The cleanest fix by today's standards is to **not nest them at all** — wrap the button styling around a real `<a>`, or make the whole control an `<a>` styled to look like a button. The closure trick above was the pragmatic fix for a legacy codebase where the markup was already everywhere; the captured `index_inner` is the classic "loop variable in an event handler" gotcha that still bites people in every language with closures. If you're writing new code, just restructure the markup and skip the workaround entirely.
