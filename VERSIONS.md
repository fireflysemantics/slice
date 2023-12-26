# Supported Versions

We currently *officially* support Angular 15,16, and 17. 

If you need a build for earlier versions of Angular here is how this can be accomplished.

# Adding a Branch for a Specific Angular Version

Here we will describe how we added a library build for version `16.2.1` of Angular.

Clone slice.
```
git clone git@github.com:fireflysemantics/slice.git && cd slice 
```

And get all the branches.
```
git pull --all
```

Lets first figure out what version of Angular we want.

```
npm view @angular/cli versions --json
```

Then install the version of the CLI that we want.  In this case `16.2.x`.

```
npm install -g  @angular/cli@16.x.x  
```


Later on we can reinstall the latest version of the CLI like this.

```
npm uninstall -g @angular-cli
npm install -g @angular/cli@latest
```

First create a new version branch.

```
git switch --orphan v16.2.10
```

Create a new Angular version 16 project.

```
ng new --directory . --create-application=false
```

Then generate a slice library.

```
ng g library slice
```

Commit the newly generated library.

```
git add . && git commit -m "Generate slice 16.2.1 workspace project" 
```

Remove the `src` folder.

```
git rm -r projects/slice/src 
```

Commit thew new structure.

```
git add . && git commit -m "Remove the library source files"
```

Change directories to the `slice` folder.


Copy over the slice files from the  `master` branch.

```
git checkout master -- projects/slice/src
```

Then update the workspace `package.json`  build scripts.

```
    "ig": "npm install -g @jsdevtools/version-bump-prompt && npm install -g npm-check-updates && npm install -g npm-install-peers",
    "c": "ng build slice",
    "bp": "cd projects/slice && bump patch",
    "p": "npm run cp && npm run bp && npm run c && cd dist/slice/ && npm publish",
    "cp": "cp ./README.md projects/slice/",
    "d": "typedoc --out doc --exclude **/*.spec.ts ./projects/slice/src/lib"    
```

Commit the update.

```
git add package.json && git commit -m "Update the package.json scripts"
```

Then update `package.json` for the library.  

Change the `name` to `@fireflysemantics/slice`, the `version` to `16.2.10` (The version of the CLI we are using), and change the `peerDependencies` to.

```
    "nanoid": "^5.0.4",
    "@types/nanoid": "*",
    "rxjs": "*"
```

Add the `package.json` `repository`, `bugs`, and `keywords` as blocks as well.

Commit the update.

```
git add projects/slice/package.json && git commit -m "Update the slice library package.json" 
```

Add the root level `README.md`.

```
git add README.md && git commit -m "Update the README.md" 
```
Publish the version.
```
npm run p

Push the branch.
```
git push --set-upstream origin v16.2.10
```

And just commmit the branch after publish.

```
git add . && git commit -m "Post first publish commit"
```