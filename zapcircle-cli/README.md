# ZapCircle: Behavior-Driven Development for your Development Workflow

ZapCircle is a cutting-edge **Behavior-Driven Development (BDD)** command line tool that integrates seamlessly into your development workflow. It helps developers bridge the gap between human-readable behaviors and production-ready code, enabling faster iterations, fewer bugs, and a deeper understanding of your application.

Initially, we're focused on being excellent for front end developers - specifically for JSX and TSX React components.

🚀 **ZapCircle lets developers:**

- **Analyze** existing components to generate `.zap.toml` behavior files.
- **Generate** new components directly from behavior definitions.
- **Update** components with confidence, guided by behavior-driven insights.

### Why ZapCircle?

ZapCircle takes BDD to the next level by leveraging modern technologies like **LLMs** to generate, maintain, and evolve your code. It's a little different from the old behavior-driven test cases you might be familiar with.

---

## ✨ Features

- **Behavior-First Development:** Define your components using `.zap.toml` files.
- **LLM-Powered:** Use your preferred AI model to assist in code creation. Currently supporting OpenAI, Google Gemini, Anthropic/Claude, and local LLMs through LangChain.
- **Component Drift Detection:** Automatically track and resolve inconsistencies between your code and behaviors. Coming soon!
- **Seamless Integration:** Works with your favorite frameworks like React, Next.js, and Remix/React Router.
- **Open Source:** ZapCircle is licensed under the MIT License.

---

## 🔧 Usage

### Analyze Existing Components

ZapCircle inspects your current codebase and generates behavior definitions in `.zap.toml` files:

```bash
npx zapcircle analyze jsx ./src/components
```

ZapCircle works by filetype, so specify the extension (such as jsx or tsx) for the files you want analyzed.

You can also analyze just one component at a time:

```bash
npx zapcircle analyze jsx ./src/components/LoginForm.jsx
```

### Create New Components

Generate React components from `.zap.toml` behavior files:

```bash
npx zapcircle generate jsx ./src/components/LoginForm.jsx.zap.toml
```

### Update Components

Sync existing components to align with updated behaviors (Coming Soon!):

```bash
npx zapcircle update
```

### Choose Your LLM

Select the AI model that fits your team’s needs with environment variables.

We're building on top of [LangChain](https://js.langchain.com/docs/introduction/).

```bash
OPENAI_API_KEY=secret
LLM_MODEL=gpt-4o-mini
```

---

## 🌟 Example Workflow

1. **Analyze**: Start with existing components to generate `.zap.toml` files.
2. **Edit**: Modify or extend behaviors to meet new requirements.
3. **Generate**: Create new components from these behaviors.
4. **Refactor**: Update components with behavior-driven insights, ensuring code stays aligned with design intent.

---

## 📖 Documentation

Visit our full documentation for a complete guide, API references, and tutorials: [ZapCircle Docs](https://www.zapcircle.com/)

---

## 🤝 Contributing

We’d love your help! Whether you want to report a bug, suggest a feature, or contribute code, check out our [Contributing Guide](CONTRIBUTING.md).

1. Fork the repo.
2. Create a feature branch: `git checkout -b feature/awesome-new-ai-feature`.
3. Commit your changes: `git commit -m 'feat:Add awesome new AI feature'`.
4. Push your branch: `git push origin feature/amazing-new-ai-feature`.
5. Open a Pull Request.

---

## 📢 Community and Support

- 💬 Join the discussions on [GitHub](https://github.com/jefflinwood/zapcircle).
- 🐦 Follow us on [Twitter/X](https://twitter.com/jefflinwood).
- 📧 Have questions? Email us at support@zapcircle.com.

---

## 🚀 Roadmap

Here's what we're working on next:

- 📋 Workflow for making changes to behaviors, and seeing that reflected in components.
- 🎨 Generating unit tests from the behaviors and the source code.
- 📊 Rolling up individual component behavior into an application-wide dashboard for insights.
- Supporting additional types of source code above and beyond React components.

---

## 🛡️ License

ZapCircle is released under the [MIT License](LICENSE).

---

Let us know what you think! Contributions, feedback, and ideas are always welcome.
