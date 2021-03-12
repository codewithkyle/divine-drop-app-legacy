# IDB API

How-to guides for accessing IndexedDB data.

## Count

### Count via Select

```csharp
int TotalRows = await JSRuntime.InvokeAsync<int>("Count", "tableName");
```

### Count via Search

```csharp
string Query = "optional search query";
string[] Keys = {"Name", "Email"};
int TotalRows = await JSRuntime.InvokeAsync<int>("Count", "tableName", Query, Keys);
```

## Select

### Select All

```csharp
List<Exmaple> Exmaples = await JSRuntime.InvokeAsync<List<Exmaple>>("Select", "tableName");
```

### Select Paginated

```csharp
int Page = 1;
int RowsPerPage = 10;
List<Exmaple> Exmaples = await JSRuntime.InvokeAsync<List<Exmaple>>("Select", "tableName", Page, RowsPerPage);
```

## Search

### Search All

```csharp
string Query = "hello world";
string[] Keys = {"Name", "Email"};
List<Example> Examples = await JSRuntime.InvokeAsync<List<Example>>("Search", "tableName", Query, Keys);
```

### Search Paginated

```csharp
string Query = "hello world";
string[] Keys = {"Name", "Email"};
int Page = 1;
int RowsPerPage = 10;
List<Example> Examples = await JSRuntime.InvokeAsync<List<Example>>("Search", "tableName", Query, Keys, Page, RowsPerPage);
```

## Get Data

### Get via Primary Key

```csharp
Example Example = await JSRuntime.InvokeAsync<Example>("Get", "tableName", "value");
```

### Get via Key

```csharp
Example Example = await JSRuntime.InvokeAsync<Example>("Get", "tableName", "value", "indexName");
```

## Update Data

### Add 

```csharp
Example NewExample = new Example();
await JSRuntime.InvokeVoidAsync("Put", "tableName", NewExample);
```

### Update

```csharp
var object = Example;
string key = Example.id;
await JSRuntime.InvokeVoidAsync("Put", "tableName", object, key);
```

## Delete

```csharp
string key = Example.id;
await JSRuntime.InvokeVoidAsync("Delete", "tableName", key);
```

## Ingesting Data

```csharp
await JSRuntime.InvokeVoidAsync("Ingest", "/v1/ingest/users", "tableName");
```