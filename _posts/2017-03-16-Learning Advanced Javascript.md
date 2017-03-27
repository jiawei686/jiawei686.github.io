---
categories: Computer Science
tags: Computer Science
layout: post
title: Learning Advanced Javascript
---
```
本页为原创内容，转载请注明出处{{page.url | absolute_url}}
```



## Learning Advanced Javascript

**#2: Goal: To be able to understand this function:**

{% highlight javascript linenos %}
// The .bind method from Prototype.js 
Function.prototype.bind = function(){ 
  var fn = this, args = Array.prototype.slice.call(arguments), object = args.shift(); 
  return function(){ 
    return fn.apply(object, 
      args.concat(Array.prototype.slice.call(arguments))); 
  }; 
};
{% endhighlight %}


要理解这段代码，首先要了解*javascript*的数组如下基本操作。

- slice() 操作截取数组的一段， slice(start,end)则表示截取数组的start到end的一段，默认时为数组从头到尾。
- shift()返回数组的第一个元素并删除。
- concat()数组拼接

涉及到一点函数知识，比如call与apply的区别。其实，call与apply的作用没有区别，都是给函数绑定对象，只不过call传递的是参数，apply传递的是数组。

{% highlight javascript linenos %}
func.call(this, arg1, arg2);
func.apply(this, [arg1, arg2])
{% endhighlight %}

到此时，这段代码就可以基本读懂了。arguments不是数组，将其变成数组用了一步巧妙的`args = Array.prototype.slice.call(arguments)`因为arguments不是array，所以原本没有slice方法，不过Array.prototype有。随后用call将其绑定于arguments。

到后面有一步concat，是把bind()可能带有的参数加进去，这段代码也就解释清楚了。



**#11 the name of a function--匿名函数**

{% highlight javascript linenos %}
var ninja = function myNinja(){ 
  assert( ninja == myNinja, "This function is named two things - at once!" ); 
}; 
ninja(); 
assert( typeof myNinja == "undefined", "But myNinja isn't defined outside of the function." ); 
log( ninja );
{% endhighlight %}

这段代码的输出结果为

```
PASS This function is named two things - at once!
PASS But myNinja isn't defined outside of the function.
LOG function myNinja(){ assert( ninja == myNinja, "This function is named two things - at once!" ); }
```

说明匿名函数在函数外可以看作undefined，而实名函数则不会。



**#12: We can even do it if we're an anonymous function that's an object property.**

{% highlight javascript linenos %}
var ninja = { 
  yell: function(n){ 
    return n > 0 ? ninja.yell(n-1) + "a" : "hiy"; 
  } 
}; 
assert( ninja.yell(4) == "hiyaaaa", "A single object isn't too bad, either." );
{% endhighlight %}

根据输出我们发现ninja.yell虽然定义在对象ninja内，仍然可以在对象外部调用它。



**#13: But what happens when we remove the original object?**

{% highlight javascript linenos %}
var ninja = { 
  yell: function(n){ 
    return n > 0 ? ninja.yell(n-1) + "a" : "hiy"; 
  } 
}; 
assert( ninja.yell(4) == "hiyaaaa", "A single object isn't too bad, either." ); 
 
var samurai = { yell: ninja.yell }; 
var ninja = null; 
 
try { 
  samurai.yell(4); 
} catch(e){ 
  assert( false, "Uh, this isn't good! Where'd ninja.yell go?" ); 
}
{% endhighlight %}

通过输出结果

```
PASS A single object isn't too bad, either.
FAIL Uh, this isn't good! Where'd ninja.yell go?
```

发现原来对象的赋值实际上是指针，指向了原来的对象，所以在删除了原来对象的时候，没有办法调用到这个函数。



**#14: Let's give the anonymous function a name!**

{% highlight javascript linenos %}
var ninja = { 
  yell: function yell(n){ 
    return n > 0 ? yell(n-1) + "a" : "hiy"; 
  } 
}; 
assert( ninja.yell(4) == "hiyaaaa", "Works as we would expect it to!" ); 
 
var samurai = { yell: ninja.yell }; 
var ninja = {}; 
assert( samurai.yell(4) == "hiyaaaa", "The method correctly calls itself." );
{% endhighlight %}

通过比较之前的代码，我们发现如果不给匿名函数命名，我们即便是在函数里调用这个函数也要用对象的方法`ninja.yell(n-1)`，命名之后我们就可以直接通过`yell(n-1)`来直接调用了。如果我们不想给它命名，也可以通过`arguments.callee(n-1)`来调用。



**#19: Is it possible to cache the return results from a function?**

{% highlight javascript linenos %}
function getElements( name ) { 
  var results; 
 
  if ( getElements.cache[name] ) { 
    results = getElements.cache[name]; 
  } else { 
    results = document.getElementsByTagName(name); 
    getElements.cache[name] = results; 
  } 
 
  return results; 
} 
getElements.cache = {}; 
 
log( "Elements found: ", getElements("pre").length ); 
log( "Cache found: ", getElements.cache.pre.length );
{% endhighlight %}

可以通过cache的方式将函数运行的结果存储起来。



**#20: QUIZ: Can you cache the results of this function?**

{% highlight javascript linenos %}
function isPrime( num ) {
  var prime = num != 1; // Everything but 1 can be prime
  for ( var i = 2; i < num; i++ ) {
    if ( num % i == 0 ) {
      prime = false;
      break;
    }
  }
  return prime;
}

assert( isPrime(5), "Make sure the function works, 5 is prime." );
assert( isPrime.cache[5], "Is the answer cached?" );
{% endhighlight %}



首先，看一道前端面试题目

{% highlight javascript linenos %}
var a = {n:1};  
var b = a; // 持有a，以回查  
a.x = a = {n:2};  
alert(a.x);// --> undefined  
alert(b.x);// --> {n:2}
{% endhighlight %}

它的结果为什么是这样。

对于这个问题，segmentfault上面一位用户给出了详尽的解答

> 同意3楼和4楼同学说的。连等是先确定**所有**变量的指针，再让指针指向那个赋值（`{n:3}`)。
>
> 对于 `a.x = a = {n:2}`，楼主原先的思路应该是：
>
> 1. 先把 `{n:2}` 赋值给 a
> 2. 然后再创建 a.x，将 `{n:2}` 再赋值给 a.x
>
> 这样似乎确实说不通 a.x 的值是 undefined，因为 a.x 确实是被赋值了的啊。 可是事实上，a.x 的值却是 undefined。
>
> 再来看一下这个： `a = a.x = {n:2}`的话，按楼主原先的思路应该是：
>
> 1. 先把 `{n:2}` 赋值给 a.x，那么也就相当于 `b.x = {n:2}` 啦
> 2. 再把 a 重新指向 `{n:2}`。那么这是后 a.x 的值确实是 undefined，a 对象 `{n:2}` 中就没有 x 属性嘛。
>
> 按楼主的思路，上述两种方式的结果应该是不同的。但事实却是`a = a.x = {n:2}`和`a.x = a = {n:2}`的结果是一致的。所以楼主的那种赋值的思路是不对的。
>
> 事实上，解析器在接受到 `a = a.x = {n:2}` 这样的语句后，会这样做：
>
> 1. 找到 a 和 a.x 的指针。如果已有指针，那么不改变它。如果没有指针，即那个变量还没被申明，那么就创建它，指向 null。
>    a 是有指针的，指向 `{n:1}`；a.x 是没有指针的，所以创建它，指向 null。
> 2. 然后把上面找到的指针，都指向最右侧赋的那个值，即 `{n:2}`。
>
> 所以执行以后，就有了如下的变量关系图。楼主可以慢慢体会下，想通了就很简单的。

 ![image](https://segmentfault.com/img/bVleKD) 



其实这道题目并不需要这些知识就可以解决，我们只是借用它去理解prime = num != 1来判断当num == 1时的prime值。

正确答案如下：

{% highlight javascript linenos %}
function isPrime( num ) {
  if(isPrime.cache[num]) return isPrime.cache[num];
  else {
      var prime = num != 1; // Everything but 1 can be prime
      for ( var i = 2; i < num; i++ ) {
        if ( num % i == 0 ) {
          prime = false;
          break;
        }
      }
      isPrime.cache[num] = prime;
      return prime;   
  }

}

isPrime.cache = {};

assert( isPrime(5), "Make sure the function works, 5 is prime." );
assert( isPrime.cache[5], "Is the answer cached?" );
{% endhighlight %}



**#27: QUIZ: How can we implement looping with a callback?**

{% highlight javascript linenos %}
function loop(array, fn){
  for ( var i = 0; i < array.length; i++ ) {
    // Implement me!
  }
}
var num = 0;
loop([0, 1, 2], function(value){
  assert(value == num++, "Make sure the contents are as we expect it.");
  assert(this instanceof Array, "The context should be the full array.");
});
{% endhighlight %}

一开到这个问题还有点头晕，不过想到是context里面的题目，于是想到solution

{% highlight javascript linenos %}
function loop(array, fn){
  for ( var i = 0; i < array.length; i++ )
    fn.call( array, array[i], i );
}
var num = 0;
loop([0, 1, 2], function(value, i){
  assert(value == num++, "Make sure the contents are as we expect it.");
  assert(this instanceof Array, "The context should be the full array.");
});
{% endhighlight %}





