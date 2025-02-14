---
title: Updating Code with ZapCircle
description: Take changes in your behavior file, and apply them to your React component using an LLM.
---

After creating components with ZapCircle, you'll have source code along with your behavior file. You'll be able to keep the code in sync with any changes in your behavior with the `zapcircle update` command - running this command will take the changes in your `.zap.toml` file from the last git commit and apply them to your code.

ZapCircle will take your behavior, the diff in the behavior, and the source code, and combine them into a prompt sent over to the LLM - which will return the component with the code changes.

If you run the `update` command in interactive mode, you can choose to accept or reject the change.

You'll need:
* The path to the behavior file (`.zap.toml`)
* The path to the source code file (`.jsx`, for example)

# Running the `update` command

Here is an example of the update command

```bash
npx zapcircle update ./LoginForm.jsx.zap.toml ./LoginForm.jsx
```

ZapCircle infers which update prompt to use by the filetype at the end of the source code file.

Your existing source code file will be overwritten - we do recommend that you commit your work with git when you are happy with it to keep a record, and to allow you to easily revert.

