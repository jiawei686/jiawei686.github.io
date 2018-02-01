---
layout: post
title: IE浏览器button标签不能嵌套a标签解决办法
tags: [Code]
---


问题是这样的，最近在帮一个留美同学做一个亲子教育网站，在沟通过程中了解到美国那边仍然有不少IE用户，所以那个同学希望可以适配IE浏览器。虽然酬劳不是很多，但是毕竟是同学，对于网站的每一个细节仍然要加以注意。

在IE中调试时发现，一个button标签下的a标签不起作用了，代码大概长下面这个样子。

```html
<button class ="link">Health and Safety <a href ="Health&Safety.html"></a></button>
```

这个时候点击a标签不能进行跳转，一开始我以为是IE将button渲染在a标签之上了，于是在a的样式表加上了`z-index = 1` 然而并没有什么卵用。

上网查了一下，IE果然存在这个问题，而且据说不仅如此，当a嵌套button标签时，也会发生不能跳转的问题。

拿来网上一个博客给出的代码，代码是用来解决a标签在button外不能跳转的问题，我拿来尝试一下看看可不可以一起解决。大致代码如下

```html
<a href ="1.html" onclick ="Javascript:window.location.href='2.html'"><button>click me</button></a>
```

结果发现仍然不能解决我们的问题。

看来还得靠自己。想到已经打好的每一个a标签的href，不忍心一个个转移到button上再绑定click事件，于是新建一个js，先循环让每一个button标签都获取其下a标签的href，再给每一个button绑定click就跳转的事件。为了绑定URL的正确性，其中还使用了闭包，传递循环的index变量，不然每次click时都会跳转到最后一个a标签指向的URL。不理解请看javascript闭包相关博客。

```javascript
function isIE() { //ie?
     if (!!window.ActiveXObject || "ActiveXObject" in 	window)return true;
     else return false;
}
if(isIE()){
    var index = 0;
    $(".small-link").each(function(){
        $(this).click(function(){
            var index_inner = index;
            return function(){
                window.location.href = $(".small-link a").eq(index_inner).attr('href');
            }
        }(index));
        index++;
    })
    //alert($(".small-link a").attr('href'));
}
```

在虚拟机环境下，调试很麻烦，不过还是成功搞定了它。