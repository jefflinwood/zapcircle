# ZapCircle: Behavior-Driven Development for Your Codebase

ZapCircle is a modern **Behavior-Driven Development (BDD)** tool for front-end developers. It bridges the gap between **human intent** and **production-grade code**, helping you ship faster, reduce bugs, and keep your code aligned with design intent.

Built with React developers in mind, ZapCircle lets you **analyze**, **generate**, and **refactor** components using plain-English behaviors — stored in `.zap.toml` files — powered by your choice of LLM.

You can use ZapCircle with your existing code base, with no dependencies. If you want to stop using ZapCircle as a development assistant, nothing will break.

---

## 🚀 What You Can Do with ZapCircle

- **Have an LLM Review your Code**
  Take all the code you've changed - unstaged, staged, and committed, and get an LLM to do a code review before you create a pull request, by running one command:
  ```bash
  npx zapcircle review
  ```
  You can also use ZapCircle to review your pull requests, as a GitHub Action.
  Works on any type of project, not just React.

- **Create New Projects Instantly**  
  Scaffold a full React Router app with Tailwind, a NavBar, a Dashboard, and behaviors — all with one prompt:
  ```bash
  npx zapcircle new
  ```

- **Analyze Existing Components**  
  Generate behavior definitions from code:
  ```bash
  npx zapcircle analyze jsx ./src/components
  ```

- **Generate New Components**  
  Use `.zap.toml` behavior files to create React components:
  ```bash
  npx zapcircle generate jsx ./src/components/LoginForm.jsx.zap.toml
  ```

- **Update Existing Components** (Coming Soon!)  
  Sync your code with evolving behaviors:
  ```bash
  npx zapcircle update
  ```

---

## ✨ Key Features

- 🧠 **Behavior-First Development**: Define intent in `.zap.toml`, not just code.
- 🤖 **LLM-Powered**: Works with OpenAI, Claude, Gemini, and more via LangChain.
- 🧪 **Local Review**: Run `npx zapcircle review` to get AI code reviews before PRs.
- 🔍 **Component Drift Detection** (coming soon): Know when code drifts from behavior.
- 🧰 **CLI-First Design**: No IDE plugin required. Everything runs locally.
- 🌐 **React-Friendly**: Supports JSX/TSX with Next.js and Remix/React Router.

---

## 🛠️ Quick Start

Install and configure ZapCircle with your LLM details:

```bash
npx zapcircle configure
```

Try ZapCircle on a new project with:

```bash
npx zapcircle new
```

Then follow the prompts to describe your app, generate components, and start developing.

---

## 🔁 Typical Workflow

1. **New**: Generate a full React + Tailwind app scaffold.
2. **Analyze**: Create `.zap.toml` behavior files from existing components.
3. **Edit**: Tweak behavior descriptions for new use cases.
4. **Generate**: Produce new components directly from the updated behaviors.
5. **Review**: Use `zapcircle review` to catch issues before making a pull request.

---

## 📚 Documentation

Need examples, guides, or advanced configuration?  
👉 Visit [zapcircle.com](https://www.zapcircle.com/) for full documentation.


---
## 🤖 Architecture

### 🧩 Layer 3: UI/UX Integrations (Future)

| Studio (planned) | Fire Extension (planned) | VS Code Plugin (planned) |
|------------------|----------------|---------------------------|

---

### 🧠 Layer 2: Composite Features

| `new` | `distill` | `architect` | `agent` (run/chat)` |
|-------|-----------|-------------|----------------------|

---

### ⚙️ Layer 1: Primary Capabilities

| `generate` | `analyze` | `review` | `updateCode` | `generateTests` |
|------------|-----------|----------|--------------|------------------|

---

### 🧱 Layer 0: Core Services (Foundations)

| Prompt Loader | invokeLLM | Context Builder | File I/O + Diff |
|---------------|-----------|------------------|------------------|

---

## 💬 Community & Support

- 🐙 GitHub: [github.com/jefflinwood/zapcircle](https://github.com/jefflinwood/zapcircle)
- 🧵 Twitter/X: [@jefflinwood](https://twitter.com/jefflinwood)
- 📬 Email: support@zapcircle.com

---

## 🤝 Contributing

We welcome contributions!

```bash
git clone https://github.com/jefflinwood/zapcircle
cd zapcircle
npm install
```

Then follow the [Contributing Guide](CONTRIBUTING.md) to open a PR.

---

## 🪪 License

ZapCircle is released under the [MIT License](LICENSE).

---

**ZapCircle** helps you code like you mean it — with clarity, intent, and lightning speed.
