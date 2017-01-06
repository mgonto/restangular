<a name="1.6.1"></a>
## 1.6.1 (2017-01-06)

### Bug fixes

* fix(copy) Collections are now copied/cloned properly ([c92b138](https://github.com/mgonto/restangular/commit/c92b138))
* fix(copy) Copying collections now correctly sets route, fromServer and parent on the copy ([7fd668b](https://github.com/mgonto/restangular/commit/7fd668b))
* fix(elementTransformer) matchTransformer now doesn't throw if route is undefined ([fb242ae](https://github.com/mgonto/restangular/commit/fb242ae))

### Docs

* chore(docs): update contribution guidelines ([c49ca45](https://github.com/mgonto/restangular/commit/c49ca45))
* fix(docs): add link to david-dm.org from badge ([2bfb745](https://github.com/mgonto/restangular/commit/2bfb745))
* chore(docs) Add new example production site ([2596035](https://github.com/mgonto/restangular/commit/2596035))
* chore(docs) Add note about pull requests and github preview tab ([6883075](https://github.com/mgonto/restangular/commit/6883075))
* chore(docs) Apply automatic formatting to code and spec ([bc16122](https://github.com/mgonto/restangular/commit/bc16122))
* chore(docs) Reformat changelog, add unreleased section ([8bfa685](https://github.com/mgonto/restangular/commit/8bfa685))
* chore(docs) Update issue guidelines to include StackOverflow as source for solutions to problems ([34b0e9a](https://github.com/mgonto/restangular/commit/34b0e9a))
* chore(docs) Update link to demo Plunker, rephrase ([7c30615](https://github.com/mgonto/restangular/commit/7c30615))
* chore(test) fix jshint errors in spec file ([1a988cb](https://github.com/mgonto/restangular/commit/1a988cb))
* feat(docs) Add FAQ about cancelling request ([8552c51](https://github.com/mgonto/restangular/commit/8552c51)), closes [#926](https://github.com/mgonto/restangular/issues/926) [#1145](https://github.com/mgonto/restangular/issues/1145) [#1377](https://github.com/mgonto/restangular/issues/1377) [#1391](https://github.com/mgonto/restangular/issues/1391)

### Other

* chore(changelog): upgrade package and config ([58caacd](https://github.com/mgonto/restangular/commit/58caacd))
* chore(dependencies): Update lodash version to ~4.17.0 as in unit tests ([e0b68a0](https://github.com/mgonto/restangular/commit/e0b68a0))
* chore(deps): upgrade dev dependencies, fix tests (#1450) ([b583197](https://github.com/mgonto/restangular/commit/b583197)), closes [#1450](https://github.com/mgonto/restangular/issues/1450)
* chore(travis): change travis script and include coveralls ([ca9856a](https://github.com/mgonto/restangular/commit/ca9856a))
* test(coverage): add coverage and coveralls.io integration ([fdd5de6](https://github.com/mgonto/restangular/commit/fdd5de6))
* Update dist files ([7c245a2](https://github.com/mgonto/restangular/commit/7c245a2))

<a name="1.6.0"></a>
## 1.6.0 (2016-12-25)

* Url now supports unescaped suffix (0350bcd)
* Added Restangular Plunkr example (c4ef002)
* Now id can be a nested property (a94228b)
* Add withHttpConfig to objects created with .service (e8f7295)
* Add support for angularjs dependency injection using commonjs require syntax (f02db83)
* Fix missing 'get' in decoupled service (8096ce1)
* Avoid restangularizing an undefined element in restangularizeCollecti onAndElements. (0f8b562)
* Fixes #1167: Extend condition to treat '0, which as a falsy value currently fails, as a valid ID (95ea231)
* Add customPatch method (01297fe)
* Added UMD snippet (caab5e6)
* Support BaseUrl with athority without schema (5f3eacb)
* Add ability to restangularize a collection with fromServer set (51066ec)
* Add configuration option to use plain() by default (94ffaf0)
* Fix fromServer param while copying (b53f4b6)
* Rename CONTRIBUTE.md to CONTRIBUTING.md in accordance with GitHub's spec (c17df47)
* Remove moot `version` property from bower.json (1a585f3)
* Add more realistic POST response for accounts, with id (#943) (11fb475)
* Added context/explanation of when to use JSONP. (fec9b27)
* Add regexp matching for route to element transformers (#1430) (de8f561)

<a name="1.5.2"></a>
## 1.5.2 (2016-02-15)

* Change \_.contains to \_.includes for compatability with lodash >= 4.0

<a name="1.5.1"></a>
## 1.5.1 (2015-04-03)

* Release 1.5.0
* Updated zip
* Merge branch 'master' of github.com:mgonto/restangular
* Merge pull request #1081 from rajeshwarpatlolla/develop
* Merge pull request #1079 from wching/master
* change in README file
* url modified for 'Chain methods together to easily build complex requests'
* Update README.md
* Update README.md

<a name="1.5.0"></a>
## 1.5.0 (2015-04-03)

* Tons of bug fixes
* Upgraded Lodash to 1.3.0
