---
layout: post
title: Getting Started with iptables
tags: [engineering]
---

`iptables` is the user-space tool for configuring the Linux kernel firewall (netfilter). It looks arcane at first, but it's really just a set of **tables**, each containing **chains** of rules that packets traverse in order. Here are the commands I actually reached for when learning it, with the "why" behind each flag.

## Basic commands

### Syntax and listing rules

Save the help to a file so you can study it offline:

```shell
sudo iptables -h > ~/iptables_help
```

`iptables` is organized into **tables**, and each table has **chains**. In most cases you only need the `filter` and `nat` tables. List the rules in the `filter` table with:

```shell
sudo iptables -L -n
```

Flag breakdown:
- `-L` — list rules.
- `-n` — don't resolve hostnames (faster, and avoids DNS hangs).

By default this shows the `filter` table, which has three built-in chains: `INPUT`, `FORWARD`, `OUTPUT`. With no rules yet, packets pass through untouched.

### Scenario: block access to a destination

With no firewall, `ping www.baidu.com` succeeds. Suppose as an admin you don't want this machine to ping a particular server:

```shell
sudo iptables -I OUTPUT -p icmp -d www.baidu.com -j DROP
```

Flags:
- `-I` — insert the rule at the **top** of the chain.
- `-p icmp` — match the ICMP protocol (what `ping` uses).
- `-d` — match the destination address.
- `-j DROP` — the target action: silently drop the packet.

**Important:** rules in a chain run top to bottom. A `-j REJECT` that blocks *everything* must sit at the **bottom** of the chain, with the "allow" rules above it — otherwise every packet matches the reject first and all connections die. After the rule, `iptables -L -n` shows the new `OUTPUT` entries with the DNS-resolved Baidu IPs, and `ping` now fails:

```shell
ping -c 4 www.baidu.com
PING www.a.shifen.com (220.181.111.188) 56(84) bytes of data.
ping: sendmsg: Operation not permitted
```

## Export, edit, import rules

### Export

```shell
sudo iptables-save > /home/ubuntu/iptables_rules
```

### Edit

Open `iptables_rules`, and under the `:OUTPUT ACCEPT` line in the `filter` table, add:

```
-A OUTPUT -p icmp -d 114.114.114.114 -j DROP
```

Save with `Ctrl-S`.

### Import

```shell
sudo iptables-restore /home/ubuntu/iptables_rules
```

Verify with `iptables -L -n` and a `ping 114.114.114.114`.

## Advanced scenario: blacklist / whitelist with a custom chain

Suppose this machine is a gateway and you want to block two destinations (114.114.114.114 and 220.181.111.188) for the local PC.

Find the local interface IP:

```shell
sudo ip a show eth0
```

The address after `inet` (e.g. `10.135.166.86`) is your interface IP.

Build a dedicated `BLACKLIST` chain:

```shell
sudo iptables -F                       # flush existing rules
sudo iptables -X                       # delete custom chains
sudo iptables -N BLACKLIST             # create a new chain
sudo iptables -A OUTPUT -s 10.135.166.86 -j BLACKLIST   # jump to it for local source
sudo iptables -A BLACKLIST -d 114.114.114.114 -j DROP
sudo iptables -A BLACKLIST -d 220.181.111.188 -j DROP
```

Now local pings to either address fail. To block a new destination later, just append a rule to `BLACKLIST`. To restrict a *different* PC going through this gateway, add a source-IP match in `OUTPUT` that jumps to `BLACKLIST`.

## Advanced scenario: port forwarding

Normally you'd configure the app to listen on multiple ports or put a load balancer in front, but for a quick test you can forward port 8080 to 80 with `iptables`.

First confirm both are closed:

```shell
telnet 0 80
telnet 0 8080
```

Listen on 80 with `netcat`:

```shell
sudo nc -k -l 80 &
```

Now `telnet 0 80` works. (To exit `telnet`: press `Ctrl + ]`, then `q` + Enter.)

Forward 8080 → 80 on localhost:

```shell
sudo iptables -t nat -A OUTPUT -p tcp -d 127.0.0.1 --dport 8080 -j DNAT --to 127.0.0.1:80
```

Here `-t nat` selects the NAT table, and `-j DNAT` rewrites the destination to port 80. Now `telnet 0 8080` also works.

For external traffic (not localhost), use `PREROUTING` instead:

```shell
sudo iptables -t nat -A PREROUTING -p tcp --dport 8080 -j REDIRECT --to-ports 80
```

## My take

The single most important thing to internalize is **order matters**. A chain is just a for-loop over rules, and the first match wins — so "allow" rules must precede any catch-all "reject." The second lesson is that `iptables` is really two tools: the `filter` table (allow/deny) and the `nat` table (rewrite addresses/ports). Once you stop seeing it as one big firewall and start seeing it as "tables of ordered chains with targets," it stops being scary. For anything persistent, always `iptables-save` to a file and load it on boot — rules typed at the prompt vanish on reboot.
