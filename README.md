# Figma Sync

The goal of this project is that you will be able to point it at a figma file and sync all the shared styles from that file with a simple json file.

This project needs a better name...

Any more docs...

## Use

for now you can use this by installing the dependecies:

```
yarn
```

and then running the project:

```
yarn start <Your Figma Token> <Your Figma File ID>
```

This will do a single sync and list all the color styles from the project. Note you'll need to have a figma token and the file ID for anything to work.

You can also run in watch mode:

```
yarn start <Your Figma Token> <Your Figma File ID> watch
```

which will keep the process running and update the style list as they are updated in the figma file.
