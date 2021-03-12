@component('mail::message')
# Hey {{ $name }},

You can confirm your email address by clicking the button below.

@component('mail::button', ['url' => $url])
Confirm Email
@endcomponent

@endcomponent
