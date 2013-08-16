describe("Restangular", function() {
  // API
  var Restangular, $httpBackend;
  var accountsModel, restangularAccounts, restangularAccount0, restangularAccount1;
  var messages, newAccount;

  // Utils
  // Apply "sanitizeRestangularOne" function to an array of items
  function sanitizeRestangularAll(items) {
    var all = _.map(items, function(item) {
      return sanitizeRestangularOne(item);
    });
    return sanitizeRestangularOne(all);
  };

  // Remove all Restangular/AngularJS added methods in order to use Jasmine toEqual between the retrieve resource and the model
  function sanitizeRestangularOne(item) {
    return _.omit(item, "route", "parentResource", "getList", "get", "post", "put", "remove", "head", "trace", "options", "patch",
      "$then", "$resolved", "restangularCollection", "customOperation", "customGET", "customPOST",
      "customPUT", "customDELETE", "customGETLIST", "$getList", "$resolved", "restangularCollection", "one", "all","doGET", "doPOST",
      "doPUT", "doDELETE", "doGETLIST", "addRestangularMethod", "getRestangularUrl");
  };

  // Load required modules
  beforeEach(angular.mock.module("ngResource"));
  beforeEach(angular.mock.module("restangular"));

  // Init HTTP mock backend and Restangular resources
  beforeEach(inject(function($injector) {
    // Model
    accountsModel = [
      {id: 0, user: "Martin ", amount: 42, transactions: []},
      {id: 1, user: "Paul", amount: 3.1416, transactions: [{from: "Martin", amount: 3, id: 0}, {from: "Anonymous", amount: 0.1416, id:1}]}
    ];

    newAccount = {id: 44, user: "First User", amount: 45, transactions: []};

    messages = [{id: 23, name: "Gonto"}, {id: 45, name: "John"}]


    $httpBackend = $injector.get("$httpBackend");

    $httpBackend.when("HEAD", "/accounts").respond();
    $httpBackend.when("TRACE", "/accounts").respond();
    $httpBackend.when("OPTIONS", "/accounts").respond();

    $httpBackend.whenGET("/accounts").respond(accountsModel);
    $httpBackend.whenGET("/accounts/messages").respond(messages);
    $httpBackend.whenGET("/accounts/1/message").respond(messages[0]);
    $httpBackend.whenGET("/accounts/1/messages").respond(messages);
    $httpBackend.whenGET("/accounts/0").respond(accountsModel[1]);
    $httpBackend.whenGET("/accounts/1").respond(accountsModel[1]);
    $httpBackend.whenGET("/accounts/1/transactions").respond(accountsModel[1].transactions);
    $httpBackend.whenGET("/accounts/1/transactions/1").respond(accountsModel[1].transactions[1]);

    $httpBackend.whenPOST("/accounts").respond(function(method, url, data, headers) {
      var newData = angular.fromJson(data);
      newData.fromServer = true;
      return [201, JSON.stringify(newData), ""];
    });

    $httpBackend.whenPOST("/accounts/1/transactions").respond(function(method, url, data, headers) {
      return [201, "", ""];
    });

    $httpBackend.whenDELETE("/accounts/1/transactions/1").respond(function(method, url, data, headers) {
      return [200, "", ""];
    });

    $httpBackend.whenDELETE("/accounts/1").respond(function(method, url, data, headers) {
      return [200, "", ""];
    });

    $httpBackend.whenPUT("/accounts/1").respond(function(method, url, data, headers) {
      accountsModel[1] = angular.fromJson(data);
      return [201, data, ""];
    });

    Restangular = $injector.get("Restangular");
    restangularAccounts = Restangular.all("accounts");
    restangularAccount0 = Restangular.one("accounts", 0);
    restangularAccount1 = Restangular.one("accounts", 1);
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe("ALL", function() {
    it("getList() should return an array of items", function() {
      restangularAccounts.getList().then(function(accounts) {
        expect(sanitizeRestangularAll(accounts)).toEqual(sanitizeRestangularAll(accountsModel));
      });

      $httpBackend.flush();
    });

    it('uses all to get the list without parameters', function() {
      Restangular.one('accounts', 1).all('messages').getList();
      $httpBackend.expectGET('/accounts/1/messages');
      $httpBackend.flush();
    });

    it("Custom GET methods should work", function() {
      restangularAccounts.customGETLIST("messages").then(function(msgs) {
        expect(sanitizeRestangularAll(msgs)).toEqual(sanitizeRestangularAll(messages));
      });

      $httpBackend.flush();
    });

    it("post() should add a new item", function() {
     restangularAccounts.post({id: 2, user: "Someone"}).then(function() {
       expect(accountsModel.length).toEqual(2);
     });

    $httpBackend.expectPOST('/accounts').respond(201, '');
    $httpBackend.flush();
   });

    it("post() should add a new item with data and return the data from the server", function() {
     restangularAccounts.post(newAccount).then(function(added) {
       expect(added.fromServer).toEqual(true);
       expect(added.id).toEqual(newAccount.id);
     });

    $httpBackend.expectPOST('/accounts');
    $httpBackend.flush();
   });

    it("Doing a post and then other operation (delete) should call right URLs", function() {
      restangularAccounts.post(newAccount).then(function(added) {
        added.remove();
        $httpBackend.expectDELETE('/accounts/44').respond(201, '');   
      });      
      
      $httpBackend.flush();
    });

    it("Doing a post to a server that returns no element will return undefined", function() {
      restangularAccounts.getList().then(function(accounts) {
        var newTransaction = {id: 1, name: "Gonto"};
        accounts[1].post('transactions', newTransaction).then(function(transaction) {
          expect(transaction).toBeUndefined();
        });
      });

      $httpBackend.flush();
    });

    it("head() should safely return", function() {
      restangularAccounts.head().then(function() {
        expect(true).toBe(true);
      });
      $httpBackend.flush();
    });

    it("trace()  should safely return", function() {
      restangularAccounts.trace().then(function() {
        expect(true).toBe(true);
      });

      $httpBackend.flush();
    });

    it("customPUT should work", function() {
      $httpBackend.expectPUT('/accounts/hey').respond(accountsModel);
      restangularAccounts.customPUT({key: 'value'}, 'hey');

      $httpBackend.flush();
    });

    it("options()  should safely return", function() {
      restangularAccounts.options().then(function() {
        expect(true).toBe(true);
      });

      $httpBackend.flush();
    });

     it("getList() should correctly handle params after customDELETE", function() {
      $httpBackend.expectGET('/accounts?foo=1').respond(accountsModel);
      restangularAccounts.getList({foo: 1}).then(function(){
        $httpBackend.expectDELETE('/accounts?id=1').respond(201, '');
        return restangularAccounts.customDELETE('', {id: 1});
      }).then(function() {
          $httpBackend.expectGET('/accounts?foo=1').respond(accountsModel);
          return restangularAccounts.getList({foo: 1});
        }).then(function(accounts) {
          expect(sanitizeRestangularAll(accounts)).toEqual(sanitizeRestangularAll(accountsModel));
        });

      $httpBackend.flush();
    });
  });

  describe("ONE", function() {
    it("get() should return a JSON item", function() {
      restangularAccount1.get().then(function(account) {
        expect(sanitizeRestangularOne(account))
          .toEqual(sanitizeRestangularOne(accountsModel[1]));
      });

      $httpBackend.flush();
    });

    it("Should make RequestLess connections with one", function() {
      restangularAccount1.one("transactions", 1).get().then(function(transaction) {
        expect(sanitizeRestangularOne(transaction))
          .toEqual(sanitizeRestangularOne(accountsModel[1].transactions[1]));
      });

      $httpBackend.flush();
    });

    it("Should make RequestLess connections with all", function() {
      restangularAccount1.all("transactions").getList().then(function(transactions) {
        expect(sanitizeRestangularAll(transactions))
          .toEqual(sanitizeRestangularAll(accountsModel[1].transactions));
      });

      $httpBackend.flush();
    });


    it("Custom GET methods should work", function() {
      restangularAccount1.customGET("message").then(function(msg) {
        expect(sanitizeRestangularOne(msg)).toEqual(sanitizeRestangularOne(messages[0]));
      });

      $httpBackend.flush();
    });

    it("put() should update the value", function() {
      restangularAccount1.get().then(function(account) {
        account.amount = 1.618;
        account.put().then(function(newAc) {
          expect(accountsModel[1].amount).toEqual(1.618);
          newAc.remove();
          $httpBackend.expectDELETE("/accounts/1");
        });
        $httpBackend.expectPUT("/accounts/1");        


      });

      $httpBackend.flush();
    });

    it("should return an array when accessing a subvalue", function() {
      restangularAccount1.get().then(function(account) {
        account.getList("transactions").then(function(transactions) {
          expect(sanitizeRestangularAll(transactions))
            .toEqual(sanitizeRestangularAll(accountsModel[1].transactions));
        });
      });

      $httpBackend.flush();
    });
  });

  describe("COPY", function() {
    it("should copy an object and 'this' should reference the copied object", function() {
      var copiedAccount = Restangular.copy(accountsModel[0]);
      var that;

      copiedAccount.user = "Copied string";
      expect(copiedAccount).not.toBe(accountsModel[0]);

      // create a spy for one of the methods to capture the value of 'this'
      spyOn(copiedAccount, 'getRestangularUrl').andCallFake(function() {
        that = this;
      });

      copiedAccount.getRestangularUrl(); // invoke the method we are spying on
      expect(that).toBe(copiedAccount);
    });
  });

  describe("getRestangularUrl", function() {
    it("should return the generated URL when you chain Restangular methods together", function() {
      var restangularSpaces = Restangular.one("accounts",123).one("buildings", 456).all("spaces");
      expect(restangularSpaces.getRestangularUrl()).toEqual("/accounts/123/buildings/456/spaces");
    });
  });

  describe("getRestangularUrl with useCannonicalId set to true", function() {
    it("should return the generated URL when you chain Restangular methods together", function() {
      var R = Restangular.withConfig(function(config) {
        config.setUseCannonicalId(true);
      });
      var restangularSpaces = R.one("accounts",123).one("buildings", 456).all("spaces");
      expect(restangularSpaces.getRestangularUrl()).toEqual("/accounts/123/buildings/456/spaces");
    });
  });


  describe("addElementTransformer", function() {
    it("should allow for a custom method to be placed at the collection level", function() {
      var accountsPromise;

      Restangular.addElementTransformer('accounts', true, function(collection) {
         collection.totalAmount = function() {};
         return collection;
      });

      accountsPromise = Restangular.all('accounts').getList();
      
      accountsPromise.then(function(accounts) {
        expect(typeof accounts.totalAmount).toEqual("function");
      });

      $httpBackend.flush();
    });

    it("should allow for a custom method to be placed at the model level when one model is requested", function() {
      var accountPromise;
      
      Restangular.addElementTransformer('accounts', false, function(model) {
         model.prettifyAmount = function() {};
         return model;
      });

      accountPromise = Restangular.one('accounts', 1).get();
      
      accountPromise.then(function(account) {
        expect(typeof account.prettifyAmount).toEqual("function");
      });

      $httpBackend.flush();
    });

    it("should allow for a custom method to be placed at the model level when several models are requested", function() {
      var accountPromise;
      
      Restangular.addElementTransformer('accounts', false, function(model) {
         model.prettifyAmount = function() {};
         return model;
      });

      accountsPromise = Restangular.all('accounts', 1).getList();
      
      accountsPromise.then(function(accounts) {
        accounts.forEach(function(account, index) {
          expect(typeof account.prettifyAmount).toEqual("function");
        });
      });

      $httpBackend.flush();
    });
  });

  describe("extendCollection", function() {
    it("should be an alias for a specific invocation of addElementTransformer", function() {
      var spy = spyOn(Restangular, 'addElementTransformer');

      var fn = function(collection) {
        collection.totalAmount = function() {};
        return collection;
      };

      Restangular.extendCollection('accounts', fn);

      expect(spy).toHaveBeenCalledWith('accounts', true, fn);
    });
  });

  describe("extendModel", function() {
    it("should be an alias for a specific invocation of addElementTransformer", function() {
      var spy = spyOn(Restangular, 'addElementTransformer');

      var fn = function(model) {
        model.prettifyAmount = function() {};
        return model;
      };

      Restangular.extendModel('accounts', fn);

      expect(spy).toHaveBeenCalledWith('accounts', false, fn);
    });
  });
  
  describe("defaultHeaders", function() {
    it("should return defaultHeaders", function() {
      var defaultHeaders = {testheader:'header value'};
      
      Restangular.setDefaultHeaders(defaultHeaders);
      
      expect(Restangular.defaultHeaders).toEqual(defaultHeaders);
    });
  });
});
