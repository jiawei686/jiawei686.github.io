---
layout: post
title: Git初始化操作
tags: [Software]
---

|总是忘记，写在这里没事看一看

### Command line instructions

##### Git global setup

`git config --global user.name "Cui Jiawei"`

`git config --global user.email "892001108@qq.com"`

##### Create a new repository

`git clone git@gitlab.com:We-InvoiceHelper/WeInvoiceHelper.git`

`cd WeInvoiceHelper`

`touch README.md`

`git add README.md`

`git commit -m "add README"`

`git push -u origin master`

##### Existing folder

`cd existing_folder`

`git init`

`git remote add origin git@gitlab.com:We-InvoiceHelper/WeInvoiceHelper.git`

`git add .`

`git commit -m "Initial commit"`

`git push -u origin master`

##### Existing Git repository

`cd existing_repo`

`git remote rename origin old-origin`

`git remote add origin git@gitlab.com:We-InvoiceHelper/WeInvoiceHelper.git`

`git push -u origin --all`

`git push -u origin --tags`