#Restangular

[![Build Status](https://travis-ci.org/mgonto/restangular.png)](https://travis-ci.org/mgonto/restangular)
<a href="https://twitter.com/intent/tweet?hashtags=&original_referer=http%3A%2F%2Fgithub.com%2F&text=Check+out+Restangular%2C+a+service+for+%23AngularJS+that+makes+it+easy+to+use+Res+APIs&tw_p=tweetbutton&url=https%3A%2F%2Fgithub.com%2Fmgonto%2Frestangular" target="_blank">
  <img src="http://jpillora.com/github-twitter-button/img/tweet.png"></img>
</a>

Restangular is an AngularJS service that will help you get, delete and update Restful Resources with very few lines in the Client side. 
This service is a perfect fit for any WebApp that uses Restful Resources as the API for your application.

**If you want to check a live example, [please click this link to plunkr](http://plnkr.co/edit/d6yDka?p=preview).** It's the same example as [Angular's Javascript Projects](http://angularjs.org/#wire-up-a-backend) but Restangularized.

#Table of contents

- [Restangular](#restangular)
- [Table of contents](#table-of-contents)
	- [Differences with $resource](#differences-with-resource)
- [How do I add this to my project?](#how-do-i-add-this-to-my-project)
- [Dependencies](#dependencies)
- [Starter Guide](#starter-guide)
	- [Quick configuration for Lazy Readers](#quick-configuration-for-lazy-readers)
	- [Adding dependency to Restangular module in your app](#adding-dependency-to-restangular-module-in-your-app)
	- [Using Restangular](#using-restangular)
		- [Creating Main Restangular object](#creating-main-restangular-object)
		- [Let's code!](#lets-code)
	- [Configuring Restangular](#configuring-restangular)
		- [Properties](#properties)
			- [setBaseUrl](#setbaseurl)
			- [setExtraFields](#setextrafields)
			- [setParentless](#setparentless)
			- [setDefaultHttpFields](#setdefaulthttpfields)
			- [addElementTransformer](#addelementtransformer)
			- [setOnElemRestangularized](#setonelemrestangularized)
			- [setResponseInterceptor (or setResponseExtractor. It's an Alias)](#setresponseinterceptor-or-setresponseextractor-its-an-alias)
			- [setRequestInterceptor](#setrequestinterceptor)
			- [setFullRequestInterceptor](#setfullrequestinterceptor)
			- [setErrorInterceptor](#seterrorinterceptor)
			- [setRestangularFields](#setrestangularfields)
			- [setMethodOverriders](#setmethodoverriders)
			- [setDefaultRequestParams](#setdefaultrequestparams)
			- [setFullResponse](#setfullresponse)
			- [setDefaultHeaders](#setdefaultheaders)
			- [setRequestSuffix](#setrequestsuffix)
			- [setUseCannonicalId](#setusecannonicalid)
		- [How to configure them globally](#how-to-configure-them-globally)
			- [Configuring in the config](#configuring-in-the-config)
			- [Configuring in the run](#configuring-in-the-run)
		- [How to create a Restangular service with a different configuration from the global one](#how-to-create-a-restangular-service-with-a-different-configuration-from-the-global-one)
	- [Methods description](#methods-description)
		- [Restangular methods](#restangular-methods)
		- [Element methods](#element-methods)
		- [Collection methods](#collection-methods)
		- [Custom methods](#custom-methods)
	- [Copying elements](#copying-elements)
	- [Enhanced promises](#enhanced-promises)
	- [Using Self reference resources](#using-self-reference-resources)
	- [URL Building](#url-building)
	- [Creating new Restangular Methods](#creating-new-restangular-methods)
	- [Adding Custom Methods to Collections](#adding-custom-methods-to-collections)
		- [Example:](#example)
	- [Adding Custom Methods to Models](#adding-custom-methods-to-models)
		- [Example:](#example-1)
- [FAQ](#faq)
			- [How can I handle errors?](#how-can-i-handle-errors)
			- [I need to send one header in EVERY Restangular request, how do I do this?](#i-need-to-send-one-header-in-every-restangular-request-how-do-i-do-this)
			- [Can I cache requests?](#can-i-cache-requests)
			- [Can it be used in $routeProvider.resolve?](#can-it-be-used-in-routeproviderresolve)
			- [My response is actually wrapped with some metadata. How do I get the data in that case?](#my-response-is-actually-wrapped-with-some-metadata-how-do-i-get-the-data-in-that-case)
			- [I use Mongo and the ID of the elements is _id not id as the default. Therefore requests are sent to undefined routes](#i-use-mongo-and-the-id-of-the-elements-is-_id-not-id-as-the-default-therefore-requests-are-sent-to-undefined-routes)
			- [How do I handle CRUD operations in a List returned by Restangular?](#how-do-i-handle-crud-operations-in-a-list-returned-by-restangular)
			- [When I set baseUrl with a port, it's stripped out.](#when-i-set-baseurl-with-a-port-its-stripped-out)
			- [How can I access the unrestangularized element as well as the restangularized one?](#how-can-i-access-the-unrestangularized-element-as-well-as-the-restangularized-one)
			- [Why does this depend on Lodash / Underscore?](#why-does-this-depend-on-lodash--underscore)
- [Supported Angular versions](#supported-angular-versions)
- [Server Frameworks](#server-frameworks)
- [Releases Notes](#releases-notes)
- [License](#license)

## Differences with $resource

Restangular has several features that distinguish it from $resource:

* **It uses [promises](http://docs.angularjs.org/api/ng.$q)**. Instead of doing the "magic" filling of objects like $resource, it uses promises.
* **You can use this in $routeProvider.resolve**. As Restangular returns promises, you can return any of the methods in the `$routeProvider.resolve` and you'll get the real object injected into your controller if you want.
* **It doesn't have all those `$resource` bugs**. Restangular doesn't have problem with trailling slashes, additional `:` in the URL, escaping information, expecting only arrays for getting lists, etc.
* **It supports all HTTP methods**.
* **It supports ETag out of the box**. You don't have to do anything. ETags and If-None-Match will be used in all of your requests
* *It supports self linking elements** If you receive from the server some item that has a link to itself, you can use that to query the server instead of writing the URL manually.
* **You don't have to create one $resource object per request**. Each time you want to do a request, you can just do it using the object that was returned by Restangular. You don't need to create a new object for this.
* **You don't have to write or remember ANY URL**. With $resource, you need to write the URL Template. In here, you don't write any urls. You just write the name of the resource you want to fetch and that's it.
* **It supports nested RestFUL resources**. If you have Nested RestFUL resources, Restangular can handle them for you. You don't have to know the URL, the path, or anything to do all of the HTTP operations you want.
* **Restangular lets you create your own methods**. You can create your own methods to run the operation that you want. The sky is the limit.
* **Support for wrapped responses**. If your response for a list of element actually returns an object with some property inside which has the list, it's very hard to use $resource. Restangular knows that and it makes it easy on you. Check out https://github.com/mgonto/restangular#my-response-is-actually-wrapped-with-some-metadata-how-do-i-get-the-data-in-that-case
* **You can build your own URLs with Restangular objects easily**. Restangular lets you create a Restangular object for any url you want with a really nice builder.

Let's see a quick and short example of these features
````javascript
// It uses promises.
Restangular.one('users').getList().then(function(users) {
  $scope.user = users[0];
})

// Later in the code.

// Requests /users/123/cars You don't have to know the URL. Just the name of the resource
// This is a promise
$scope.cars = $scope.user.getList('cars');

// POST /users/123/sendMessage You've created your own method with the path & operation that you wanted
$scope.user.sendMessage();

// URL Building
// GET to /user/123/messages/123/from/123/unread
$scope.user.one('messages', 123).one('from', 123).getList('unread')


````

#How do I add this to my project?

You can download this by:

* Using bower and running `bower install restangular`
* Using npm and running `npm install restangular`
* Downloading it manually by clicking [here to download development unminified version](https://raw.github.com/mgonto/restangular/master/dist/restangular.js) or [here to download minified production version](https://raw.github.com/mgonto/restangular/master/dist/restangular.min.js)
* Using [JsDelivr CDN files](https://github.com/jimaek/jsdelivr/tree/master/files/restangular):

````html
<!-- Use LATEST folder to always get the latest version-->
<script type="text/javascript" src="http://cdn.jsdelivr.net/restangular/latest/restangular.js"></script>
<script type="text/javascript" src="http://cdn.jsdelivr.net/restangular/latest/restangular.min.js"></script>

<!-- Or use TAG number for specific version -->
<script type="text/javascript" src="http://cdn.jsdelivr.net/restangular/0.6.1/restangular.js"></script>
<script type="text/javascript" src="http://cdn.jsdelivr.net/restangular/0.6.1/restangular.min.js"></script>
````


#Dependencies

Restangular depends on Angular and (Underscore or Lodash). **angular-resource is no longer needed since version 1.0.6, now this uses `$http` instead of `$resource`**

#Starter Guide

## Quick configuration for Lazy Readers
This is the quick configuration to bootstrap all. Read the rest of the documentation for further configuration and understanding

````javascript
angular.module('sample-app', ['restangular'])
  .config(function(RestangularProvider) {
    RestangularProvider.setBaseUrl("/api/v1");
  });
  
angular.module('sample-app').controller('MainCtrl', function($scope, Restangular) {
  $scope.projects = Restangular.all('projects').getList();
});
````

## Adding dependency to Restangular module in your app

The first thing you need to do after adding the link to your script file, is mentioning in your app that you'll use Restangular.

````javascript
var app = angular.module('angularjs-starter', ['restangular']);
````

## Using Restangular

Now that you have everything configured, you can just inject this Service to any Controller or Directive like any other :)

### Creating Main Restangular object

There are 2 ways of creating a main Restangular object. 
The first one and most common one is by stating the main route of all requests. 
The second one is by stating the main route and object of all requests.

````javascript
// Only stating main route
Restangular.all('accounts')

// Stating main object
Restangular.one('accounts', 1234)
````

### Let's code!

Now that we have our main Object let's start playing with it.

````javascript
// First way of creating a Restangular object. Just saying the base URL
var baseAccounts = Restangular.all('accounts');

// This will query /accounts and return a promise. As Angular supports setting promises to scope variables
// as soon as we get the information from the server, it will be shown in our template :)
$scope.allAccounts = baseAccounts.getList();

var newAccount = {name: "Gonto's account"};

// POST /accounts
baseAccounts.post(newAccount);

// GET to http://www.google.com/ You set the URL in this case
Restangular.allUrl('googlers', 'http://www.google.com/').getList();

// GET to http://www.google.com/1 You set the URL in this case
Restangular.oneUrl('googlers', 'http://www.google.com/1').get();

// You can do RequestLess "connections" if you need as well

// Just ONE GET to /accounts/123/buildings/456
Restangular.one('accounts', 123).one('buildings', 456).get()

// Just ONE GET to /accounts/123/buildings
Restangular.one('accounts', 123).getList('buildings')

// Here we use Promises then 
// GET /accounts
baseAccounts.getList().then(function (accounts) {
  // Here we can continue fetching the tree :).

  var firstAccount = accounts[0];
  // This will query /accounts/123/buildings considering 123 is the id of the firstAccount
  $scope.buildings = firstAccount.getList("buildings");
  
  // GET /accounts/123/places?query=param with request header: x-user:mgonto
  $scope.loggedInPlaces = firstAccount.getList("places", {query: param}, {'x-user': 'mgonto'})

  // This is a regular JS object, we can change anything we want :) 
  firstAccount.name = "Gonto"
  
  // If we wanted to keep the original as it is, we can copy it to a new element
  var editFirstAccount = Restangular.copy(firstAccount);
  editFirstAccount.name = "New Name";
  

  // PUT /accounts/123. The name of this account will be changed from now on
  firstAccount.put();
  editFirstAccount.put();

  // DELETE /accounts/123 We don't have first account anymore :(
  firstAccount.remove();
  
  var myBuilding = {
    name: "Gonto's Building",
    place: "Argentina"
  };
  
  // POST /accounts/123/buildings with MyBuilding information
  firstAccount.post("Buildings", myBuilding).then(function() {
    console.log("Object saved OK");
  }, function() {
    console.log("There was an error saving");
  });

  // GET /accounts/123/users?query=params
  firstAccount.getList("users", {query: params}).then(function(users) {
    // Instead of posting nested element, a collection can post to itself
    // POST /accounts/123/users
    users.post({userName: 'unknown'});
    
    // Custom methods are available now :).
    // GET /accounts/123/users/messages?param=myParam
    users.customGET("messages", {param: "myParam"})
    
    var firstUser = users[0];

    // GET /accounts/123/users/456. Just in case we want to update one user :)
    $scope.userFromServer = firstUser.get();
    
    // ALL http methods are available :)
    // HEAD /accounts/123/users/456
    firstUser.head()

  });

}, function errorCallback() {
  alert("Oops error from server :(");
})

// Second way of creating Restangular object. URL and ID :)
var account = Restangular.one("accounts", 123);

// GET /accounts/123?single=true
$scope.account = account.get({single: true});

// POST /accounts/123/messages?param=myParam with the body of name: "My Message"
account.customPOST("messages", {param: "myParam"}, {}, {name: "My Message"})


````

## Configuring Restangular

### Properties
Restangular comes with defaults for all of its properties but you can configure them. **So, if you don't need to configure something, there's no need to add the configuration.**
You can set all these configurations in **`RestangularProvider` or `Restangular` service to change the global configuration** or you can **use the withConfig method in Restangular service to create a new Restangular service with some scoped configuration**. Check the section on this later.

#### setBaseUrl
The base URL for all calls to your API. For example if your URL for fetching accounts is http://example.com/api/v1/accounts, then your baseUrl is `/api/v1`. The default baseUrl is an empty string which resolves to the same url that AngularJS is running, so you can also set an absolute url like `http://api.example.com/api/v1` if you need do set another domain.

#### setExtraFields
This are the fields that you want to save from your parent resources if you need to display them. By default this is an Empty Array which will suit most cases

#### setParentless
Use this property to control whether Restangularized elements to have a parent or not. So, for example if you get an account and then get a nested list of buildings, you may want the buildings URL to be simple `/buildings/123` instead of `/accounts/123/buildings/123`. This property lets you do that.

This method accepts 2 parameters:

* Boolean: Specifies if all elements should be parentless or not
* Array: Specifies the routes (types) of all elements that should be parentless. For example `['buildings']`

#### setDefaultHttpFields
`$http` from AngularJS can receive a bunch of parameters like `cache`, `transformRequest` and so on. You can set all of those properties in the object sent on this setter so that they will be used in EVERY API call made by Restangular. This is very useful for caching for example. All properties that can be set can be checked here: http://docs.angularjs.org/api/ng.$http#Parameters

#### addElementTransformer
This is a hook. After each element has been "restangularized" (Added the new methods from Restangular), the corresponding transformer will be called if it fits. 

This should be used to add your own methods / functions to entities of certain types.

You can add as many element transformers as you want. The signature of this method can be one of the following:

* **addElementTransformer(route, transformer)**: Transformer is called with all elements that have been restangularized, no matter if they're collections or not.

* **addElementTransformer(route, isCollection, transformer)**: Transformer is called with all elements that have been restangularized and match the specification regarding if it's a collection or not (true | false)


#### setOnElemRestangularized
This is a hook. After each element has been "restangularized" (Added the new methods from Restangular), this will be called. It means that if you receive a list of objects in one call, this method will be called first for the collection and then for each element of the collection.

**I favor the usage of `addElementTransformer` instead of `onElemRestangularized` whenever possible as the implementation is much cleaner.**


This callback is a function that has 3 parameters:

* **elem**: The element that has just been restangularized. Can be a collection or a single element.
* **isCollection**: Boolean indicating if this is a collection or a single element.
* **what**: The model that is being modified. This is the "path" of this resource. For example `buildings`
* **Restangular**: The instanced service to use any of its methods
 
This can be used together with `addRestangularMethod` (Explained later) to add custom methods to an element


#### setResponseInterceptor (or setResponseExtractor. It's an Alias)
The responseInterceptor is called after we get each response from the server. It's a function that receives this arguments:

* **data**: The data received got from the server
* **operation**: The operation made. It'll be the HTTP method used except for a `GET` which returns a list of element which will return `getList` so that you can distinguish them.
* **what**: The model that's being requested. It can be for example: `accounts`, `buildings`, etc.
* **url**: The relative URL being requested. For example: `/api/v1/accounts/123`
* **response**: Full server response including headers
* **deferred**: The deferred promise for the request.

Some of the use cases of the responseInterceptor are handling wrapped responses and enhancing response elements with more methods among others.

The responseInterceptor must return the restangularized data element.

#### setRequestInterceptor
The requestInterceptor is called before sending any data to the server. It's a function that must return the element to be requested. This function receives the following arguments:

* **element**: The element to send to the server.
* **operation**: The operation made. It'll be the HTTP method used except for a `GET` which returns a list of element which will return `getList` so that you can distinguish them.
* **what**: The model that's being requested. It can be for example: `accounts`, `buildings`, etc.
* **url**: The relative URL being requested. For example: `/api/v1/accounts/123`

#### setFullRequestInterceptor
The fullRequestInterceptor is similar to the `requestInterceptor` but more powerful. It lets you change the element, the request parameters and the headers as well.

It's a function that receives the same as the `requestInterceptor` plus the headers and the query parameters (in that order).

It must return an object with the following properties:
* **headers**: The headers to send
* **params**: The request parameters to send
* **element**: The element to send

#### setErrorInterceptor
The errorInterceptor is called whenever there's an error. It's a function that receives the response as a parameter.

The errorInterceptor function, whenever it returns `false`, prevents the promise linked to a Restangular request to be executed.
All other return values (besides `false`) are ignored and the promise follows the usual path, eventually reaching the success or error hooks.

The feature to prevent the promise to complete is usefull whenever you need to intercept each Restangular error response for every request in your AngularJS application in a single place, increasing debugging capabilities and hooking security features in a single place.

#### setRestangularFields

Restangular required 3 fields for every "Restangularized" element. This are:

* id: Id of the element. Default: id
* route: Name of the route of this element. Default: route
* parentResource: The reference to the parent resource. Default: parentResource
* restangularCollection: A boolean indicating if this is a collection or an element. Default: restangularCollection
* cannonicalId: If available, the path to the cannonical ID to use. Usefull for PK changes
* etag: Where to save the ETag received from the server. Defaults to `restangularEtag`
* selfLink: The path to the property that has the URL to this item. If your REST API doesn't return a URL to an item, you can just leave it blank. Defaults to `href`

All of these fields except for `id` and `selfLink` are handled by Restangular, so most of the time you won't change them. You can configure the name of the property that will be binded to all of this fields by setting restangularFields property.

#### setMethodOverriders

You can now Override HTTP Methods. You can set here the array of methods to override. All those methods will be sent as POST and Restangular will add an X-HTTP-Method-Override header with the real HTTP method we wanted to do.

#### setDefaultRequestParams

You can set default Query parameters to be sent with every request and every method.

Additionally, if you want to configure request params per method, you can use `requestParams` configuration similar to `$http`. For example `RestangularProvider.requestParams.get = {single: true}`.

Supported method to configure are: remove, get, post, put, common (all)

#### setFullResponse

You can set fullResponse to true to get the whole response every time you do any request. The full response has the restangularized data in the `data` field, and also has the headers and config sent. By default, it's set to false.

#### setDefaultHeaders

You can set default Headers to be sent with every request.

#### setRequestSuffix

If all of your requests require to send some suffix to work, you can set it here. For example, if you need to send the format like `/users/123.json` you can add that `.json` to the suffix using the `setRequestSuffix` method

#### setUseCannonicalId

You can set this to either `true` or `false`. By default it's false. If set to true, then the cannonical ID from the element will be used for URL creation (in DELETE, PUT, POST, etc.). What this means is that if you change the ID of the element and then you do a put, if you set this to true, it'll use the "old" ID which was received from the server. If set to false, it'll use the new ID assigned to the element.

### How to configure them globally

You can configure this in either the `config` or the `run` method. If your configurations don't need any other services, then I'd recommend you do them in the `config`. If your configurations depend on other services, you can configure them in the `run` using `Restangular` instead of `RestangularProvider` 

#### Configuring in the `config`
````javascript
app.config(function(RestangularProvider) {
    RestangularProvider.setBaseUrl('/api/v1');
    RestangularProvider.setExtraFields(['name']);
    RestangularProvider.setResponseExtractor(function(response, operation) {
        return response.data;
    });
    
    RestangularProvider.addElementTransformer('accounts', false, function(element) {
       element.accountName = 'Changed';
       return element;
    });
    
    RestangularProvider.setDefaultHttpFields({cache: true});
    RestangularProvider.setMethodOverriders(["put", "patch"]);
    
    // In this case we are mapping the id of each element to the _id field.
    // We also change the Restangular route. 
    // The default value for parentResource remains the same.
    RestangularProvider.setRestangularFields({
      id: "_id",
      route: "restangularRoute",
      selfLink: "self.href"
    });
    
    RestangularProvider.setRequestSuffix('.json');
    
    // Use Request interceptor
    RestangularProvider.setRequestInterceptor(function(element, operation, route, url) {
      delete element.name;
      return element;
    });
    
    // ..or use the full request interceptor, setRequestInterceptor's more powerful brother!
    RestangularProvider.setFullRequestInterceptor(function(element, operation, route, url, headers, params) {
      delete element.name;      
      return {
        element: element,
        params: _.extend(params, {single: true}),
        headers: headers
      };
    });
    
});

````

#### Configuring in the `run`

````javascript
// Here I inject the service BaseUrlCalculator which I need
app.run(function(Restangular, BaseUrlCalculator) {
    Restangular.setBaseUrl(BaseUrlCalculator.calculate());
});
````

### How to create a Restangular service with a different configuration from the global one
Let's assume that for most requests you need some configuration (The global one), and for just a bunch of methods you need another configuration. In that case, you'll need to create another Restangular service with this particular configuration. This scoped configuration will inherit all defaults from the global one. Let's see how.

````javascript
// Global configuration
app.config(function(RestangularProvider) {
  RestangularProvider.setBaseUrl('http://www.google.com');
  RestangularProvider.setRequestSuffix('.json');
});

// Restangular service that uses Bing
app.factory('BingRestangular', function(Restangular) {
  return Restangular.withConfig(function(RestangularConfigurer) {
    RestangularConfigurer.setBaseUrl('http://www.bing.com');
  });
});

// Let's use them from a controller
app.controller('MainCtrl', function(Restangular, BingRestangular) {
  
  // GET to http://www.google.com/users.json
  // Uses global configuration
  Restangular.all('users').getList()
  
  // GET to http://www.bing.com/users.json
  // Uses Bing configuration which is based on Global one, therefore .json is added.
  BingRestangular.all('users').getList()
});
````

## Methods description

There are 3 sets of methods. Collections have some methods and elements have others. There are are also some common methods for all of them

### Restangular methods
This are the methods that can be called in the Restangular object.
* **one(route, id)**: This will create a new Restangular object that is just a pointer to one element with the route `route` and the specified id.
* **all(route)**: This will create a new Restangular object that is just a pointer to a list of elements for the specified path.
* **oneUrl(route, url)**: This will create a new Restangular object that is just a pointer to one element with the specified URL.
* **allUrl(route, url)**: This creates a Restangular object that is just a pointer to a list at the specified URL.
* **copy(fromElement)**: This will create a copy of the from element so that we can modified the copied one.
* **restangularizeElement(parent, element, route)**: Restangularizes a new element
* **restangularizeCollection(parent, element, route)**: Restangularizes a new collection

### Element methods
* **get([queryParams, headers])**: Gets the element. Query params and headers are optionals
* **getList(subElement, [queryParams, headers])**: Gets a nested resource. subElement is mandatory. **It's a string with the name of the nested resource (and URL)**. For example `buildings`
* **put([queryParams, headers])**: Does a put to the current element
* **post(subElement, elementToPost, [queryParams, headers])**: Does a POST and creates a subElement. Subelement is mandatory and is the nested resource. Element to post is the object to post to the server
* **remove([queryParams, headers])**: Does a DELETE
* **head([queryParams, headers])**: Does a HEAD
* **trace([queryParams, headers])**: Does a TRACE
* **options([queryParams, headers])**: Does a OPTIONS
* **patch([queryParams, headers])**: Does a PATCH
* **one(route, id)**: Used for RequestLess connections and URL Building. See section below.
* **all(route)**: Used for RequestLess connections and URL Building. See section below.
* **oneUrl(route, url)**: This will create a new Restangular object that is just a pointer to one element with the specified URL.
* **allUrl(route, url)**: This creates a Restangular object that is just a pointer to a list at the specified URL.
* **getRestangularUrl()**: Gets the URL of the current object.

### Collection methods
* **getList([queryParams, headers]): Gets itself again (Remember this is a collection)**.
* **post(elementToPost, [queryParams, headers])**: Creates a new element of this collection.
* **head([queryParams, headers])**: Does a HEAD
* **trace: ([queryParams, headers])**: Does a TRACE
* **options: ([queryParams, headers])**: Does a OPTIONS
* **patch([queryParams, headers])**: Does a PATCH
* **putElement(idx, params, headers)**: Puts the element on the required index and returns a promise of the updated new array
* **getRestangularUrl()**: Gets the URL of the current object.
* **one(route, id)**: Used for RequestLess connections and URL Building. See section below.
* **all(route)**: Used for RequestLess connections and URL Building. See section below.
* **oneUrl(route, url)**: This will create a new Restangular object that is just a pointer to one element with the specified URL.
* **allUrl(route, url)**: This creates a Restangular object that is just a pointer to a list at the specified URL.


### Custom methods
* **customGET(path, [params, headers])**: Does a GET to the specific path. Optionally you can set params and headers.
* **customGETLIST(path, [params, headers])**: Does a GET to the specific path. **In this case, you expect to get an array, not a single element**. Optionally you can set params and headers.
* **customDELETE(path, [params, headers])**: Does a DELETE to the specific path. Optionally you can set params and headers.
* **customPOST([elem, path, params, headers])**: Does a POST to the specific path. Optionally you can set params and headers and elem. Elem is the element to post. If it's not set, it's assumed that it's the element itself from which you're calling this function.
* **customPUT([elem, path, params, headers])**: Does a PUT to the specific path. Optionally you can set params and headers and elem. Elem is the element to post. If it's not set, it's assumed that it's the element itself from which you're calling this function.
* **customOperation(operation, path, [params, headers, elem])**: This does a custom operation to the path that we specify. This method is actually used from all the others in this subsection. Operation can be one of: get, post, put, delete, head, options, patch, trace
* **addRestangularMethod(name, operation, [path, params, headers, elem])**: This will add a new restangular method to this object with the name `name` to the operation and path specified (or current path otherwise). There's a section on how to do this later. 

 
Let's see an example of this:

````javascript
// GET /accounts/123/messages
Restangular.one("accounts", 123).customGET("messages")

// GET /accounts/messages?param=param2
Restangular.all("accounts").customGET("messages", {param: "param2"})
````
## Copying elements
Before modifying an object, we sometimes want to copy it and then modify the copied object. We can't use `angular.copy` for this because it'll not change the `this` binded in the functions we add to the object. In this cases, you must use `Restangular.copy(fromElement)`.

## Enhanced promises

Restangular uses enhanced promises when returning. What does this mean? All promises returned now have 2 additional methods and collection promises have 3. This are the methods:

* **call(methodName, params*)**: This will return a new promise of the previous value, after calling the method called methodName with the parameters params.
* **get(fieldName)**: This will return a new promise for the type of the field. The param of this new promise is the property `fieldName` from the original promise result.
* **push(object)**: This method will only be in the promises of arrays. It's a subset of the call method that does a push.
 
I know these explanations are quite complicated, so let's see an example :D.

````javascript
var buildings = Restangular.all("buildings").getList();

// New promise after adding the new building
// Now you can show in scope this newBuildings promise and it'll show all the buildings 
// received from server plus the new one added
var newBuildings = buildings.push({name: "gonto"});

var newBuildingsSame = buildings.call("push", {name: "gonto"});

// This is a promise of a number value. You can show it in the UI
var lengthPromise = buildings.get("length");

lengthPromise.then(function(length) {
  // Here the length is the real length value of the returned collection of buildings
});
````

## Using Self reference resources

A lot of REST APIs return the URL to self of the element that you're querying. You can use that with Restangular so that you don't have to create the URLs yourself, but use the ones provided by the server.

Let's say that when doing a GET to `/people` you get the following

````javascript
[{
  name: "Martin",
  lastName: "Gontovnikas"
  self: {
    link: 'http://www.example.com/people/gonto'
  }
}, {
  name: "John",
  lastName: "Wayne"
  self: {
    link: 'http://www.example.com/people/jhonny'
  }
}]
````

In this case, as you can see, the URL to each element can't be guessed so we need to use that to reference the element. Restangular supports both relative and absolute URLs :).

How do we do this with Restangular?

First, we need to configure the path for the link to self. For that, int he config we do:

````javascript
RestangularProvider.setRestangularFields({
  selfLink: 'self.link'
});
````

Then, we can just use this :)

````javascript
// Instead of using all we could also use allUrl to set a URL
// Restangular.allUrl('people', 'http://www.example.com/people')

Restangular.all('people').getList().then(function(people) {

  var gonto = people[0];
  
  gonto.name = "Owned";
  
  // This will do a PUT to http://www.example.com/people/gonto
  // It uses the self linking property :D
  gonto.put()
})
````

## URL Building
Sometimes, we have a lot of nested entities (and their IDs), but we just want the last child. In those cases, doing a request for everything to get the last child is overkill. For those cases, I've added the possibility to create URLs using the same API as creating a new Restangular object. This connections are created without making any requests. Let's see how to do this:

````javascript

var restangularSpaces = Restangular.one("accounts",123).one("buildings", 456).all("spaces");

// This will do ONE get to /accounts/123/buildings/456/spaces
restangularSpaces.getList()

// This will do ONE get to /accounts/123/buildings/456/spaces/789
Restangular.one("accounts", 123).one("buildings", 456).one("spaces", 789).get()

// POST /accounts/123/buildings/456/spaces
Restangular.one("accounts", 123).one("buildings", 456).all("spaces").post({name: "New Space"});

// DELETE /accounts/123/buildings/456
Restangular.one("accounts", 123).one("buildings", 456).remove();
````

## Creating new Restangular Methods

Let's assume that your API needs some custom methods to work. If that's the case, always calling customGET or customPOST for that method with all parameters is a pain in the ass. That's why every element has a `addRestangularMethod` method. 

This can be used together with the hook `addElementTransformer` to do some neat stuff. Let's see an example to learn this:

````javascript
// In your app configuration (config method)

// It will transform all building elements, NOT collections
RestangularProvider.addElementTransformer('buildings', false, function(building) {
        // This will add a method called evaluate that will do a get to path evaluate with NO default
        // query params and with some default header
        // signature is (name, operation, path, params, headers, elementToPost)
        
        building.addRestangularMethod('evaluate', 'get', 'evaluate', undefined, {'myHeader': 'value'});
        
        return building;
});

RestangularProvider.addElementTransformer('users', true, function(user) {
        // This will add a method called login that will do a POST to the path login
        // signature is (name, operation, path, params, headers, elementToPost)
        
        user.addRestangularMethod('login', 'post', 'login');
        
        return user;
});

// Then, later in your code you can do the following:

// GET to /buildings/123/evaluate?myParam=param with headers myHeader: value

// Signature for this "custom created" methods is (params, headers, elem) if it's a safe operation (GET, OPTIONS, etc.)
// If it's an unsafe operation (POST, PUT, etc.), signature is (elem, params, headers).

// If something is set to any of this variables, the default set in the method creation will be overridden
// If nothing is set, then the defaults are sent
Restangular.one('building', 123).evaluate({myParam: 'param'});

// GET to /buildings/123/evaluate?myParam=param with headers myHeader: specialHeaderCase

Restangular.one('building', 123).evaluate({myParam: 'param'}, {'myHeader': 'specialHeaderCase'});

// Here the body of the POST is going to be {key: value} as POST is an unsafe operation
Restangular.all('users').login({key: value});

````

## Adding Custom Methods to Collections

Create custom methods for your collection using Restangular.extendCollection(). This is an alias for:

```
  Restangular.addElementTransformer(route, true, fn)
```

### Example:
```
  // create methods for your collection
  Restangular.extendCollection('accounts', function(collection) {
    collection.totalAmount = function() {
      // implementation here
    };

    return collection;
  });

  var accountsPromise = Restangular.all('accounts').getList();
      
  accountsPromise.then(function(accounts) {
    accounts.totalAmount(); // invoke your custom collection method
  });
```

## Adding Custom Methods to Models

Create custom methods for your models using Restangular.extendModel(). This is an alias for:

```
  Restangular.addElementTransformer(route, false, fn)
```

### Example:
```
  Restangular.extendModel('accounts', function(model) {
    model.prettifyAmount = function() {};
    return model;
  });

  var accountPromise = Restangular.one('accounts', 1).get();
  
  accountPromise.then(function(account) {
    account.prettifyAmount(); // invoke your custom model method
  });
```

# FAQ

#### **How can I handle errors?**

Errors can be checked on the second argument of the then.

````javascript
Restangular.all("accounts").getList().then(function() {
  console.log("All ok");
}, function(response) {
  console.log("Error with status code", response.status);
});
````

#### **I need to send one header in EVERY Restangular request, how do I do this?**

You can use `defaultHeaders` property for this or `$httpProvider.defaults.headers`, whichever suits you better. `defaultsHeaders` can be scoped with `withConfig` so it's really cool.

#### Can I cache requests?

`$http` can cache requests if you send the property `cache` to true. You can do that for every Restangular request by using `defaultHttpFields` property. This is the way:

````javascript
RestangularProvider.setDefaultHttpFields({cache: true});
````

#### Can it be used in `$routeProvider.resolve`?

Yes, of course. Every method in Restangular returns a promise so this can be used without any problem.

#### **My response is actually wrapped with some metadata. How do I get the data in that case?**

So, let's assume that your data is the following:

````javascript
 // When getting the list, this is the response.
{
  "status":"success",
  "data": {
    "data": [{
      "id":1,
      // More data
    }],
    "meta": {
      "totalRecord":100
    }
  }
}

// When getting a single element, this is the response.
{
  "status":"success",
  "data": {
    "id" : 1
    // More data
  }
}
````

In this case, you'd need to configure Restangular's `responseExtractor` and `listTypeIsArray`. See the following:

````javascript
app.config(function(RestangularProvider) {
    
    // Now let's configure the response extractor for each request
    RestangularProvider.setResponseExtractor(function(response, operation, what, url) {
      // This is a get for a list
      var newResponse;
      if (operation === "getList") {
        // Here we're returning an Array which has one special property metadata with our extra information
        newResponse = response.data.data;
        newResponse.metadata = response.data.meta;
      } else {
        // This is an element
        newResponse = response.data;
      }
      return newResponse;
    });
});
````

#### **I use Mongo and the ID of the elements is `_id` not `id` as the default. Therefore requests are sent to undefined routes**

What you need to do is to configure the `RestangularFields` and set the `id` field to `_id`. Let's see how:

````javascript
RestangularProvider.setRestangularFields({
  id: "_id"
});
````


#### **How do I handle CRUD operations in a List returned by Restangular?**

The best option for doing CRUD operations with a list, is to actually use the "real" list, and not the promise. It makes it easy to interact with it.

Let's see an example :).

````javascript
// Here we use then to resolve the promise.
Restangular.all('users').getList().then(function(users) {
  $scope.users = users;
  var userWithId = _.find(users, function(user) {
    return user.id === 123;
  });

  userWithId.name = "Gonto";
  userWithId.put();
  
  // Alternatively delete the element from the list when finished
  userWithId.remove().then(function() {
    // Updating the list and removing the user after the response is OK.
    $scope.users = _.without($scope.users, userWithId);
  });

});
````

When you actually get a list by doing

````javascript
$scope.owners = house.getList('owners')
````

You're actually assigning a Promise to the owners value of the $scope. As Angular knows how to process promises, if in your view you do an ng-repeat of this $scope variable, results will be shown once the promise is resolved (Response arrived).
However, changes to that promise that you do from your HTML won't be seen in the scope, as it's not a real array. It's just a promise of an array.

#### When I set baseUrl with a port, it's stripped out.

It won't be stripped out anymore as I've ditched `$resource` :). Now you can happily put the port :).

#### How can I access the `unrestangularized` element as well as the `restangularized` one?

In order to get this done, you need to use the `responseExtractor`. You need to set a property there that will point to the original response received. Also, you need to actually copy this response as that response is the one that's going to be `restangularized` later

````javascript
RestangularProvider.setResponseExtractor(function(response) {
  var newResponse = response;
  if (angular.isArray(response)) {
    angular.forEach(newResponse, function(value, key) {
      newResponse[key].originalElement = angular.copy(value);
    });
  } else {
    newResponse.originalElement = angular.copy(response);
  }

  return newResponse;
});
````

#### Why does this depend on Lodash / Underscore?

This is a very good question. I could've done the code so that I don't depend on Underscore nor Lodash, but I think both libraries make your life SO much easier. They have all of the "functional" stuff like map, reduce, filter, find, etc. 
With these libraries, you always work with immutable stuff, you get compatibility for browsers which don't implement ECMA5 nor some of these cool methods, and they're actually quicker.
So, why not use it? If you've never heard of them, by using Restangular, you could start using them. Trust me, you're never going to give them up after this!


# Supported Angular versions

Restangular supports both 1.0.X and 1.1.X up to versions 1.0.7 and 1.1.5.

Also, when using Restangular with version >= 1.1.4, in case you're using Restangular inside a callback not handled by Angular, you have to wrap the whole request with `$scope.apply` to make it work or you need to run one extra `$digest` manually. Check out https://github.com/mgonto/restangular/issues/71


# Server Frameworks

This server frameworks play real nice with Restangular, as they let you create a Nested Restful Resources API easily:

* Ruby on Rails
* CakePHP for PHP
* Play1 & 2 for Java & scala
* Restify and Express for NodeJS
* Tastypie for Django 


# Releases Notes

[Click here to see Releases Notes](https://github.com/mgonto/restangular/blob/master/CHANGELOG.md)

# License

The MIT License

Copyright (c) 2013 Martin Gontovnikas http://www.gon.to/

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

