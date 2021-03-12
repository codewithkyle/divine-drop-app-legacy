# Images

Images can be requested using the `/v1/image/{uid}` route. For information on transforming images read the [image transformation documentation](https://github.com/codewithkyle/jitter/blob/master/readme.md#using-jitter).

```html
<!-- Remove the crossorigin attribute to prevent the Service Worker from caching this image. -->
<img crossorigin="use-credentials" loading="lazy" width="64" src="https://api.example.com/v1/image/{uid}?w=64&ar=1:1" alt="image alt text">
```