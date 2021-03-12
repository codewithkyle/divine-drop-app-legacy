# Installing NPM Packages

Install the package:

```bash
npm i -S PACKAGE_NAME
```

Open the `package.json` file and add the package name to the snowpack -> install array.

Run the bundle command:

```bash
npm run bundle
```

Copy the JavaScript file from `web_modules` into `Client/Scripts/lib` directory and delete the `export` syntax from the file. This boilerplate does **NOT** support ES Modules.

For additional information about how the bundling process works read the [Snowpack documentation](https://www.snowpack.dev/).