# Issues

Read the [issue guidlines](.github/ISSUE_TEMPLATE.md) before opening an issue!

# How to submit PRs

## Install env

In order to contribute just create your own [fork](https://help.github.com/articles/fork-a-repo/)
of the repository and then run:

```
git clone git@github.com:<your_username>/restangular.git
cd restangular
npm install grunt-cli --global
npm install
```

## Create a branch

Create a branch for your code changes

`git checkout -b my_awesome_fix`

## Write tests

When making changes to the code, please always **write a test case** for
your topic before making the change. Watch the test fail, then
implement the change and watch the test succeed.

Tests are run with `grunt test`.

## Keep the style

When you're done with your code, run `grunt jshint` to check
if you code follow the same simple coding design as the rest of the project.
Consider integrating `jshint` in your editor to get real time feedback on your
style as you're coding.

## Commit message format

Please write your commit messages in the [angular conventional changelog](https://github.com/conventional-changelog/conventional-changelog-angular/blob/master/convention.md) format. This will help
us to keep a decent [CHANGELOG](CHANGELOG.md) with minimum effort. Check previous commit
messages for examples.

## Update docs

If your code change includes new features, please include an update to the [README.md](README.md)
explaining your feature.

**Don't**, however, generate distribution files (the files in [dist](dist)). This will be done
on a regular basis by maintainers as PRs are merged.

## Squash commits

Please consider squasing the commits in your topic branch into a single commit including
all changes needed. This will make the PR cleaner and the change history more easy to follow
after the PR has been merged. Also, the CHANGELOG will make more sense.

Look [here](https://ariejan.net/2011/07/05/git-squash-your-latests-commits-into-one/) and
[here](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History#Squashing-Commits) for how to.

## Sumbit the PR

Now you're ready to [open a PR](https://help.github.com/articles/creating-a-pull-request-from-a-fork/).

Thanks!
