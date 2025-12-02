---
layout: post
title: https网站禁止调用http资源解决办法
tags: [Code]
---


**#https网站禁止调用http资源**

有时我们在Git Pages上放前端代码时，可能会遇到引用的外部资源加载不了，有着类似的提示`Mixed Content: The page was loaded over HTTPS, but requested an insecure XMLHttpRequest endpoint HTTP` 。这是因为https协议网站的内容不能引用http内容，此时我们可以在引用处省略协议名称，从而可以避免这个问题。如`src="//cdn.static.runoob.com/libs/jquery/2.1.1/jquery.min.js"` ，但是要记得//不可以去掉。





