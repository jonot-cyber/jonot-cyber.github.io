---
title: "Improved Ideas"
date: 2023-08-15T22:09:28-04:00
draft: false
---

Hey, remember that [Ideas](/posts/ideas "Ideas") program that i
created a while ago? Well I realized a long time ago that it had a lot
of problems with it, so I decided to take a few minutes to make a
better idea. But first, it'd be a good idea to go over the problems
with the original:

- The original assumed that you have `$XDG_DATA_HOME` set to
  `$HOME/.local/share`, which is not necesarrily true.
- The program fails to use markdown correctly. In markdown, you use
  a single line break doesn't create a new paragraph, you need a full
  empty line. but in this program, a full empty line ends the file.
- Using this weird text editor is pretty weird.
  times, which I'll get into later
- And most importantly, for a "simple" and "minimalist" program, there's a lot of
  unnecesarry complexity.

So here is a new program that improves on all of these problems:

```bash
#!/usr/bin/env bash
if [[ -v $XDG_DATA_HOME]]; then
	base="$XDG_DATA_HOME"
else
	base="$HOME/.local/share"
fi
path="$base/ideas/$1.md"
echo "# $1" > "$path"
nano "$path"
```
You can see that it checks the variable `$XDG_DATA_HOME`, and falls
back to the old method if it doesn't exist. The markdown issues and
strange editor issues are fixed by just opening the created file in
nano. Feel free to switch this to whatever text editor tickles your fancy.

This program can be used the same as the last one. Put this in a text
file, and `chmod +x` it so you can execute it. Then put it somewhere
on your path.

To run the command, you can do `ideas <title>` and it will be recorded.

The main reson that I did this is because I thought it would be a good
idea to go back to something I had done in the past and improve
it. Alright, have a nice day!
