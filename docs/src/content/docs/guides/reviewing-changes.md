---
title: Reviewing Changes with ZapCircle
description: Use an LLM to review any changes you've made since your last git merge to main, and get suggestions for improvement.
---

Whether or not you use ZapCircle to manage your code with behaviors, you can use the `zapcircle review` command to help with code reviews.

The `review` command takes any files that have been modified since the last git commit to the `main` branch, and then sends them over one at a time to your configured LLM for a line-by-line code analysis.

```bash
npx zapcircle review
```

You'll also get a summary review from the LLM that will tell you broader-level things you can improve with your code.

## Using ZapCircle with GitHub Actions for Pull Requests

The most likely case to use this is with pull requests - ZapCircle can run as a GitHub Action when you open a pull request on GitHub.

ZapCircle will not block any merges, no matter how egregious the code review is - it simply offers suggestions.

Passing the `--github` flag to the `review` command sends the output to GitHub, rather than writing it to the console.

```bash
npx zapcircle review --github
```

In most cases, you'll want to set this up as a GitHub Action inside your repository.

## Sample GitHub Actions YML file

The GitHub Action definition below would go into the `.github/workflows` directory of your repository, with a name like `zapcircle-review.yml`.

You will need to configure an `OPENAI_API_KEY` repository secret as well. This can be found on GitHub's **Settings** page for your repository, under the **Secrets and variables** menu and then within the **Actions** menu item.

```yml
name: ZapCircle Review

on:
  pull_request:

jobs:
  zapcircle_review:
    name: ZapCircle PR Review
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  
          
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install ZapCircle CLI
        run: npm install -g zapcircle

      - name: Run ZapCircle Review
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          npx zapcircle review --github
```

The results will appear in your GitHub pull request. Any updates to the branch after the pull request is opened will trigger another run of the review process, and the summary and issues will be replaced by the latest results.