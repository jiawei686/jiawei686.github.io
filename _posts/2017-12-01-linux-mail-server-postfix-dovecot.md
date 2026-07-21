---
layout: post
title: Building a Linux Mail Server with Postfix and Dovecot
tags: [engineering]
---

*Part of the Tencent Cloud developer-lab series.*

A full-featured mail server is a serious undertaking; this lab just stands up a simple one. Postfix handles sending and receiving via SMTP; Dovecot handles retrieving mail via IMAP/POP3. Here's the end-to-end setup.

## Domain resolution

After buying a domain, point it at your server (IP `123.207.70.98` in the lab). Add two records in the console:

**A record**
- Type: `A`
- Host: `@`
- Value: `123.207.70.98`

**MX record**
- Type: `MX`
- Host: `@`
- Value: `yourdomain.com` (replace with your own)

### Verify it took effect

DNS changes need time to propagate.

- Check the A record with `ping`:

```shell
ping yourdomain.com
```

If the reply shows the IP you set, resolution works.

- Check the MX record:

```shell
nslookup -q=mx yourdomain.com
```

If the output shows your domain, the MX record is correct.

## Before you start

Configuring a complete mail server is not a trivial task; this lab only builds a minimal one, and more advanced features are left for you to explore.

### Postfix and Dovecot overview

- **Postfix** is a standard MTA (Mail Transfer Agent). It manages mail sent to the local machine and mail the machine sends outward, using the SMTP protocol.
- **Dovecot** is an excellent IMAP/POP3 server for retrieving mail addressed to the local machine.

### Install

On CentOS 7:

```shell
yum -y install postfix dovecot
```

## Postfix

### Configure

Replace `yourdomain.com` with your own domain. Set the parameters with `postconf -e`:

```shell
postconf -e 'myhostname = server.cuijiawei.tk'
postconf -e 'mydestination = localhost, localhost.localdomain'
postconf -e 'myorigin = $mydomain'
postconf -e 'mynetworks = 127.0.0.0/8'
postconf -e 'inet_interfaces = all'
postconf -e 'inet_protocols = all'
postconf -e 'mydestination = $myhostname, localhost.$mydomain, localhost, $mydomain'
postconf -e 'home_mailbox = Maildir/'
postconf -e 'smtpd_sasl_type = dovecot'
postconf -e 'smtpd_sasl_path = private/auth'
postconf -e 'smtpd_sasl_auth_enable = yes'
postconf -e 'broken_sasl_auth_clients = yes'
postconf -e 'smtpd_sasl_authenticated_header = yes'
postconf -e 'smtpd_recipient_restrictions = permit_mynetworks, permit_sasl_authenticated, reject_unauth_destination'
postconf -e 'smtpd_use_tls = yes'
postconf -e 'smtpd_tls_cert_file = /etc/pki/dovecot/certs/dovecot.pem'
postconf -e 'smtpd_tls_key_file = /etc/pki/dovecot/private/dovecot.pem'
```

Postfix uses **SASL** for authentication and **TLS** to encrypt the connection. The lab reuses Dovecot's default SSL certificate and key; swap the last two paths if you have your own.

### Enable SMTPS (port 465)

Some mail clients require encrypted connections on port 465. Edit `/etc/postfix/master.cf` and uncomment these two lines (keep the space before `-o`):

```
smtps inet n - n - - smtpd
  -o smtpd_tls_wrappermode=yes
```

### Start

```shell
systemctl enable postfix.service
systemctl start  postfix.service
```

### Logs

Postfix logs to `/var/log/maillog`, which records the server's runtime status.

## Dovecot

### Configure

Edit `/etc/dovecot/dovecot.conf` and append at the bottom (replace the cert paths if you used your own):

```shell
ssl_cert = </etc/pki/dovecot/certs/dovecot.pem
ssl_key = </etc/pki/dovecot/private/dovecot.pem

protocols = imap pop3 lmtp
listen = *
mail_location = Maildir:~/Maildir
disable_plaintext_auth = no
```

Then edit `/etc/dovecot/conf.d/10-master.conf`, find the `service auth` section, and uncomment:

```shell
unix_listener /var/spool/postfix/private/auth {
       mode = 0666
}
```

### Start

```shell
systemctl enable dovecot.service
systemctl start  dovecot.service
```

Check `/var/log/maillog`. A successful startup looks like:

```shell
Jun 26 12:00:28 localhost postfix/postfix-script[28338]: starting the Postfix mail system
Jun 26 12:00:29 localhost postfix/master[28340]: daemon started -- version 2.10.1, configuration /etc/postfix
Jun 26 12:28:40 localhost dovecot: master: Dovecot v2.2.10 starting up for imap, pop3, lmtp (core dumps disabled)
```

## Create an account

In this setup, mailbox accounts map to system users. Create one with `useradd`, then set its password:

```shell
useradd test
passwd test
```

## Test

If something fails, check the error messages in `maillog`.

### Send from the server

Switch user and send a test message (`xxxx@xxx.com` → your real inbox):

```shell
su test
echo "Mail Content" | mail -s "Mail Subject" 892001108@qq.com
```

### Mail client

You can add the account to a desktop client (Foxmail is recommended in the lab). Example settings:

```
Server type:     POP3
Mail account:    test@yourdomain.com

Incoming (POP3):  yourdomain.com
Port:             995
SSL:              Yes
User:             test
Password:         test user's password

Outgoing (SMTP):  yourdomain.com
Port:             465
SSL:              Yes
User:             test
Password:         test user's password
```

(With a self-signed/generic certificate, some clients may warn or misbehave — that's expected.)

## My take

The mental model that makes this whole setup click: **Postfix = outgoing/incoming transport (SMTP), Dovecot = retrieval (IMAP/POP3)**, and they handshake over a private SASL socket (`private/auth`). The part that trips most people up is that mail has *two* protocols — one for transport, one for reading — and you must configure both or you can send but never receive (or vice versa). For a real deployment you'd separate the services, use a proper CA-signed cert instead of Dovecot's default, and add SPF/DKIM/DMARC so you're not flagged as spam. This lab is the minimum viable slice.
