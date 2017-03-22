---
categories: Computer_Science
tags: Computer_Science
layout: post
title: Some Web Problems
---



**#浏览器禁止跨域请求**

有时我们在本地测试前端代码时，可能会出现`No 'Access-Control-Allow-Origin' header is present on the requested resource`这样的提示，原因是浏览器出于安全因素，不允许我们的页面使用来自多个页面的资源。此时我们需要开放浏览器的跨域请求。

###### Mac-Chrome-Safari开放跨域请求：

- chrome49以前版本

  ```
   open -a "Google Chrome" --args --disable-web-security
  ```

- chrome49以后版本

  ```
   open -a /Applications/Google\ Chrome.app --args --disable-web-security --user-data-dir
  ```

- Safari

  ```
  open -a '/Applications/Safari.app' --args --disable-web-security
  ```



**#https网站禁止调用http资源**

有时我们在Git Pages上放前端代码时，可能会遇到引用的外部资源加载不了，有着类似的提示`Mixed Content: The page was loaded over HTTPS, but requested an insecure XMLHttpRequest endpoint HTTP` 。这是因为https协议网站的内容不能引用http内容，此时我们可以在引用处省略协议名称，从而可以避免这个问题。如`src="//cdn.static.runoob.com/libs/jquery/2.1.1/jquery.min.js"` ，但是要记得//不可以去掉。


```
本页为原创内容，转载请注明出处{{page.url | absolute_url}}
```



