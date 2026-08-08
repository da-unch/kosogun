---
layout: default
title: 額縁研究
---

「額縁」をテーマにした河﨑帆高・堀井映理・中野築月の共同リサーチサイト。

## 河﨑帆高
<ul>
{% assign posts = site.pages | where_exp: "p", "p.path contains '河﨑/'" | where_exp: "p", "p.title" | sort: "date" | reverse %}
{% for p in posts %}
  <li><a href="{{ p.url | relative_url }}">{{ p.title }}</a>{% if p.date %} — {{ p.date | date: "%Y-%m-%d" }}{% endif %}</li>
{% endfor %}
</ul>

## 堀井映理
<ul>
{% assign posts = site.pages | where_exp: "p", "p.path contains '堀井/'" | where_exp: "p", "p.title" | sort: "date" | reverse %}
{% for p in posts %}
  <li><a href="{{ p.url | relative_url }}">{{ p.title }}</a>{% if p.date %} — {{ p.date | date: "%Y-%m-%d" }}{% endif %}</li>
{% endfor %}
</ul>

## 中野築月
<ul>
{% assign posts = site.pages | where_exp: "p", "p.path contains '中野/'" | where_exp: "p", "p.title" | sort: "date" | reverse %}
{% for p in posts %}
  <li><a href="{{ p.url | relative_url }}">{{ p.title }}</a>{% if p.date %} — {{ p.date | date: "%Y-%m-%d" }}{% endif %}</li>
{% endfor %}
</ul>
