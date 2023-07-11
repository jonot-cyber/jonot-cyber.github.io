---
title: "Shiny Counter"
date: 2023-07-10T19:55:13-04:00
draft: true
---
Recently I've been getting back into Pokémon. Specifically, I've been
playing Pokémon Blaze Black 2 Redux, which is a rom hack of Pokémon
Black 2, which adds more difficulty, and also allows you to catch
every Pokémon in the game (not including Pokémon added after
generation V)

I enjoyed the increased difficulty of the game, but something that
stood out to me was shiny Pokémon. If you aren't aware, shiny Pokémon
are rare variants of Pokémon that have a different color. Usually
1/8192 (or 1/4096 in newer games) of Pokémon are shiny, but this rom
hack changed the rate to 1/512. In addition, there are many legendary
Pokémon in the game, which can only be caught once, meaning if I
wanted them shiny, I would have to do it then. This combination of
easier access and fear of missing out made me want to do shiny
hunting.

The main way that people hunt for a shiny legendary is to save right
before the encounter, and then reset the game until you see a
shiny. At a certain point, you might want to keep track of how many
times you had to reset the game, to keep track of how long it took
you. This is the topic of this post.

Of course, there are plenty of ways that you can count something on a
phone or a computer. The most obvious way that I thought of was to use
the calculator app. Using the equals button will repeat the last used
operation, so you can repeatedly use that to count how many times you
have reset the game.

This approach has the obvious benefits of being simple and already
installed. But there were some downsides. First of all, if you close
the calculator, or need to calculate something else, the value you
entered will be gone. This isn't a major problem, but I thought it was
worth noting. Another issue is that when using picture in picture mode
on the iPhone, it will cover the number in the calculator app. If you
move it to the bottom, then it will cover the equals button. No matter
where you put it, it will cover some important information. You
actually can double-tap the video to make it smaller, but I thought
that this was still sub-optimal. The reason that this was important to
me was because shiny hunting is a tedious process, and can get boring
if you don't have something else to do.

But the most important issue to me is that the button that you have to
hit is small. If you aren't paying attention, which you probably
arent, since you're busy shiny hunting, then you can easily
accidentally hit another button, which will completely remove your
count. In addition, if you were watching something in picture in
picture, you might not even notice that you did this until several
encounters later, when you don't remember what you were at. And what's
the point of counting something if you cant *count* it?

The next problem that I had came when I wanted some more information
about my luck. In the original games, certain Pokémon are _shiny
locked_, which means that you can't aquire them shiny. The
documentation for the rom hack I'm using said that these were all
removed, but I wanted to verify this. I thought that if I had a 95% of
encountering a shiny by a certain point, but still hadn't, it would be
safe to assume that the shiny locks were present. A formula that you
can use for the probability of encountering a shiny after _n_ resets
can be determined by the following formula:

```py
def shiny_chance(resets, chance):
	return 1-(1-chance)**resets
```

An easy way that I could get this formula working was to use Desmos. I
can display this formula with a variable, and create an action to
increment it on a click. This worked for my goal, and if you were
wondering, the shiny locks were in fact removed. But this wasn't
optimal either. The touch targets are still small, and information is
still not saved. It's also akward to set up, especially on mobile.

At this point, I began looking for other solutions online. I found
many, but my main issue with them is that they don't let you set the
shiny rate yourself. It lets you set factors that affect the rate,
like what game you are playing, if you have the shiny charm, if you're
doing any special methods, etc. But they don't let you enter your own
number. This made them unfeasable for my usecases of a rom hack that
changes the shiny rate.

After that, I decided that I would create my own shiny Pokémon counter
that fixes all of my problems. You can access this
[here](https://io.jonot.me/shiny-counter).

The first thing that you will notice is the large sprite at the top of
the screen. This is mainly here to make the website look nice, but it
also means that it will be the only thing covered by picture in
picture.

Another thing that you will notice is the fact that the increment
button is very large, so it's hard to miss it.

In the top right, there is a settings button, which lets you change
what Pokémon is being hunted, what game it is in (this will only
affect the sprite used) and the shiny rate, which can be changed
manually.

All of the important information is stored in browser local storage,
so you don't have to worry about coming back later.

There are a few flaws that I think this has. It doesn't provide
sprites for any of the newer games, and the rate will probably not be
helpful with any methods were the shiny rate changes over time.

Overall, I hope that this project is helpful to someone.
