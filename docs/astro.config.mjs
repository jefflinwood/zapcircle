// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://www.zapcircle.com',
	integrations: [
		starlight({
			title: 'ZapCircle',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/jefflinwood/zapcircle' },
			],
			sidebar: [
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Getting Started', slug: 'guides/getting-started' },
						{ label: 'Create Behaviors', slug: 'guides/create-behaviors'},
						{ label: 'Generating Code', slug: 'guides/generating-code'},
						{ label: 'Generating Tests', slug: 'guides/generating-tests'},
						{ label: 'Updating Code', slug: 'guides/updating-code'},
						{ label: 'Reviewing Changes', slug: 'guides/reviewing-changes'},
						{ label: 'New Project', slug: 'guides/new-project'},
					],
				},
				{
					label: 'Agent',
					items: [
						{ label: 'Working with Agent', slug: 'guides/working-with-agent'}
					],
				},
				{
					label: 'Advanced',
					items: [
						{ label: 'Customizing Prompts', slug: 'guides/customizing-prompts'}
					],
				},
				{
					label: 'Concepts',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Behavior-Driven Development', slug: 'concepts/behavior-driven-development' },
						{ label: 'Developer Workflow', slug: 'concepts/developer-workflow'}
					],
				},
				{
					label: 'Behaviors',
					autogenerate: { directory: 'behaviors/front-end' },
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
			],
		}),
	],
});
