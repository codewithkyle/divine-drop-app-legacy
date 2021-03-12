# Lumen at a glance

Laravel Lumen is a stunningly fast PHP micro-framework for building web applications with expressive, elegant syntax. Lumen attempts to take the pain out of development by easing common tasks used in the majority of web projects, such as routing, database abstraction, queueing, and caching.

## Server Requirements

The Lumen framework has a few system requirements:

- PHP >= 7.3
- OpenSSL PHP Extension
- PDO PHP Extension
- Mbstring PHP Extension

## Basic Routing

You will define all of the routes for the application in the `routes/api.php` file. The most basic Lumen routes simply accept a URI and a Closure:

```php
$router->get('foo', function () {
    return 'Hello World';
});

$router->post('foo', function () {
    //
});
```

## Basic Controllers

Here is an example of a basic controller class. All Lumen controllers should extend the base controller class:

```php
<?php

namespace App\Http\Controllers;

use App\User;

class UserController extends Controller
{
    /**
     * Retrieve the user for the given ID.
     *
     * @param  int  $id
     * @return Response
     */
    public function show($id)
    {
        return User::findOrFail($id);
    }
}
```

## Accessing The Request

To obtain an instance of the current HTTP request via dependency injection, you should type-hint the `Illuminate\Http\Request` class on your controller constructor or method. The current request instance will automatically be injected by the service container:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Store a new user.
     *
     * @param  Request  $request
     * @return Response
     */
    public function store(Request $request)
    {
        $name = $request->input('name');

        //
    }
}
```

## JSON Responses

The json method will automatically set the Content-Type header to `application/json`, as well as convert the given array into JSON using the `json_encode` PHP function:

```php
return response()->json(['name' => 'Abigail', 'state' => 'CA']);
```
