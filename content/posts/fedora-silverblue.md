---
title: "Fedora Silverblue"
date: 2023-01-29T14:47:45-05:00
draft: false
tags:
- Linux
---

Since the beginning of January I have been using Fedora Silverblue on my home computer. In this article, I thought that I would explain a bit about how I use it, why, and the pros and cons of using it for general use and development

## What is Fedora Silverblue?
As [this website](https://silverblue.fedoraproject.org/about) states, Fedora Silverblue is a variant of Fedora Workstation where the root filesystem is immutable, meaning you can't change it, which makes every root installation the same. This makes the system more stable. Basically it works the same way as mobile operating systems.

Applications are usually installed using flatpaks.

## Normal Use
Fedora Silverblue is almost the exact same for normal use. I could install Steam, Heroic, Prism Launcher, Discord, and all of the other programs that I normally use on Flathub through Gnome Software, and it all just worked fine. I did run into some issues with Firefox

By default, Firefox on Fedora Silverblue doesn't come with h264 support, which is very noticeable. YouTube works fine with most videos using vp9 or av1, but on other websites you wont be able to play most videos. To get this working, you need to install `mozilla-openh264`. You could also use the flatpak version of Firefox, but I had some major issues with that

## rpm-ostree
If you've used Fedora before, you probably are used to the `dnf` package manager, which Fedora Silverblue doesn't use. Instead, I installed that package with `rpm-ostree`, which takes traditional Fedora packages and layers them on top of the filesystem image.

## Devlopment
Development is not Fedora Silverblue's strongest aspect, and gets in the way more than it helps. Tools like NeoVim and VSCode, along with all of the JetBrains IDEs are available through flathub. Surprisingly, my NeoVim config worked out of the box without any tweaking. The problem is that these aren't very usable by themselves. They contain the Freedesktop Runtime, which has some tools included with it. It has gcc, ruby, python, and a decent amount of c libraries, like opengl or sdl. That's enough for some people, but not for many. If you want to use Fedora Silverblue for development, you'll want to use one of these tools:

### Toolbox
If you don't know what [Toolbox](https://containertoolbx.org/) is, it's basically a tool on top of Podman (like Docker) that allows the container to access your home directory, create windows with wayland, do networking with sockets, etc. It's like a [devcontainer](https://containers.dev) but more powerful. If you are using VSCode, you can use [this GitHub repo](https://github.com/owtaylor/toolbox-vscode) which lets you "run" VScode in a toolbox container, which will launch the VSCode flatpak with the remote development extension to your container.

By default, toolbox only ships with Fedora support, but you can use [DistroBox](https://github.com/89luca89/distrobox) to do the same thing with Ubuntu or ArchLinux for example. DistroBox is cool even if you aren't on Silverblue actually.

### SDK Extensions
This is my preferred method. I think these are used for building Flatpaks, but they basically contain additional tools to use with flatpaks. In the flathub repository, there are sdk extensions for:

- Java
- Node.js
- .NET
- Zig
- Vala
- TexLive
- Rust
- Mono
- Haskell
- Go
- PHP
- LLVM (Includes clang)
- D
- MinGW
- Free Pascal
- Bazel (build system)

Looking at the Flathub repo shows that some people are currently working on Dart and Flutter, which seems pretty cool.

I'm going to use Go, the best programming language, as an example:

To install the sdk, I run `flatpak install golang` and it lists all of the options that are available:
```text
Looking for matches…
Similar refs found for ‘golang’ in remote ‘flathub’ (system):

   1) runtime/org.freedesktop.Sdk.Extension.golang/x86_64/19.08
   2) runtime/org.freedesktop.Sdk.Extension.golang/x86_64/20.08
   3) runtime/org.freedesktop.Sdk.Extension.golang/x86_64/21.08
   4) runtime/org.freedesktop.Sdk.Extension.golang/x86_64/1.6
   5) runtime/org.freedesktop.Sdk.Extension.golang/x86_64/22.08
   6) runtime/org.freedesktop.Sdk.Extension.golang/x86_64/18.08

Which do you want to use (0 to abort)? [0-6]: 
```
 The numbers at the end are the most important. Make sure that you use the one that is the same version as the version of the freedesktop sdk of the app you are using. You can check this by running `flatpak info [THE_APP]`:
{{< highlight text "hl_lines=13" >}}
Neovim - Vim-fork focused on extensibility and usability

          ID: io.neovim.nvim
         Ref: app/io.neovim.nvim/x86_64/stable
        Arch: x86_64
      Branch: stable
     Version: 0.8.2
     License: Apache-2.0
      Origin: flathub
  Collection: org.flathub.Stable
Installation: system
   Installed: 27.1 MB
     Runtime: org.freedesktop.Sdk/x86_64/22.08
         Sdk: org.freedesktop.Sdk/x86_64/22.08

      Commit: 01e32f62fa08aacbdc66c8504d9943efccd342f4ba30733e99dfa49af5638720
      Parent: 0fe9a3802c62266408d3d78630b674fb66a0b39ebad03ce2efb5221b2fe4945a
     Subject: Add extension point for tools (eb828fbc)
        Date: 2023-01-29 02:17:24 +0000
{{< / highlight >}}

That lines up with number 5 on the list, so you would want to enter 5.

Now you need to tell the app to use the extension, which you can do with the `FLATPAK_ENABLE_SDK_EXT` environment variable like this: `FLATPAK_ENABLE_SDK_EXT=golang flatpak run io.neovim.nim` the variable can contain a comma separated list (no spaces!), or an asterisk to include all sdks installed.

You can use a tool like flatseal to make this change persistent. Overall, if you are doing pretty standard development in languages like Node, Go, C#, or Rust, you shouldn't have a problem developing like this.

### Non-standard installs
I don't have a way to title this. But a common way to install apps is to use something like this: `curl -fsSL https://whatever.app/install | bash`. This will work fine on Fedora Silverblue. Please do not do this. Not because of anything related to Fedora Silverblue, its just not good in general.

And while I'm at it, if you are making some tool, PLEASE use the xdg directory specification. Please stop making my home directory a mess. Your twenty `~/.whatever` folders should be in `~/.config/whatever` like they belong. Oh, and Go? you are absolutely not important enough to do `~/go`. That just personally upsets me. At least most people have the decency to hide themselves with a dot. If you're reading this and this bothers you as much as it bothers me, you can set the `GOPATH` environment variable to something more sensible. The ArchLinux wiki actually has a [whole page](https://wiki.archlinux.org/title/XDG_Base_Directory) just listing tools and how you can get them to use the XDG base specification.

## Pros and Cons
Now if all of this sounds like a massive inconvenience to you, then you are right! But there are a few advantages. It makes it pretty easy to try out new things since you can rollback the system. If you want to try out a feature on Rawhide or jump to KDE to see what they changed and just rollback if you mess it up. I haven't had any stability issues, but then again I didn't have many of those on regular Fedora.

Overall, to put this on a usability scale, its not bad enough that it would make me want to uninstall. All of the tools I need work fine, so I don't feel a big need to switch. But overall it will probably just make things harder for you, so I probably wouldn't use it again if I got a new computer or had to reinstall.

Something I do think is interesting is that this isn't the only project to change the way that development environments work. I already mentioned [Devcontainers](https://containers.dev) earlier, tools like [NixOS](https://nixos.org) and [GNU Guix](https://guix.gnu.org/) are becoming more popular. [GitHub Codespaces](https://github.com/features/codespaces), [JetBrains Fleet](https://www.jetbrains.com/fleet/), and [GitPod](https://www.gitpod.io/) all offer cloud-based solutions to IDEs, and (in my opinion) more importantly, all of these offer a reproducible solution to development environments.

Like most of the things I write here, I'm struggling to come up with an ending, because that's when I have to justify why all the things I did had a good reason to be done. But the truth is that none of the things here have a good reason to be done other than that they entertain me.