---
title: "The longest word you can spell in hexadecimal"
date: 2023-01-16T09:08:41-05:00
tags:
- Linux
---
It's "coldblooded"

This is something that I did a while ago, so I thought I'd just write a post about it. Here is a shell script to get every word that can be spelled with hexadecimal, sorted by length:

```bash
cat /usr/share/dict/words | tr "[:upper:]" "[:lower:]" | grep -E "^[abcdeflzso]+$" | tr "lzso" "1250" | awk '{print length, "0x" $0}' | sort -nr -k 1 | cut -d " " -f 2
```

If that seems incredibly cryptic to you, don't worry. I'll explain it all later.

## The problem
So what words can you spell with hexadecimal? Hexadecimal contains the numbers 0-9 and the letters a-f, so obviously you can use those. But I think you can use other letters. You can use 0 for o, 1 for l, and 2 and 5 for z and s. So in my mind, Anything that you can spell with the letters a, b, c, d, e, f, l, o, s, and z can be spelled with hexadecimal.

## Bash
You can think of each of the commands as programs that take in text streams and output text streams. The pipe, "|" takes the output from the last command and feeds it into the next command.

The thing is, all of this is running concurrently. That "tr" isn't waiting for cat to finish. They both start running at the same time, and they are all processing input as they get it. This allows this script to run pretty fast.

For comparison, take this python program that I wrote to do the same process:
```python
import re

replacements = {
	"l": "1",
	"o": "0",
	"s": "5",
	"z": "2",
}

word_set = set()

with open("/usr/share/dict/words") as word_list:
	for word in word_list.readlines():
		word = word[:-1].lower()
		if not re.search(r"^[abcdeflzso]+$", word):
			continue
		word_set.add(word)

for word in sorted(word_set, key=lambda x: len(x), reverse=True):
	for find, replace in replacements.items():
		word = word.replace(find, replace)
	print(f"0x{word}")
```
This took 452 milliseconds to run.

Let's try Go, a faster, compiled language:
```go
package main

import (
	"bufio"
	"fmt"
	"os"
	"regexp"
	"sort"
	"strings"
)

func main() {
    var words []string

    re := regexp.MustCompile("^[abcdeflzso]+$")
    f, err := os.Open("/usr/share/dict/words")
    if err != nil {
        panic(err)
    }
    defer f.Close()

    scanner := bufio.NewScanner(f)
    scanner.Split(bufio.ScanLines)

    for scanner.Scan() {
        line := strings.ToLower(scanner.Text())
        if !re.MatchString(line) {
            continue
        }
        words = append(words, line)
    }

    sort.Slice(words, func(i, j int) bool {
        return len(words[i]) > len(words[j])
    })

    for _, word := range words {
        fmt.Printf("0x%s\n", word)
    }
}
```
Go only took 155 milliseconds to run. A major improvement! But what about with Bash?

Well, that Bash one liner took only **28 milliseconds** to run!

## The program
Here is the full program cleaned up:
```bash
cat /usr/share/dict/words \
| tr "[:upper:]" "[:lower:]" \
| grep -E "^[abcdeflzso]+$" \
| tr "lzso" "1250" \
| awk '{print length, "0x" $0}' \
| sort -nr -k 1 \
| cut -d " " -f 2
```

### cat /usr/share/dict/words
[cat](https://www.man7.org/linux/man-pages/man1/cat.1.html) is a very powerful program that is used to concatenate streams of text together. In this case, we are just using it to output the contents of a file. In this case, the file is `/usr/share/dict/words`

If you are on a Linux computer, you probably have this file. The file is simply a list of words, one per line. The file contains 479826 words long. Here is a sample of the text:

```
...
aboded
abodement
abodes
aboding
abody
...
```

This file was originally created for spell checking, but it is useful for other purposes, like this one

### tr "[:upper:]" "[:lower:]"
[tr](https://man7.org/linux/man-pages/man1/tr.1.html) replaces characters in the input. If I used `tr "abc" "def"` it would take the input and replace all instances of the letter "a" with "d", "b" with "e", and "c" with "f". In this case we are using a special case. Using `tr "[:upper:]" "[:lower:]"` Will transform all uppercase letters to lowercase ones. So what this line does is makes sure that all of our letters are lowercase.

### grep -E "^[abcdeflzso]+\$"
[grep](https://man7.org/linux/man-pages/man1/grep.1.html) does regexes. The name grep stands for "(g)lobally search for a (r)egular (e)xpression and (p)rint matching lines"

If you don't know what a regex is, then I will explain that string for you. "^" tells grep that the match needs to start at the beginning of the line, and "\$" tells it that it needs to end at the end of the line. Basically what that does is it says that it can't just find what we're looking for in part of a line, it has to be the full line.

Brackets match a character that is any of the letters inside. So that part will match any of the letters mentioned above that could be represented in hexadecimal.

And the plus says that you are looking for one or more of what came before.

As a whole, the regex is looking for a line that consists of one or more of the following characters, and nothing else:
- a
- b
- c
- d
- e
- f
- l
- z
- s
- o

(Sorry if that explanation didn't really make sense. Regex is hard, and I'm not the best at explaining things)

The last thing I want to talk about is "-E" which enables extended regex. As it turns out, ^, $, and [ ] aren't supported in normal regex. To get those features, I need to enable extended regex.

### tr "lzso" "1250"
We are back to tr, which I have already explained. What this line does is replaces the letter "l" with "1", "z" with "2", and so on.

I don't feel like I need to explain this one in detail, since I already explained tr.

### awk '{print length, "0x" $0}'
This one will probably be hard to explain because [AWK](https://man7.org/linux/man-pages/man1/awk.1p.html) is it's own programming language. But to explain, the thing in braces is getting run for every line. A major feature of AWK is specifying a regex to say which lines to run for, but we already know that we are matching every line, so we don't need that.

This is just a print statement. In python, this would be `print(len(s), f"0x{s}")`. The length variable contains the length of the current line. Since there is a comma there, it will put that in a different column, or basically just add a space between that and the next one. \$0 is a variable that stores the complete line. We are combining that with "0x" because that is how you represent hex values in most programming languages. Maybe an example will help you understand.

If AWK got the input:

```
...
defaced
deface5
defade
defa1c0
...
```

It would output:
```
...
7 0xdefaced
7 0xdeface5
6 0xdefade
7 0xdefa1c0
...
```

### sort -nr -k 1
[sort](https://man7.org/linux/man-pages/man1/sort.1.html) is pretty self explanatory. It sorts the input. But we did pass in some flags, so I should explain those

First of all, -k 1. This is telling it to sort by the first column, which is that length that we added with AWK.

-n means that sort should sort numerically instead of alphabetically.

-r makes the sort in reverse order, so it sorts from longest to shortest instead of shortest to longest

### cut -d " " -f 2
We are using [cut](https://man7.org/linux/man-pages/man1/cut.1.html) to remove the length that we added with AWK, since we don't need it anymore and it looks pretty ugly.

-d " " tells cut that the columns are separated with spaces, and -f 2 tells it that we only want to include the second field, or column.

## Output
After this, we will get a list of words that can be spelled in hexadecimal, spelled in hexadecimal. If you've also done this, you will notice that I lied at the top of the article. It's not just "coldblooded", there are two other words that tie it: Salsolaceae and Basellaceae. Both of these are words for families of plants that most people are not familiar with, so I didn't think that it would be as interesting to mention.

So what is the takeaway from this? Well, one should be that playing with shell scripts is fun. But other than that, you should take something away about how powerful and fast shell scripts are for text processing.

Does this mean that you should start writing all of your programs in bash? Of course not, that would be a horrible idea. What I do think is a valuable takeaway, however, is how processing things in parallel can get you a lot of speed. One could probably get that Go implementation to be a lot faster by using goroutines to essentially replicate what Bash was doing, but in a compiled language. But overall, I think that the best takeaway is just that shell scripts are cool.