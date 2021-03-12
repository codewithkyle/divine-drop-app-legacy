# Toaster Notifications

For technical information read the [toaster notifications reference document](/references/toaster-notifications).

## Blazor

### Success

```csharp
await JSRuntime.InvokeVoidAsync("Alert", "success", "Notification Title", "Notification message.");
```

### Error

```csharp
await JSRuntime.InvokeVoidAsync("Alert", "error", "Notification Title", "Notification message.");
```

### Warning

```csharp
await JSRuntime.InvokeVoidAsync("Alert", "warning", "Notification Title", "Notification message.");
```

### General

```csharp
await JSRuntime.InvokeVoidAsync("Alert", "notice", "Notification Title", "Notification message.");
```

## JavaScript

### Success

```javascript
Alert("success", "Notification Title", "Notificaiton message.");
```

### Error

```javascript
Alert("error", "Notification Title", "Notificaiton message.");
```

### Warning

```javascript
Alert("warning", "Notification Title", "Notificaiton message.");
```

### General

```javascript
Alert("notice", "Notification Title", "Notificaiton message.");
```