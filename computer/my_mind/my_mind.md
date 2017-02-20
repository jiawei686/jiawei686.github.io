# 系统

## Linux

#### 命令

###### 文件传输命令scp

- scp
  - 远程到本地  `scp pi@172.18.156.240:/mnt/…/… /Users/starlight/Desktop` (文件夹 -r)
  - 本地到远程顺序调换

#### 位置

- `~/.bash_history`存放了history记录
- `/var/log/wtmp`存放了last记录


## Zsh

#### 安装方法

- sh -c "$(curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"

  ​




# web

#### css

- css3的3D优秀教程http://www.zhangxinxu.com/wordpress/2012/09/css3-3d-transform-perspective-animate-transition/





# 网络渗透

## Nmap

#### 快捷键

- [Enter] 扫描进度

#### 命令

- sudo nmap -O + ip








## Ettercap

#### 快捷键

- [Ctrl + S] 扫描同host下机器

#### 命令

- sudo ettercap -G 开启图形界面


#### cookie注入

- 工具 Chrome Cookie Hacker










## SSH

#### 命令

- ssh pi@172.18.156.240
- ssh pi@172.18.156.136


#### 端口

- 22

#### ssh免密码登录

- 在本地机器执行`ssh-keygen -t rsa`会在根目录`~/.ssh/`目录下生成`id_rsa`和`id_rsa.pub`，将`id_rsa.pub`上传至目标机器的`~/.ssh/`目录改名为`authorized_keys`即可

- 此时linux可以免密码登录，如果目标机器是mac OS，需要在`/etc/ssh_config`尾行添加`PubkeyAuthentication yes`开启免密码登录

  ​








# 语言&编译器

## Vim

#### 快捷键

- [Z+i] 展开折叠


- [$F_2$] ggvG"+y (all paste)
- [$F_3$] ggvGdd (all clear)
- [$F_5$] compile
- [$F_6$] run
- [$F_7$] NERDTreeToggle
- [$F_9$] pastetoggle

#### 设置方法

- set clipboard=unnamed 复制入系统剪切板

#### 插件管理

- BundleInstall 安装列表插件
- BundleInstall! 更新列表插件


## sublime text

#### 选择快捷键

- [command + D]选取下一相同文本
- [command + L]选取当前行
- ​






## C++

#### MLE解决办法

- 动态数组

  ```c++
  pak *p;
  p = new pak[k];
  ```

  ​

  ​

  ​	


## Raspberry

#### 风扇接法



![image](http://bbs.shumeipaiba.com/data/attachment/forum/201603/09/130631bd8t7gww7ipetepd.png)

