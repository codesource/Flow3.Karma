# Flow3.Karma
Karma loader for javascript unit testing on Flow3 architecture with Jasmine

## Installation
The files must be install into Flow3 architecture, under "Build/BuildEssentials/Karma"

## Requirement

NodeJS must be installed.
*(Be careful in most of the installation, the executable will be `nodejs` and not `node`, you will have to create a symlink)*

Karma must be installed.
```
npm install karma
```

Jasmine must be installed.

`npm install jasmine`

PhantomJS must be installed.

`npm install phantomjs`

## How to use

### Test all bundle
`karma start Build/BuildEssentials/Karma/config.js`

### Test a specific bundle
`karma start Build/BuildEssentials/Karma/config.js Packages/Application/My.Package/`

### Test a specific folder
`karma start Build/BuildEssentials/Karma/config.js Packages/Application/My.Package/Tests/JavaScript/Unit/MyFolder`

### Test a specific file
`karma start Build/BuildEssentials/Karma/config.js Packages/Application/My.Package/Tests/JavaScript/Unit/mytest.js`
