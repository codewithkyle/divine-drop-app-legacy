# Global Loading Animation

The global loading animation enables an infinite progress bar and forces the cursor to use the OS "waiting" cursor. The animation will persist until all of the issued "tickets" have been resolved.

When a ticket is issued the `<html>` element's `[state]` attribute changes from "idling" to "loading". This can be utilized in other UI elements with the following SCSS:

```sass
.element{
    // CSS properties while DOM is idling

    html[state="loading"] & {
        // CSS properties while DOM is loading
    }
}
```

The infinite loading bar color/properties can be found in the `loading.scss` file.