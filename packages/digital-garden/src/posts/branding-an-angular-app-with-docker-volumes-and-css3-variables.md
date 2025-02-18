---
title: Branding an Angular app with Docker volumes and CSS3 variables
description: Hi, there! My name is Mordechai and it is my first post here. I thought what to write about and came up with an idea of sharing small tips and tricks which made my life as a developer a little bit easier, so here am I
tags:
  - programming
  - docker
  - angular
publishedAt: 2021-01-26
related:
isPinned:
---

## The problem

When you develop an app that is meant to be hosted on customer environment and you have several customers each customer will probably request to have its own theme for the app, which consists of set of images and colors that fit these images. And we are not talking here about runtime theme switch by user like light/dark theme, we are talking about environment theme, about branding of the app.

The first option here can be to set up separate build script for each environment and take advantage of replacing files at build time via Angular CLI Builder just like it replaces `environment.ts` with `environment.prod.ts` by default. Something like this:

```json
"architect": {
  "build": {
    "configurations": {
      "customer-1": {
        "fileReplacements": [
          {
            "replace": "path/to/file/in/development/mode",
            "with": "path/to/file/in/build/for/customer-1/mode"
          }
        ]
        ...
      }
      ...
    }
    ...
  }
  ...
}
```

And it is totally working as a solution, but have a couple of problems:

1. In order to Angular CLI Builder to work you need to keep all sets of theme assets near your code, for convenience right inside app's repository, which means that a lot of files that are not used 99% of development time for some reason are indeed stored in source code.
2. You need to set up separate build for each customer, as number of them grows up number of build configs grows up too. Most likely you are using some CI/CD tool like Jenkins or CircleCI, so number of jobs there is also grows up.
3. Also most likely you are containerising you app with Docker using for example NGINX or Apache, so the number of images on your probably private registry will also grow up (as well as it's cost) since literally the same app but with different image sets takes up to _number of customers_ images in it.

So here is my proposal, which is easy not only to implement but also to scale with time: **things like environment theme assets need to be replaced after build** using for example Docker volumes. As already mentioned above theme can consist of images and styles, so let's take it one by one: how to replace images and how to replace styles.

## How to replace images

Let's say we want to replace the following image in our app

```html
<img src="./assets/theme/background.png" />
```

In order to replace it we can we can use Docker volumes as I already mentioned before. And since images are only files and nothings more there is no bicycle to invent, the syntax of `docker-compose.yml` can be as follows. The only thing I can advise here is to create a folder to store all theme related images so there will be no need to create new volume for each new themed image

```yaml
version: "3.1"

services:
  ng-app:
    container_name: ng-app
    build:
      context: ..
      dockerfile: Dockerfile
    ports:
      - "4200:80"
    volumes:
      - ng-app-theme:/usr/share/nginx/html/assets/theme

volumes: ng-app-theme
```

**/usr/share/nginx/html** - is just a path where the app lives in order to be served by NGINX

**/assets/theme** - is a location of our theme inside of app. Remember that files in the volume must have the same name as in repo in order to replace them.

## How to replace styles

This one is a little bit trickier but we can nail it. Many modern CSS frameworks have their own theme set-up and most likely use one of CSS preprocessors like SASS or LESS. So we may have one general file with all of SASS/LESS variables that needs to be replaced, but only in development, not after build. After the build is done there is no such file, only compiled vanilla CSS code. We could somehow parse these files in order to replace values of each variable with the new one, but it is hard to implement and it has its own downsides.

The answer here is a vanilla CSS variables. Since they have pretty much good browser support except for IE11 (who cares about IE anyway?) why not to use them? And even if you do need to support IE11 there is a [polyfill](https://github.com/nuxodin/ie11CustomProperties) for it.

If you don't use CSS frameworks which relies on preprocessors you are good to go to use CSS variables all over your styles, store their config in separate file and replace it as I'll describe below. But if you do use frameworks with preprocessor, you need to provide your framework variables as well e.g. backward compatibility, so instead of using CSS variables by their own you probably should consider use them to set framework variables as follows:

```sass
$styled-text-color: var(--styled-text-color);
```

And of course you need to provide a file where you configure all default values and which can be replaced after build. You could use another `theme.css` file for it, but when you do so there is a chance to make some mistake which will lead to file to be merged into `style.css` so there will be nothing to replace after build. In order to avoid it 100% I would like to use a `theme.js` file here

```javascript
var root = document.documentElement;

root.style.setProperty("--styled-text-color", "blue");
```

and add it manually to `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>SkinReplacementAfterBuild</title>
    <base href="/" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
    />
    <link
      rel="icon"
      type="image/x-icon"
      href="favicon.ico"
    />
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>

<script src="./assets/theme/theme.js"></script>
```

So with all this set up we have our default theme in `theme.js` and what we should do here is to add a modified copy of this file into our Docker volume. Since we are storing all theme files in one directory e.g. one volume there is no need to change `docker-compose.yml`

## Conclusion

This solution not only allows us to get rid of dozens of files inside our repository, but we also now can have only one build and only one image in Docker registry for all of our customers. Also since Docker volumes have a lot of different drivers theme files can be stored not only locally on customer server, but on another dedicated host. And all we've done is just a couple of lines of code. The only thing I want to add in conclusion is a simple check list of what we've done to achieve desired behaviour:

1. We've placed al theme related files into separate directory so there will be only one volume in `docker-compose.yml`
2. We've created `theme.js` in this separate directory, which sets up all theme related CSS vanilla variables.
3. In case we are using CSS framework, which relies on preprocessor, we've refactored its variables file to use our own CSS variables instead of simple values.
4. We've configured `docker-compose.yml` to mount a volume with the different set of images and different `theme.js` so the default styles will be overridden by it inside the container

That's all, thank you for attention and see you later.
