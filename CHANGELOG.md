# 1.6.0 (2016-12-25)

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


1.5.2 / 2016-02-15
==================

* Change \_.contains to \_.includes for compatability with lodash >= 4.0

1.5.1 / 2015-04-03
==================

* Release 1.5.0
* Updated zip
* Merge branch 'master' of github.com:mgonto/restangular
* Merge pull request #1081 from rajeshwarpatlolla/develop
* Merge pull request #1079 from wching/master
* change in README file
* url modified for 'Chain methods together to easily build complex requests'
* Update README.md
* Update README.md

1.5.0 / 2015-04-03
==================
* Tons of bug fixes
* Upgraded Lodash to 1.3.0
