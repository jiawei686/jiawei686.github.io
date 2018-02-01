---
layout: post
title: jekyll linux 安装方法
tags: [Software]
---

#### jekyll linux 安装方法

##### 安装gcc

`sudo apt-get install gcc`

##### 安装ruby

把大象装进冰箱需要三步

1. 类似node的安装需要nvm，经测试ruby安装最方便的方法是安装rvm

   ```shell
   gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
   curl -sSL https://get.rvm.io | bash -s stable
   # 如果上面的连接失败，可以尝试: 
   curl -L https://raw.githubusercontent.com/wayneeseguin/rvm/master/binscripts/rvm-installer | bash -s stable
   ```

2. 接下来安装ruby

   ```shell
   rvm requirements
   # 环境准备
   rvm install 2.3.0
   rvm use 2.3.0 --default
   # 目测有一些版本不行，需要指定2.3.0版本
   ```

3. 安装jekyll

   ```shell
   gem install bundler
   gem install jekyll
   ```


最后，有人说需要nodejs环境，那么就可以安装一下nvm，装一个node上去，到此为止，一切准备就绪。

