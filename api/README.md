# Please read this before review
Here is the list of **possible inconsistencies** between your code-guide and this project
 * Used autoconfig + autowire because of test project, but ambigulos dependencies are passed correctly. In production terms I am also preferred to use container over magic.
 * Some private data (Bin) can be logged
 * Some configs can be not correctly structured because of app size 
 * There can be bugs with xdebug 3 + php 8 + PhpStorm so please use raw testing using vendor/bin/phpunit, see https://youtrack.jetbrains.com/issue/WI-56947
 * Use makefile "make" to see commands for interaction, run it locally

I don't get the meaning of next

```text

For services, we use some suffix to represent the job of that service, usually *er:

manager

...

resolver

```

So I`ve renamed everything to have prefix manager instead of service. Not standard approach...

<hr>

**Spent time on this task:**

 1) Dealing with Docker, xdebug 3, finding correct image - 3h
 2) Dealing with Xdebug 3 error + configuring it locally in phpstorm - 2h
 3) Refactoring old code to new structure - 4h
 4) Adding generator + pagination - 2h
 5) Reading the codestyle + performing format changes 2h 30m
 6) Test coverage - 2h
 7) Readme + makefile etc - 1h


**Next things to improve:**
 * Add validation for input params
 * Add some currency enum for testing correct values
 * Add application layer when it is needed =)
 * Add more accurate error handling on BL cases
 * Split reader related code in different module
 * Return some data structures from API instead of arrays

**Additional things that added to task:**
 * This project was build with latest php 8 and Symfony versions
 * File reader uses generators to process big files with pagination
 * All DTO's are immutable
 * CommissionManager configured to process transactions by batches
 * Binlist configured to use async requests to process transactions by batches
 * Exchange rates response is cached by 1h
 * Output values of commissions will be rounded with precision 2 (app.yaml)
 * Scale of math operations will be 5 (app.yaml)

