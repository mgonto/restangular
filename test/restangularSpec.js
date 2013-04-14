describe("Restangular", function() {
  // API
  var Restangular, $httpBackend;
  var accountsModel, restangularAccounts, restangularAccount0, restangularAccount1;

  // Utils
  // Apply "sanitizeRestangularOne" function to an array of items
  function sanitizeRestangularAll(items) {
    return _.map(items, function(item) {
      return sanitizeRestangularOne(item);
    });
  };

  // Remove all Restangular/AngularJS added methods in order to use Jasmine toEqual between the retrieve resource and the model
  function sanitizeRestangularOne(item) {
    return _.omit(item, "route", "parentResource", "getList", "get", "post", "put", "remove", "head", "trace", "options", "patch",
      "$get", "$getArray", "$save", "$query", "$remove", "$delete", "$put", "$post", "$head", "$trace", "$options", "$patch",
      "$then", "$resolved");
  };

  // Load required modules
  beforeEach(angular.mock.module("ngResource"));
  beforeEach(angular.mock.module("restangular"));

  // Init HTTP mock backend and Restangular resources
  beforeEach(inject(function($injector) {
    // Model
    accountsModel = [
      {id: 0, user: "Martin ", amount: 42, transactions: []},
      {id: 1, user: "Paul", amount: 3.1416, transactions: [{from: "Martin", amount: 3}, {from: "Anonymous", amount: 0.1416}]}
    ];

    $httpBackend = $injector.get("$httpBackend");

    $httpBackend.when("HEAD", "/accounts").respond();
    $httpBackend.when("TRACE", "/accounts").respond();
    $httpBackend.when("OPTIONS", "/accounts").respond();

    $httpBackend.whenGET("/accounts").respond(accountsModel);
    $httpBackend.whenGET("/accounts/0").respond(accountsModel[1]);
    $httpBackend.whenGET("/accounts/1").respond(accountsModel[1]);
    $httpBackend.whenGET("/accounts/1/transactions").respond(accountsModel[1].transactions);

    $httpBackend.whenPOST("/accounts").respond(function(method, url, data, headers) {
      accountsModel.push(angular.fromJson(data));
      return [201, "", ""];
    });

    $httpBackend.whenPUT("/accounts/1").respond(function(method, url, data, headers) {
      accountsModel[1] = angular.fromJson(data);
      return [201, "", ""];
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
        expect(sanitizeRestangularAll(accounts)).toEqual(accountsModel);
      });

      $httpBackend.flush();
    });

    // TODO: create issue in GitHub and see what happen
//    it("post() should add a new item", function() {
//      restangularAccounts.post({id: 2, user: "Someone"}).then(function() {
//        expect(accountsModel.length).toEqual(2);
//      });
//
//      $httpBackend.flush();
//    });

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

    it("options()  should safely return", function() {
      restangularAccounts.options().then(function() {
        expect(true).toBe(true);
      });

      $httpBackend.flush();
    });
  });

  describe("ONE", function() {
    it("get() should return a JSON item", function() {
      restangularAccount1.get().then(function(account) {
        expect(sanitizeRestangularOne(account)).toEqual(accountsModel[1]);
      });

      $httpBackend.flush();
    });

    it("put() should update the value", function() {
      restangularAccount1.get().then(function(account) {
        account.amount = 1.618;
        account.put().then(function() {
          expect(accountsModel[1].amount).toEqual(1.618);
        });

      });

      $httpBackend.flush();
    });

    it("should return an array when accessing a subvalue", function() {
      restangularAccount1.get().then(function(account) {
        account.getList("transactions").then(function(transactions) {
          expect(sanitizeRestangularAll(transactions)).toEqual(accountsModel[1].transactions);
        });
      });

      $httpBackend.flush();
    });
  });

});
