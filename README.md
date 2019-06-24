# Project 11: Build a Course Rating API With Express

In this project, you’ll create a REST API using Express. The API will provide a way for users to review educational courses: users can see a list of courses in a database; add courses to the database; and add reviews for a specific course.

To complete this project, you’ll use your knowledge of REST API design, Node.js, and Express to create API routes, along with Mongoose and MongoDB for data modeling, validation, and persistence.

## Note About Using API

The seed database provided by Treehouse for this project contains users with plain text passwords. Since I have implemented password encryption, the login credentials of the seeded users cannot be used to make any requests. Please create a new user and use the new user's authentication details for testing all the endpoints.

## Requirements

- **Database connection** - Mongoose is listed as a dependency in the `package.json` file - A message is written to the console when there’s an error connecting to the database - A message is written to the console when the database connection is successfully opened
- **User Model** - The user schema follows the provided specification: - \_id (`ObjectId`, auto-generated) - `fullName` (`String`, required) - `emailAddress` (`String`, required, must be unique and in correct format) - Must have a `password` (`String`, required)

- **Course Model** - The course schema follows the provided specification: - \_id (`ObjectId`, auto-generated) - user (\_id from the `users` collection) - title (`String`, required) - description (`String`, required) - estimatedTime (`String`) - materialsNeeded (`String`) - steps (`Array` of objects that include stepNumber (`Number`), title (`String`, required) and description (`String`, required) properties) - reviews (`Array` of `ObjectId` values, \_id values from the `reviews`collection)

- **Review Model**

  - The review schema follows the provided specification:
  - \_id (`ObjectId`, auto-generated)
  - user (\_id from the `users` collection)
  - postedOn (`Date`, defaults to `now`)
  - rating (`Number`, a number between 1 and 5)
  - review (`String`)
  - **Exceeds Expectations** - Validation added to prevent a user from reviewing their own course

- **User Routes** - All of the following user routes are available and return the following data as specified: - `GET` `/api/users` `200` - Returns the currently authenticated user - `POST` `/api/users` `201` - Creates a user, sets the `Location` header to "/", and returns no content - **Exceeds Expectations** - Tests have been written for the following user story: - When I make a request to the GET `/api/users` route with the correct credentials, the corresponding user document is returned - When I make a request to the GET `/api/users` route with invalid credentials, a 401 status error is returned

- **Course Routes** - All of the following course routes are available and return the following data as specified: - `GET` `/api/courses` `200` - Returns the Course "\_id" and "title" properties - `GET` `/api/courses/:courseId` `200` - Returns all Course properties and related `user` and `review` documents for the provided course ID - `POST` `/api/courses` `201` - Creates a course, sets the `Location` header, and returns no content - `PUT` `/api/courses/:courseId` `204` - Updates a course and returns no content - **Exceeds Expectations** - Using deep population, only the user’s id and fullName are returned for the `user` and `reviews.user`properties on the ` GET``/api/courses/:courseId ` route

- **Validation Errors** - Validation errors generated from Mongoose are passed to express - Validation errors received by an express route are sent to express’s global error handler - Mongoose style validation errors are sent from Express’s global error handler to the user as is, in JSON format

- **Hooks and Methods** - A pre-save hook on the user schema encrypts the password property before saving it to the database - An "authenticate" static method on the user schema compares a password to the hashed password stored on a user document instance

- **Permissions** - An express middleware function authenticates any routes using the “authenticate” static method on the user schema
  - The following routes use middleware to implement authentication:
  - `POST` `/api/courses`
  - `PUT` `/api/courses/:courseId`
  - ` POST``/api/courses/:courseId/reviews `
