# Creating IndexedDB Tables

For more information about the IDB library used in this project read the [libraries documentation](https://github.com/jakearchibald/idb).

First you need to open the `Client/wwwroot/schema.json` file and bump the version number.

Then you'll need to determine if you'll be updating an existing table or adding a new one. For this tutorial we'll be adding a new table.

```json
{
	"version": 2,
	"tables": [
		{
			"name": "example",
			"keyPath": "UID",
			"columns": [
				{
					"key": "UID",
					"unique": true
				},
				{
					"key": "Title"
				}
			]
		}
	]
}
```

We start by naming our table using the `name` key. We also need to set up a `keyPath` for the table. Key Paths tell IDB what column is the primary key. In our example we will use the `UID` column.

In the `columns` array we can create our tables columns. Columns require a key. They also accept a optional `unique` boolean (defaults to false).

That's it! Everything else is done for you automatically by the IDB Worker.