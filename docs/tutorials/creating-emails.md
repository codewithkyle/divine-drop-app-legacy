# Creating Emails

Create the new email model in the `Server/app/Mail/` directory.

```php
<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ExampleEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct()
    {
        // ...
    }

    public function build()
    {
        $emailPath = "emails.folderName.fileName";
        $params = [];
        $subject = "Example Email";
        return $this->markdown($emailPath, $params)->subject($subject);
    }
}
```

Create the email view in the `Server/resources/views/emails/` directory.

```html
@component('mail::message')

# Hey you,

You can type whatever you want here. You can even use markdown syntax.

@endcomponent
```

For additional information about emails read the [Laravel Mail documentation](https://laravel.com/docs/8.x/mail).