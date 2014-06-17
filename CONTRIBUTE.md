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

Before submiting any PR, you should run `grunt test` to validate your didn't break anything. If you just added a new
feature, please consider also adding tests for it. And when you're done with your code, run `grunt jshint` to check
if you code follow the same simple coding design as the rest of the project.

Thanks!
