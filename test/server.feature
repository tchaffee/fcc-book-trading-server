Feature: Get a list of books
  As a programmer
  I want to fetch a list of books

  @dbfixtures
  Scenario: Get a list of all books
    When I GET /api/books
    Then response body should be valid according to schema file books.schema
    And response body path $.books should be of type array with length 2

  @dbfixtures
  Scenario: Get a list of MY books
    When I set a JWT bearer token using test user "user1"
    And I GET /api/users/me/books
    Then response body should be valid according to schema file books.schema
    And response body path $.books[0].title should be My book
    
  @dbfixtures
  Scenario: Add a book to my list books
    Given I set Content-Type header to application/json
    And I set body to { "googleId": "bzTbCwAAQBAJ", "title": "The Master and Margarita" } 
    And I set a JWT bearer token using test user "user1"
    When I POST to /api/users/me/books
    Then response code should be 200

  @now
  @dbfixtures
  Scenario: Book added to my books list 
    Given I set Content-Type header to application/json
    And I set body to { "googleId": "bzTbCwAAQBAJ", "title": "The Master and Margarita" } 
    And I set a JWT bearer token using test user "user1"
    And I POST to /api/users/me/books
    When I GET /api/users/me/books
    Then response body should be valid according to schema file books.schema
    And response body should contain bzTbCwAAQBAJ
        