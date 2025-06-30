---
title: "Optimal Addition Sequences for Integer Multiplication"
date: 2025-06-30T07:30:00-04:00
---
Most "modern" computers have built-in hardware for integer multiplication. Note the quotes around modern. The original IBM PC had hardware multiplication. The Sega Genesis had hardware multiplication. But older CPUs, especially embedded ones, would often leave this out. One notable example is the Zilog Z80, which was still produced until [2024](https://arstechnica.com/gadgets/2024/04/after-48-years-zilog-is-killing-the-classic-standalone-z80-microprocessor-chip/) (the newer eZ80 has multiplication). The Game Boy also uses a CPU similar to a Z80, and also does not have multiplication.

But that doesn't mean that this computers can't multiply integers. You may remember from elementary school that you can do multiplication by repeated edition. a * 8 = a + a + a + a + a + a + a + a. This isn't the most efficient way of doing this. You can instead do b = a + a, then c = b + b, then d = c + c. This uses 3 additions rather than 7.

You may also be familiar with using bit shifting to do this. a << n is equivalent to a * 2 ^ n, so you could use a << 3 in a single operation. This is true, but the Game Boy can only shift by 1 in a single instruction, so it isn't actually any better than multiplication.

I wanted to write a program that found the optimal "route" to do any multiplication by a constant on a Game Boy. The rest of this post will describe how I did this.

# Method
Its easier to think about this problem as addition rather than multiplication. Instead of thinking about adding together a to get a * n, you can add together 1's to get n. This is an equivalent way of thinking about the problem, and its easier to explain. Define c(n) which is the number of additions needed to reach n.

While thinking about how to implement it, my first thought was that it would be a good place to use dynamic programming. Given a + b = n, if you know c(a) and c(b), then you also know that one more addition is needed to get c(n). The problem has overlapping subproblems. Since a and b will be lower than n, you can calculate c(n) in increasing order of n, and never have to repeat work.

To start, c(1) = 0, since 1 is the multiplicative identity. For any n > 1, calculate all the pairs which add up to n in a loop (at this stage, you are only considering positive numbers). Calculate the cost for each pair (a, b) using c(a) + c(b) + 1. Out of all these costs, choose the minimum, and save that as the value for c(n). Loop to whatever you choose as your maximum n (255 for me), and you're done!

Now, if you actually did this, you'll notice an issue. The cost for every number is just n-1, which is exactly what you get from that naive repeated addition earlier. In fact, it _is_ doing that repeated addition from earlier. To understand why the above solution is wrong, consider the following example:

```
b=a+a
c=a+a
d=b+c
return
```

This is a way that you can multiply `a` by 4. Obviously, it is not optimal. The variables b and c store the exact same value, so there's no need to compute it twice. You can add in a check when doing that cost calculation, for this revised formula:

```
c(n) = (a == b) ? (c(a) + 1) : (c(a) + c(b) + 1)
```

This seems like a good solution, but it was really just one case of a larger bug.

# This whole algorithm doesn't work
I had actually written about half of this post before I realized this and had to go fix it. The issue is that this algorithm doesn't handle overlapping calculations right. That fixes the most obvious example, but imagine something like this: 8 = 6 + 2. The algorithm will insert the cost of 6 and 2. In reality, the cost of 2 should be 0, because calculating 6 calculated 2 as a subproblem.

Another implication of this is that with how the algorithm works, c(n) can't always be the smallest possible cost. It also needs to consider if choosing some other route of addition would solve subproblems better.

Luckily, there is one conjecture that helps keep the runtime complexity under control. You only need to consider the smaller value itself as a subproblem, and not overlapping subproblems between them. That sentence was confusing, so here's an example:

n = x + 4

You are trying to get the cost of n, and are testing whether adding 4 to some subproblem x is a good route. Calculating x also calculates 2, but doesn't calculate 4. You _could_ use that 2 to make 4, adding 1 to the cost. But this also means that (x+2) will be considered later:

n = (x + 2) + 2

You can know that the cost for x+2 is at most 1 more than the cost of x. The 2 at the end is free, since it has already been calculated. The second route has a cost that is at most the same or smaller than the first route, and it is also easier to compute.

# A new algorithm
In addition to defining c(n) as the minimum number of additions needed to reach n, you also define c(n,s) as the minimum number of additions to reach n in a way that also calculates s. c(n, s) is ∞ if it is impossible to compute s as a subproblem of computing n.

We also should define m(n) and m(n, s), which each define all the numbers calculated in the route for c(n) and c(n, s) respectively. m(n) and m(n, s) always include n. Any time c(n) or c(n, s) is stored, you should assume that m(n) and m(n, s) is also stored.

Start the algorithm by doing basically the same thing as for the old algorithm. After finding the minimum cost, look through m(n). For all k in m(n), store c(n, k) = c(n).

Then, check if you can take advantage of a subproblem. Assuming a is the larger number, calculate c(a, b) + 1. If this cost is smaller than the one you stored for c(n), then replace it with the new cost, and also replace all the values for c(n, k) as shown above.

In theory, another step is needed for correctness. In practice, it didn't change the outcome at all (I'm not fully sure why). After both of these steps, and still for each pair a and b, we check for each possible subproblem.

Make a new nested loop s which goes from [1, n). Calculate the cost as c(a, s) + c(b) + 1. If this is less than c(n, s), store that, and also update c(n, k) again for all m(n, s).

# Adding subtraction
The Game Boy also supports subtraction, and we should take advantage of that to make better formulas. You can essentially copy the function for addition and change it to support subtraction. There is, however, one issue with this: Since a and b can now be greater than n, we can't just do the calculations in order. An improvement late in the list might improve some value earlier in the list. In practice, you can solve this by looping over the list multiple times until values stop changing. Since what I described is pretty rare, you only have to do this twice.

# Conclusion
You can get my source code [here](https://github.com/jonot-cyber/integer_multiplication/)

This algorithm was harder than I thought it would be to implement, but overall it was fun. There were a few things that I left out while writing. One of those is proving that conjecture from earlier. Another one is register allocation. On the Z80 (and the Game Boy), you really only have 5 or so general purpose registers to work with. The add instruction always outputs to the a register, and the first operand is always in the a register. You have to do some moves in addition to the adds to make it all work, and this could change what the optimal pattern is. I'll leave that as an exercise for the reader. What I will do is give you an example of what the assembly for the hardest multiplication would look like:

```asm
; Multiply a with 233
ld b,a 
add a,a
add a,a
add a,a
ld c,a
add a,a
add a,a
ld d,a
add a,a
ld e,a
add a,a
add a,e
add a,d
add a,c
add a,b
ret
```

# Table
A table of how many additions are needed for each multiplication.
|n|c(n)|
|-|-|
|1|0|
|2|1|
|3|2|
|4|2|
|5|3|
|6|3|
|7|4|
|8|3|
|9|4|
|10|4|
|11|5|
|12|4|
|13|5|
|14|5|
|15|5|
|16|4|
|17|5|
|18|5|
|19|6|
|20|5|
|21|6|
|22|6|
|23|6|
|24|5|
|25|6|
|26|6|
|27|6|
|28|6|
|29|7|
|30|6|
|31|6|
|32|5|
|33|6|
|34|6|
|35|7|
|36|6|
|37|7|
|38|7|
|39|7|
|40|6|
|41|7|
|42|7|
|43|7|
|44|7|
|45|7|
|46|7|
|47|7|
|48|6|
|49|7|
|50|7|
|51|7|
|52|7|
|53|8|
|54|7|
|55|8|
|56|7|
|57|8|
|58|8|
|59|8|
|60|7|
|61|8|
|62|7|
|63|7|
|64|6|
|65|7|
|66|7|
|67|8|
|68|7|
|69|8|
|70|8|
|71|8|
|72|7|
|73|8|
|74|8|
|75|8|
|76|8|
|77|9|
|78|8|
|79|8|
|80|7|
|81|8|
|82|8|
|83|8|
|84|8|
|85|8|
|86|8|
|87|9|
|88|8|
|89|9|
|90|8|
|91|9|
|92|8|
|93|8|
|94|8|
|95|8|
|96|7|
|97|8|
|98|8|
|99|8|
|100|8|
|101|9|
|102|8|
|103|9|
|104|8|
|105|9|
|106|9|
|107|9|
|108|8|
|109|9|
|110|9|
|111|9|
|112|8|
|113|9|
|114|9|
|115|9|
|116|9|
|117|9|
|118|9|
|119|9|
|120|8|
|121|9|
|122|9|
|123|9|
|124|8|
|125|9|
|126|8|
|127|8|
|128|7|
|129|8|
|130|8|
|131|9|
|132|8|
|133|9|
|134|9|
|135|9|
|136|8|
|137|9|
|138|9|
|139|10|
|140|9|
|141|9|
|142|9|
|143|9|
|144|8|
|145|9|
|146|9|
|147|9|
|148|9|
|149|10|
|150|9|
|151|10|
|152|9|
|153|9|
|154|10|
|155|9|
|156|9|
|157|10|
|158|9|
|159|9|
|160|8|
|161|9|
|162|9|
|163|9|
|164|9|
|165|9|
|166|9|
|167|10|
|168|9|
|169|10|
|170|9|
|171|10|
|172|9|
|173|10|
|174|10|
|175|10|
|176|9|
|177|10|
|178|10|
|179|10|
|180|9|
|181|10|
|182|10|
|183|10|
|184|9|
|185|10|
|186|9|
|187|10|
|188|9|
|189|9|
|190|9|
|191|9|
|192|8|
|193|9|
|194|9|
|195|9|
|196|9|
|197|10|
|198|9|
|199|10|
|200|9|
|201|10|
|202|10|
|203|10|
|204|9|
|205|10|
|206|10|
|207|10|
|208|9|
|209|10|
|210|10|
|211|10|
|212|10|
|213|10|
|214|10|
|215|10|
|216|9|
|217|10|
|218|10|
|219|10|
|220|10|
|221|10|
|222|10|
|223|10|
|224|9|
|225|10|
|226|10|
|227|10|
|228|10|
|229|10|
|230|10|
|231|10|
|232|10|
|233|11|
|234|10|
|235|10|
|236|10|
|237|10|
|238|10|
|239|10|
|240|9|
|241|10|
|242|10|
|243|10|
|244|10|
|245|10|
|246|10|
|247|10|
|248|9|
|249|10|
|250|10|
|251|10|
|252|9|
|253|10|
|254|9|
|255|10|
