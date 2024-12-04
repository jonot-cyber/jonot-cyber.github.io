---
title: "Why I Wrote a Game Boy Advance Game in Zig"
date: 2024-12-03T22:44:17-05:00
draft: false
---
The Game Boy Advance is an interesting game console. It has a modern-style CPU (32-bit ARM, lots of registers), but uses an old-fashioned tile based renderer like how the NES did it in the 80s. Don't get me wrong, since its one of Nintendo's last tile-based systems, they took the idea as far as it can go with fancy features like affine transformations, transparency, and effects applied to sprites. But at its core, it occupies a very unique space:

![A diagram of Nintendo consoles and handhelds based on how the CPU and graphics work](./diagram.png)

The only other major occupant of that quadrant is the Nintendo DS, and while I have fond memories of it, I thought that the second screen would make programming harder. So with this information, I decided to make a game for the Game Boy Advance:

![A screenshot of 2048 running in a Game Boy Advance Emulator](./game.png)

I have countless hours on games about numbers in squares and rules on how they combine in rows (Picross, Picross 3D, Minesweeper), so 2048 was a good choice for a project. You can try the game out in an emulator [here]().

But the most interesting thing about this project to me was the language. My initial play-projects with the Game Boy Advance were written in C++, but I wrote my first full game in Zig. And that's a bit weird. First of all, its a very niche language, its still in beta, and it was made 15 years after the Game Boy Advance released in Japan. But even though it's not the most popular, I think that Zig was great for this project, and that is what this blog post will be about.

This blog post is not about how good Zig is in general, and is mainly focusing on the features of the language that make it good for this type of embedded programming. You can find other people on the internet talk about why you should use Zig, and I'll leave that to them.

## Toolchains
I started using Linux five years ago, mainly because I couldn't figure out how to get Python working on Windows, and I found out that Linux came with it. For the five years since then I have been continuing my ongoing struggles with packaging, versions, dependencies, and all the other problems that come with the hard problem of getting a program working on your computer.

This is why, when I decided to make a simple 3d scene on the Nintendo DS around a year ago, I was immediately uncomfortable. The most popular way to develop games for "retro" Nintendo consoles is through something called [devKitPro](https://devkitpro.org/), which packages GCC toolchains, libraries, and development tools for these consoles. How do you get these packages? Well, you download the ArchLinux package manager, set it up to point towards their repositories, and install that way.

Even back then, this bothered me. In general, the more different package managers I have to use, the less happy I'll be. I did end up installing this, but I tried to copy over some of the linking files into my repository so I could just use a standard arm gcc toolchain.

When I started my GBA demo projects, this stuck with me. I again started by copying the devKitPro linker scripts, and cobbling together some weird [Meson](https://mesonbuild.com/) setup to get everything working together with clang. It was a mess, but it worked. The nice thing is that since I understood the toolchains better, I was able to get newlib working, which gave me the C and C++ standard libraries to use. I made some demos to understand how sprites worked, but eventually I moved on to:

### Zig
I think that the first time I heard about Zig was [this blog post](https://andrewkelley.me/post/zig-cc-powerful-drop-in-replacement-gcc-clang.html) by Andrew Kelly about using Zig for cross-compilation. You didn't need to setup these toolchains using weird package managers (for the record I consider rustup a weird package manager). You can just set a target, and things work.

That wasn't the only part of the build process that Zig made better. Zig builds work by running the `build` function in the file `build.zig`. Here's an overview of the build process for the game:

- Using a linker script to get the file layout right, compile an ELF binary for the game, along with a startup file written in assembly
- Use objcopy to extract all the data from the ELF structure (This is basically a GBA rom now)
- Use a tool like gbafix to add in the correct header information (Neeeded on real hardware, but not on emulators)

Because Zig includes objcopy, I can do all of these steps in the build file itself. This makes the process less messy and error-prone.

Another thing that the build system makes easier is code generation. I use code generation to take png images and turn them into pixel data that the GBA will understand. The Zig build system lets me compile the program that generates the code, generate the code, and link it together all within a function. And you specify how dependencies work in this file, so the build can be parallelized on all the cores of your shiny new computer.

Zig made cross compiling and toolchain management, something that has always been the bane of my existence, something I didn't have to worry about.

## Packed Structs
I'm putting this second because even though it's a feature that isn't dwelled upon for long in the Zig documentation, it's one of the best features for Game Boy Advance programming.

If you weren't aware, consoles like the Game Boy Advance don't have fully fledged operating systems with high level API calls to do graphics. You access things like video, controls, audio, and other hardware controls through *registers*. These are areas of memory which are usually 16 bit, and pack together a bunch of fields. These registers are located at a consistent memory address that you read and write to. Take, for example, BGxCNT. There are 4 variants of these with different numbers where that x is, and they control how the 4 background layers of the console display. Here is a memory layout, courtesy of [gbatek](https://problemkaputt.de/gbatek.htm#gbalcdvideocontroller):

```
Bit   Expl.
0-1   BG Priority           (0-3, 0=Highest)
2-3   Character Base Block  (0-3, in units of 16 KBytes) (=BG Tile Data)
4-5   Not used (must be zero) (except in NDS mode: MSBs of char base)
6     Mosaic                (0=Disable, 1=Enable)
7     Colors/Palettes       (0=16/16, 1=256/1)
8-12  Screen Base Block     (0-31, in units of 2 KBytes) (=BG Map Data)
13    BG0/BG1: Not used (except in NDS mode: Ext Palette Slot for BG0/BG1)
13    BG2/BG3: Display Area Overflow (0=Transparent, 1=Wraparound)
14-15 Screen Size (0-3)
```

Let's say you want to turn on the mosaic effect for background 0. How would you do that in C? Assuming you have a `#define` somewhere with the memory address, you could do something like this:

```c
*REG_BG0CNT |= BG_MOSAIC;
```

Where `BG_MOSAIC` is a constant equal to `0x0040`. This works, but its not a very nice experience. It works fine here, but in more complex examples (like where you're setting more than a boolean) it gets trickier to read. In something like C++ or Rust you might see a builder pattern get used. This makes it obvious what is happening, and because of zero-cost abstractions you don't give up much by doing that. But how about Zig?

Zig has a very interesting feature, which is that you can have integer types which aren't powers of two. You can have a `u8` for an unsigned 8 bit integer, but nobody will stop you from making a `u7`. This works together with a *packed struct*. Normally, fields of structs will be aligned to powers of two to make accesses faster, but packed structs let you opt to squeeze everything as close together as is possible. This lets us make a struct like this:

```zig
const BldCnt = packed struct {
    bg_priority: u2 = 0,
    character_base: u2 = 0,
    _unused: u2 = 0,
    mosaic: bool = false,
    ...
};
```

And we can use it like this:

```zig
REG_BG0CNT.mosaic = true;
```

That's so much better! Maybe you've never had this problem, but if you are using hardware like the Game Boy Advance you will deal with packed memory layouts like this a lot. This alone is the biggest selling feature to me.

## Comptime
When I started making builds of my game, I didn't like that the rom was as big as it was. I decided to compress all of my sprites so that the rom would be smaller. Luckily, the Game Boy Advance includes decompression functions in its BIOS, so I only needed to implement compression, and call the builtin function.

But wait: If I compress it at runtime, then I don't actually accomplish anything. I need to compress it at compile time. So do I use code generation again? Nope.

One of Zig's best general features is its ability to run code at compile time in a way that is almost the exact same ot how you would run it at runtime. It's still one of the first things listed on their website. I was able to write a function to implement run length encoding, call the function, and store the result in a global constant. Zig took care of most of it, and made compressing my data really easy.

## Standard Library
One thing I like about Zig is its standard library. Sure, you *can* use newlib to get the C/C++ standard library, but it always felt to me like I had to stick with a smaller subset of the libraries on hardware likek this. Zig, though, is much more flexible.

The library is at its core built around a language with generics, and most of the library functions are built to support them. And Zig uses these capabilities to give you more control over the way that the standard library works than other languages do.

For example, all of the functions in the Zig standard library that allocate memory have an argument for a memory allocator. This means you can provide your own structure with a custom allocate, reallocate, and free functions to handle memory in whatever way is best for you. If you are doing a lot of allocations quickly, you can use an arena allocator. If you want to check for memory that isn't freed, you can use a general purpose allocator. If you just want to use `malloc(1)`, use `std.heap.c_allocator`. You can have an array of bytes in memory somewhere and setup a fixed-buffer allocator to allocate from there. I didn't actually need to use any allocator for this project, but if I did, that last one would work well.

Things like these made it feel free to use the whole standard library whenever I thought it was best suited to my problem. This was some good therapy after writing a [kernel without a libc](https://github.com/jonot-cyber/Todd).

Side note: The score display for the game just uses `print` with a custom `io.Writer`. There are more performant ways I could've written this, but it works fine, and it's better than it would be in something like C. Zig's features make it better suited to excluding code at compile time. Because of this, the relatively massive code to handle floating points isn't included in the final binary, since the language can tell it's not being used.

## Issues
Alas, Zig is not a perfect language. As with mxy praise, all of the issues here that I will raise are pretty specific to the Game Boy Advance, and aren't really that general.

### Inline Assembly
Zig has support for inline assembly, and its pretty nice. Unfortunately, it only has support for one output. Some of the BIOS functions on the GBA that you might use inline assembly for output multiple values in different registers, which is problematic for Zig. This is [currently being worked on](https://github.com/ziglang/zig/issues/215) so it might be improved in the future.

### Thumb Code/Arm Code
The Game Boy Advance's CPU has two operating modes. The ARM mode is more advanced and has more instructions and registers available, but the instructions take more space. Thumb instructions are smaller. On the Game Boy Advance, it is almost always better to use Thumb, because of how memory works on the console.

There are, however, certain things that you cannot do only using Thumb. If you want to use a hardware interrupt, the function that handles the interrupt has to be in ARM mode. This isn't usually an issue, since ARM and Thumb functions can call each other without any issue.

In C and C++, you can specify whether a function is ARM or Thumb like this:
```c
__attribute__((target("arm")))
void interrupt_handler() {
    ...
}
```

To my knowledge, you can't do this in Zig. This makes it less convenient to use the language, since you would need to specify ARM functions in a separate compilation unit and link them together (I actually haven't tested if this works since I didn't use interrupts in my game).

### Weird memory
Have you ever had a bug that you spent days on only to figure out that it was something really dumb? Unrelated question: Did you know that you can't write to video memory on the Game Boy Advance in units of 8 bits, and if you do, it'll still work but all your graphics will be messed up with no obvious way to figure it out unless you read one specific paragraph of the documentation? Hey did you know that when you compile a binary optimized for size, memory copies will be by units of 8 bits, but *not if you use debug mode?*

Well anyways. After I figured this out, I still had issues making sure my sprites and palettes were copied correctly. Sometimes, the compiler would get too smart for its own good, and recognize that a function that I wrote just copies memory. It would helpfully replace the function body with `memcpy` to save space.

As it would turn out, the Game Boy Advance has quite a bit of "weird memory" that you have to work around in weird ways. I know that this is a long shot, but it would be nice if there was some way to specify how memory in certain address ranges need to be addressed.

Maybe this is a sign that I just need to write my own programming language. Worst case scenario, at least I'd have an excuse for why I don't update this website for almost a year the next time.x34
