---
title: "Ideas"
date: 2023-01-08T17:30:28-05:00
draft: false
tags:
- Programs
---
[Ideas](https://github.com/jonot-cyber/ideas) is a really simple program, and yet out of all of the programs I have made, it is probably the one I have used the most. It's so short, in fact, that I'll just put the entire source code into this post:
```python
#!/usr/bin/env python3
from pathlib import Path
import os

# Folder for ideas
IDEAS_FOLDER = Path(os.environ["HOME"]) / ".local/share/ideas/"

def main():
    title = input("What is your idea? ")

    print("Interesting, tell me more...")
    description = list()
    line = "placeholder"
    while line != "":
        line = input("> ")
        description.append(line)
    
    path = IDEAS_FOLDER / f"{title}.md"
    with path.open("w") as idea_file:
        idea_file.write(f"# {title}\n")
        for line in description:
            idea_file.write(f"{line}\n")

    print(f"Sounds like a fun idea! I recorded it at {path}")

if __name__ == "__main__":
    main()
```
I don't think that this program is very hard to understand. What it does is it asks for a title and an idea, then takes an arbitrary number of lines about it. Once you're done, it saves it to a file in the folder `~/.local/share/ideas/` folder. One more interesting thing about this is that the way the title is formatted makes it basically a markdown file.

# Inspiration
Often in my life I would have an idea for a program or really anything. I would think about it for a while, but ultimately, I would forget about it. And previously I had tried to store these in places like Logseq, but I wouldn't often use them. This program fixes that problem because of how easy it is. I just `Ctrl-Shift-T` to open a terminal, type "idea" and then just type my idea.

# Minimalism
I've already touched upon this in the previous paragraph, but I feel like one of the best parts of this program is how it doesn't do more than I need it to. Since it operates on files, all of the things that I might want to do with these ideas are trivial with basic Unix commands:
```bash
# Count the number of ideas
ls ~/.local/share/ideas | wc -l
# Get a random idea
ls ~/.local/share/ideas | shuf -n 1
# Delete a bad or completed idea
rm ~/.local/share/ideas/whatever.md
# Add more information about an idea
nano ~/.local/share/ideas/whatever.md
```
And the list goes on.
# Caveats
I will admit that the program is not perfect. There are a few problems that I have with it:
## It doesn't do markdown entirely correctly
So when using the program, you might notice that once you put an empty line, it will exit and save your idea. However, in markdown, you need a line break to split pargagraphs. So if you actually view any of these ideas in any markdown viewer, it'll all just appear on one line
## It doesn't check for valid characters
I've had on a couple occasions where I want to put a slash in an ideas title, but since that is a file name, I can't, and sometimes I do not realize this until I have already typed out the rest of my idea, which is a major inconvenience.
## I can't use it for most of the day
Most of my day is spent on a Chromebook away from my computer, so if I come up with an idea while I'm at school, I have to either
- Remember it until I get home
- Put it in some random google document and try to remember to transfer it
# Conclusion
Despite all of the issues with this program, I still think it is great, and I would recommend that you either use this or something similar if you are anything like me with ideas.
# Installation
To install this, just copy that text into a file named idea, set the execute bit with `chmod +x ./idea`, and move it to `~/.local/bin` or somewhere else on your path.