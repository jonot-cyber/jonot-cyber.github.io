---
title: "Holistic Revision Tracking: A Better Version Control System for C Programs"
date: 2025-06-30T06:00:00-05:00
---
This is a copy of my 2025 Sigbovik paper. I thought I'd also put it on my website for people who dislike PDFs. For those who don't know, Sigbovik is meant for satirical papers.

I've also had to change some things to port it over to markdown. Sorry!

# Abstract

According to JetBrain's 2023 developer ecosystem survey, 87% of
developers use Git to track revisions in their program [1]. While Git's model is powerful, it has a steep learning
curve for new users, owing to its complexity. In this paper, we
demonstrate the _Holistic Revision Tree_ (HRT),
an alternative version control system which takes advantage of the C
preprocessor to encode multiple versions of a program in a single
file. We will show how HRT makes you a better programmer by
simplifying version control and sharing code with
others.

# Background

While Git's distributed workflow is appealing to many developers [2],
it must be acknowledged that a significant factor in Git's ongoing
dominance is due to vendor-lock in. Popular software forges such as
GitHub and integrated development environments offer built-in tooling
for Git, and not for other version control systems. In addition, many
developers are already familiar with Git, and aren't willing to spend
the time needed to learn a new system. Because of this, many
alternative version control systems are _forced_ to offer Git
compatibility. For any new version control system to challenge Git's
tyrannical rule, it must take advantage of universal software
features, and have a very shallow learning curve.

## The C Preprocessor

The C preprocessor is a filter applied to C source code before they
are compiled [3]. This is most commonly used to include
_header files_ in a source file with the syntax `#include "filename.h"`. More importantly for us, it can be used to
conditionally compile code. The following example will print "TRUE"
when compiled and executed, and the else branch will be excluded
entirely from the compiled program:

```c
#include <stdio.h>

int main() {
#if 1 + 1 == 2
        printf("TRUE\n");
#else
        printf("FALSE\n");
#endif
}
```

This can be taken further by defining variables at compilation. For
example, we can define the variable VERSION to be equal to 0 or 1 when
compiling by using `gcc -DVERSION=0` or `gcc -DVERSION=1`,
respectively. This definition will cause the respective branch to be
compiled, while the other is filtered out. Using this technology,
we can store multiple revisions of a program in the same file.

```c
#include <stdio.h>

int main() {
#if VERSION >= 1
        printf("Hello, Universe!\n");
#else
        printf("Hello, World!\n");
#endif
}
```

To allow users to compile without manually specifying a version, this
block can be added to the top of the file:

```c
#ifndef VERSION
#define VERSION 1
#endif
```

These lines will define `VERSION` to 1 (the latest version in our
example) if it is not already defined. By updating the central line
with each update, it can be assured that users will get the newest
version.

By using these features of the C preprocessor, the entire revision
history of a C file can be stored without any external metadata. While
this is powerful, as will be elaborated later, we must accept that
editing a program in this manner is very cumbersome. Thus, we must
sacrifice a small amount of our method's ideological purity and
actually write code instead of just thinking about it.

# Introducing HRT

The _Holistic Revision Tree_ methodology relies on two core files:

1. _The Tree_ -- A file containing every revision of the program merged into one file.
2. _The Work File_ -- A file containing one single revision of the program extracted from the tree, without _any_ conditional compilation.

The program consists of two commands:

1. `checkout` -- Extract a specific revision from the _tree file_ into a _work file_.
2. `commit` -- Combine a modified revision in a work file back into the tree as a new version.

These commands are named the same as they would be in Git, to aid in
adoption.

# Methodology

The program uses an _LL parser_ [4] to parse the relevant preprocessor
directives in the C programming language. Thanks to some public domain code from
[nullprogram.com](https://nullprogram.com), the C
string-handling code necessary was somewhat bearable [5].

## Checkout

When checking out a revision from the tree, the program evaluates any
`#if` statements involving the `VERSION` variable to decide whether or not to
include its block of code.

## Commit

The commit process first creates a work file from the tree of the
latest version, which is determined by the version header. While doing this, the program creates a
map from line numbers in the _work file_ to
line numbers in the _tree file_.

It then calls `diff`, a standard UNIX command line utility to compare
text files, to compare the provided and generated work-file. This
produces a list of changes written by the developer to the work
file. The output of `diff` is parsed [6], and the changes made to
the work file are spliced into the tree file.

`diff` can output three different types of changes: Additions,
deletions, and changes. The following code is generated for each of
the three:

```c
...
#if VERSION >= 5
/* Comment added in version 5 */
#endif
```
    
```c
#if VERSION < 5
/* Comment removed in version 5 */
#endif
```

```c
#if VERSION < 5
/* Comment changed in version 5 */
#else
/* New comment :3 */
#endif
```

It is important to note that while two lines of code might be next to
each-other in a work file, they might be in different blocks in the
tree. While HRT doesn't need to handle this for addition, it must be handled for removals. This is done by
recursively descending through conditional-compilation blocks with
overlapping line-ranges.

Extra care was required for changes to make sure the new code would
not be included multiple times, or so that the wrong likes wouldn't be
deleted. The explanation for this algorithm is omitted for brevity.

Finally, the program checks the version header, and increments it to show the latest version.

# Usage

Upon obtaining HRT, it can be compiled as
follows: `gcc -o hrt hrt.c` (Or whatever C compiler you
prefer).  Intuitively, `hrt.c` itself is an HRT, and its versions can
be selected as detailed below.

To check out the latest version of a program stored in `tree.c` and
save the work file in `work.c`, you can use
`hrt checkout < tree.c > work.c`. A specific version, such
as version 3, can be checked out by running
`hrt checkout -v 3 < tree.c > work.c`.

After editing your file in your favorite text editor, you can commit
your changes by running
`hrt commit tree.c < work.c > new_tree.c`,
with `new_tree.c` intuitively containing the new version of the
tree. (Because of how shells work, you can't do
    `hrt commit tree.c < work.c > tree.c`. You can do
    `hrt commit tree.c < work.c > new_tree.c && mv new_tree.c tree.c` to accomplish the same thing).

## Compiling a Specific Revision <compile-specific>
`hrt` isn't needed to simply compile any version of a
program. For example, to compile version 3, one can run
`gcc -DVERSION=3 tree.c`.
This provides the portability and simplicity that we all so
desperately seek in our lives.

# Results

One clear benefit of taking HRT is that it eschews the need for
traditional Git forges such as GitHub, since our source tree can be
hosted almost anywhere. This could be shared as a link on a web-site,
stored in a Google Drive, or even provided in its entirety at the end
of a paper. The latter is useful because it grants readers a deeper
insight into the progression of a paper, rather than just its final
state. It allows them to see how a program changed over time,
including deleted functions, confused comments, and code that was
never relevant at any point whatsoever. Changes are also simple to
share by either sending a work file, or storing the tree on a shared
filesystem that can be changed by all contributers.

## File Size

HRT also has significant size benefits. The chart below shows a comparison
between how much size the source repository for HRT takes as a git
bundle [7], a tar archive containing each revision, and an HRT
tree. It also includes the work files of the final revision in bold.

| **Method** | **Bytes** |
|-|-|
|`tar` archive of revisions|450506|
|HRT tree|44389|
|Git bundle|25703|
|**Final work file**|24256|
|`tar.gz` archive of revisions|17517|
|HRT tree(gzipped)|8645|
|**Final work file (gzipped)**|5791|

As shown, the compressed HRT tree is the smallest way that every
version can be stored. It's compression ratio can be calculated
through size of all revisions/size of HRT tree, yielding 10.15x
for an uncompressed tree, and 52.11x for a compressed tree. Other
compression systems like Facebook's ZSTD, meanwhile, can only offer
5.5x on source-code [8]. Further research is needed to
investigate HRT's clear potential as a general purpose compression
algorithm.

# Obtaining HRT <obtaining>
HRT can be obtained by downloading the source tree from [https://jonot.me/hrt.c](/hrt.c).

# Bibliography
[1] JetBrains, “Team Tools The State of Developer Ecosystem in 2023 Infographic.” [Online].
Available: https://www.jetbrains.com/lp/devecosystem-2023/team-tools/

[2] Linus Torvalds, “Git.” [Online]. Available: https://git-scm.org/

[3] cppreference.com, “Preprocessor.” [Online]. Available: https://en.cppreference.com/w/c/preprocessor

[4] Wikipedia, “LL parser.” [Online]. Available: https://en.wikipedia.org/wiki/LL_parser

[5] Chris Wellons, “Robust Wavefront OBJ model parsing in C.” [Online]. Available: https://nullprogram.com/blog/2025/03/02/

[6] OpenBSD, [Online]. Available: https://man.openbsd.org/diff

[7] “Git git bundle Documentation.” [Online]. Available: https://git-scm.com/docs/git-bundle

[8] Matt Mahoney, “Silesia Open Source Compression Benchmark.” [Online]. Available: http://mattmahoney.net/dc/silesia.html
