# 0.6.5
* Added `Restangular.copy` for copying objects

# 0.6.4
* added methodOverriders to override any HTTP Method
* Added requestInterceptor

# 0.6.3
* Added `defaultHttpFields` configuration property

# 0.6.2
* URL suffix is unescaped now

# 0.6.1
* Elements are striped from Restangular fields before being sent to the server

# 0.6.0
* Fixed bug when adding metadata to response in ResopnseExtractor. It wasn't being added
* Added enhanced promises. [Check the section in README](https://github.com/mgonto/restangular/blob/master/README.md#enhanced-promises).

# 0.5.5
* Changed by default from Underscore to Lodash. They both can be used anyway. (thanks @pauldijou)
* Added tests for both Underscore and Lodash to check it's working. (thanks @pauldijou)

# 0.5.4
* Added onElemRestangularized hook
* Added posibility to add your own Restangular methods

# 0.5.3
* Added the posibility to do URL Building and RequestLess tree navigations
* Added alias to `do[method]`. For example, Now you can do `customPOST` as well as `doPOST`

# 0.5.2
* responseExtractor renamed to responseInterceptor. Added alias from responseExtractor to responseInterceptor to mantain backwards compatibility
* responseExtractor now receives 4 parameters. Response, operation, what (path of current element) and URL
* Error function for any Restangular action now receives a response to get StatusCode and other interesting stuff

# 0.5.1
* Added listTypeIsArray property to set getList as not an array.

# 0.5.0
* Added `requestSuffix`configuration for requests ending en .json
* `what` field is now configurable and not hardcoded anymore
* All instance variables from `RestangularProvider` are now local variables to reduce visibility
* Fully functional version with all desired features

# 0.4.6
* Added Custom methods to all Restangular objects. Check it out in the README

# 0.4.5
* Fixed but that didn't let ID to be 0.
* Added different Collection methods and Element methods
* Added posibility po do a post in a collection to post an element to itself
* Added Travis CI for build
* Fixed bug with parentResource after a post of a new element
* When doing a post, if no element is returned, we enhance the object received as a parameter

# 0.3.4
* Added new HTTP methods to use: Patch, Head, Trace and Options (thanks @pauldijou)
* Added tests with Karma for all functionality.

# 0.3.3
* Restangular fields can now be configured. You can set the id, route and parentResource fields. They're not hardcoded anymore

# 0.3.2
* Added ResponseExtractor for when the real data is wrapped in an envelope in the WebServer response.

# 0.3.1

* Now all methods accept Headers. You can query `account.getList('buildings', {query: 'param'}, {'header': 'mine'})`

# 0.2.1

* Added query params to all methods. getList, post, put, get and delete accept query params now.

# 0.2.0
* Added post method to all elements. Now you can also create new elements by calling `account.post('buildings', {name: "gonto"})`. 

# 0.1.1
* Changed `elem.delete()` to `elem.remove()` due to errors with Closure Compiler in Play 2 
