# Emails

For information about creating emails read the [Creating Emails tutorial](/tutorials/creating-emails). For additional information about emails read the [Laravel Mail documentation](https://laravel.com/docs/8.x/mail).

## Sending Emails

```php
use Illuminate\Support\Facades\Mail;
use App\Mail\ExampleEmail;

$emailAddress = "noreply@example.com";
$mail = new ExampleEmail();
Mail::to($emailAddress)->send($mail);
```