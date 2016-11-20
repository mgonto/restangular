#Issues

## Opening an Issue

To open an issue, please keep in mind a few important things. First, take a look at the README docs and make sure that your question isn't already answered in the documentation. In particular, review [the configuration methods](https://github.com/mgonto/restangular#configuring-restangular) and [methods description](https://github.com/mgonto/restangular#methods-description). Then make sure you search the issues list to see if there's already an issue open that solves your problem. Then, once you've determined that your issue isn't a duplicate, here a couple guidelines to opening an issue that will be addressed easily and quickly:

- Please make sure your issue is written in a clear and succint manner, so that all the details of your issue are easy to understand and fully explained. Also, please make sure enclose your code in [fenced blocks](https://help.github.com/articles/creating-and-highlighting-code-blocks/) for readability.
- Make sure your issue includes a live Plunker (fork [this Plunker](http://plnkr.co/edit/26Heuv5F6hUgxpNWNTee?p=info)), and all relevant code samples (as well as information about server responses, if relevant)

# PRs

##Install env

In order to contribute just git clone the repository and then run:

```
git clone git@github.com:mgonto/restangular.git
cd restangular
npm install grunt-cli --global
npm install
```

Be sure to have PhantomJS installed as Karma tests use it. Otherwise, in Mac just run

```
brew install phantomjs
```

All changes must be done in src/restangular.js

##Branching

Please submit a Pull Request or create issues for anything you want :). If your code is super small, nobody will blame
you for doing it from master to master. Otherwise, please try to create a branch `features/[name of your awesome feature]`.

##Testing and styling

Before submitting any PR, you should run `grunt test` to validate your didn't break anything. If you just added a new
feature, please also add tests for it. And when you're done with your code, run `grunt jshint` to check
if you code follow the same simple coding design as the rest of the project.

Thanks!
