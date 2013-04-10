#Restangular

Restangular is an AngularJS service that will help you get, delete and update Restfull Resources with very few lines in the Client side. 
This service is a perfect fit for any WebApp that uses Restfull Resources as the API for your application.

#How do I add this to my project?

In order to use Restangular, you need to download Restangular file from dist folder in Github and include this in your HTML.

#Dependencies

Restangular depends on Angular, Angular-Resources and Underscore.

#Starter Guide

## Adding dependency to Restangular module in your app

The first thing you need to do after adding link to script file, is mentioning in your app that you'll use Restangular.

````javascript
var app = angular.module('angularjs-starter', ['restangular']);
````

## Configuring Restangular

### Properties
Restangular comes with some defaults for all of it's properties but you can configure them. All of this properties have setters so that you can change them. The properties are:

* baseUrl: The base URL for all calls to your API. For example if your URL for fetching accounts is http://example.com/api/v1/accounts, then your baseUrl is `/api/v1`. The default baseUrl is empty string
* extraFields: This are the fields that you want to save from your parent resources if you need to display them. By default this is an Empty Array which will suit most cases
* urlCreator: This is the factory that will create URLs based on the resources. For the time being, only Path UrlCreator is implemented. This means that if you have a resource names Building which is a child of Account, the URL to fetch this will be `/accounts/123/buildings`. In the future, I'll implement more UrlCreator like QueryParams UrlCreator.

### How to configure them
You can configure this properties inside the config method of your app

````javascript
app.config(function(RestangularProvider) {
            RestangularProvider.setBaseUrl('/api/v1');
            RestangularProvider.setExtraFields(['name']);
          });
````

## Using Restangular

Now that you have everything configured, you can just inject this Service to any Controller or Directive like any other :)

### Creating Main Restangular object

There're 2 ways of creating a main Restangular object. 
The first one and most common one is by stating the main route of all requests. 
The second one is by stating the main route and object of all requests.

````javascript
// Only stating main route
Restangular.all('accounts')

// Stating main object
Restangular.one('accounts', 1234)
````

### Fetching elements from Main object

Now that we have our main Object lets's start playing with it.

````javascript
var baseAccounts = Restangular.all('accounts');

// This will query /accounts and return a promise. As Angular supports setting promises to scope variables
// as soon as we get the information from the server, it will be shown in our template :)
$scope.allAccounts = baseAccounts.fetch();

//Here we use Promises then 
baseAccounts.fetch().then(function (accounts) {
  // Here we can continue fetching the tree :).
  
  var firstAccount = accounts[0];
  // This will query /accounts/123/buildings considering 123 is the id of the firstAccount
  $scope.buildings = firstAccount.fetch("buildings");
  
  // This is a regular JS object, we can change anything we want :) 
  firstAccount.name = "Gonto"
  
  // PUT /accounts/123. The name of this account will be Gonto from now on
  firstAccount.put();
  
  // DELETE /accounts/123 We don't have first account anymore :(
  firstAccount.remove();
  
  // Get /accounts/123/users
  firstAccount.fetch("users").then(function(users) {
    
    var firstUser = users[0];
    
    // GET /accounts/123/users/456. Just in case we want to update one user :)
    $scope.userFromServer = firstUser.get();
    
  });

}, function errorCallback() {
  alert("Oops error from server :(");
})

//Now let's try single :)

var account = Restangular.one("accounts", 123);

// GET /accounts/123?single=true
$scope.account = account.get({single: true});
````

# Contribute

In order to Contribute just git clone the repository and then run:

````
npm install grunt-cli --global
npm install
grunt
````

All changes must be done in `src/restangular.js`and then after running `grunt`all changes will be submited to `dist/`

Please submit a Pull Request or create issues for anything you want :).

# License

The MIT License

Copyright (c) 2013 Martin Gontovnikas http://www.gon.to/

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

