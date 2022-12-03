# TFT Traits

_Script for calculating an optimal stand united team composition in [TeamFight Tactics](https://teamfighttactics.leagueoflegends.com/en-us/)_

## Explanation

There are multiple "sets" in TFT. Each set has a number of available champions - usually between 50 and 60, and a number of traits, which each have certain "levels". If a composition (a set of champions) has a combined trait score high than one of the trait's levels, that trait level is considered "active".

Sets in TFT also have "augments" which are modifiers to a composition's attributes which happen three times each game.

One such augment is called "Stand United". This augment adds a certain amount of power to each unit in the composition based on the number of active synergies in the team composition.

This script calculates optimal stand united team comps, using a brute force algorithm to calculate unique compositions within a given set champion pool, and then score each composition based on active synergies. The time complexity of the algorithm is roughly `O(n ^ k)`, where `n` is the number of champions in the set, and `k` is the desired team size.

The script allows seeding the starting composition with some inferred champions, since this can greatly reduce the running time.

This repository also contains a script to scrape set data from tftactics.gg.

## Usage

First install dependencies using `yarn`, then:

`yarn traits <JSON set file> <optional: slots> <optional: inferred champs, separated by commas> <optional: limit>`
