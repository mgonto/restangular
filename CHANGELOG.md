# Releases Notes

## 0.4.5
* Fixed but that didn't let ID to be 0.
* Added different Collection methods and Element methods
* Added posibility po do a post in a collection to post an element to itself
* Added Travis CI for build
* Fixed bug with parentResource after a post of a new element
* When doing a post, if no element is returned, we enhance the object received as a parameter

## 0.3.4
* Added new HTTP methods to use: Patch, Head, Trace and Options (thanks @pauldijou)
* Added tests with Karma for all functionality.

## 0.3.3
* Restangular fields can now be configured. You can set the id, route and parentResource fields. They're not hardcoded anymore

## 0.3.2
* Added ResponseExtractor for when the real data is wrapped in an envelope in the WebServer response.

## 0.3.1

* Now all methods accept Headers. You can query `account.getList('buildings', {query: 'param'}, {'header': 'mine'})`

## 0.2.1

* Added query params to all methods. getList, post, put, get and delete accept query params now.

## 0.2.0
* Added post method to all elements. Now you can also create new elements by calling `account.post('buildings', {name: "gonto"})`. 

## 0.1.1
* Changed `elem.delete()` to `elem.remove()` due to errors with Closure Compiler in Play 2 
