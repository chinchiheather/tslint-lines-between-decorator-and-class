# tslint-lines-between-decorator-and-class
TSLint rule to enforce number of new lines between a class and its decorator - designed with Angular projects in mind

## Setup
1. Install package

```
npm install --save-dev tslint-lines-between-decorator-and-class
```
2. Update your tslint.json config file, adding the new rules directory and rule, specifying the number of new lines you want to enforce

```
{
  "rulesDirectory": [
    ...
    "node_modules/tslint-lines-between-decorator-and-class"
    ...
  ],
  "rules": {
    ...
    "lines-between-decorator-and-class": [
      true,
      0
    ]
    ...
  }
}
