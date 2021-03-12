@component('mail::message')
# Hey {{ $name }},

Here is the password reset link you requested. Click the button below to continue with resetting your password. If you didn't request this password reset you can just ignore this email.

@component('mail::button', ['url' => $url])
Reset Password
@endcomponent

@endcomponent
