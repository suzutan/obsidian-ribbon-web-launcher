import { App, Plugin, PluginSettingTab, Setting, Modal, TextComponent, WorkspaceLeaf } from 'obsidian';

type IconType = 'favicon' | 'lucide' | 'custom';

interface RibbonLink {
	id: string;
	url: string;
	label: string;
	icon: string;
	iconType: IconType;
	customIconUrl: string;
}

interface RibbonUrlLinksSettings {
	links: RibbonLink[];
}

const DEFAULT_SETTINGS: RibbonUrlLinksSettings = {
	links: []
};

export default class RibbonUrlLinksPlugin extends Plugin {
	settings: RibbonUrlLinksSettings;
	ribbonIcons: HTMLElement[] = [];
	leafMap: Map<string, WorkspaceLeaf> = new Map();

	async onload() {
		await this.loadSettings();

		// Migrate old links
		this.settings.links.forEach(link => {
			if (!link.iconType) {
				link.iconType = 'lucide';
			}
			if (!link.customIconUrl) {
				link.customIconUrl = '';
			}
		});

		this.refreshRibbonIcons();
		this.addSettingTab(new RibbonUrlLinksSettingTab(this.app, this));
	}

	onunload() {
		this.ribbonIcons.forEach(icon => icon.remove());
		this.ribbonIcons = [];
		this.leafMap.clear();
	}

	refreshRibbonIcons() {
		this.ribbonIcons.forEach(icon => icon.remove());
		this.ribbonIcons = [];

		this.settings.links.forEach(link => {
			const lucideIcon = link.iconType === 'lucide' ? link.icon : 'globe';
			const ribbonIcon = this.addRibbonIcon(
				lucideIcon,
				link.label,
				async () => {
					await this.openUrlInWebViewer(link.id, link.url);
				}
			);

			if (link.iconType === 'favicon' && link.url) {
				this.applyImageIcon(ribbonIcon, this.getFaviconUrl(link.url));
			} else if (link.iconType === 'custom' && link.customIconUrl) {
				this.applyImageIcon(ribbonIcon, link.customIconUrl);
			}

			this.ribbonIcons.push(ribbonIcon);
		});
	}

	getFaviconUrl(url: string): string {
		try {
			const domain = new URL(url).hostname;
			return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
		} catch {
			return '';
		}
	}

	applyImageIcon(ribbonIcon: HTMLElement, imageUrl: string) {
		if (!imageUrl) return;

		const svgEl = ribbonIcon.querySelector('.svg-icon');
		if (svgEl) {
			const img = document.createElement('img');
			img.src = imageUrl;
			img.width = 18;
			img.height = 18;
			img.classList.add('ribbon-url-links-favicon');
			img.onerror = () => {
				img.replaceWith(svgEl);
			};
			svgEl.replaceWith(img);
		}
	}

	async openUrlInWebViewer(linkId: string, url: string) {
		const existingLeaf = this.leafMap.get(linkId);
		if (existingLeaf) {
			const allLeaves = this.app.workspace.getLeavesOfType('webviewer');
			if (allLeaves.includes(existingLeaf)) {
				this.app.workspace.setActiveLeaf(existingLeaf, { focus: true });
				return;
			}
			this.leafMap.delete(linkId);
		}

		const leaf = this.app.workspace.getLeaf('tab');
		await leaf.setViewState({
			type: 'webviewer',
			state: {
				url: url,
				navigate: true,
			},
			active: true,
		});

		this.leafMap.set(linkId, leaf);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class LinkModal extends Modal {
	plugin: RibbonUrlLinksPlugin;
	link: RibbonLink | null;
	onSave: (link: RibbonLink) => void;

	labelInput: TextComponent;
	urlInput: TextComponent;
	iconInput: TextComponent;
	customIconUrlInput: TextComponent;
	iconType: IconType;
	lucideSettingEl: Setting | null = null;
	customUrlSettingEl: Setting | null = null;

	constructor(app: App, plugin: RibbonUrlLinksPlugin, link: RibbonLink | null, onSave: (link: RibbonLink) => void) {
		super(app);
		this.plugin = plugin;
		this.link = link;
		this.onSave = onSave;
		this.iconType = link?.iconType || 'favicon';
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl('h2', { text: this.link ? 'Edit Link' : 'Add New Link' });

		new Setting(contentEl)
			.setName('Label')
			.setDesc('The text shown when hovering over the ribbon icon')
			.addText(text => {
				this.labelInput = text;
				text
					.setPlaceholder('e.g., Gmail, Confluence')
					.setValue(this.link?.label || '');
			});

		new Setting(contentEl)
			.setName('URL')
			.setDesc('The web address to open')
			.addText(text => {
				this.urlInput = text;
				text
					.setPlaceholder('e.g., https://mail.google.com')
					.setValue(this.link?.url || '');
			});

		new Setting(contentEl)
			.setName('Icon type')
			.setDesc('Choose how the ribbon icon is displayed')
			.addDropdown(dropdown => {
				dropdown
					.addOption('favicon', 'Favicon (auto from URL)')
					.addOption('custom', 'Custom image URL')
					.addOption('lucide', 'Lucide icon (manual)')
					.setValue(this.iconType)
					.onChange((value: string) => {
						this.iconType = value as IconType;
						this.toggleConditionalSettings();
					});
			});

		// Custom image URL setting
		this.customUrlSettingEl = new Setting(contentEl)
			.setName('Image URL')
			.setDesc('Direct URL to an icon image (e.g., Gmail icon URL)')
			.addText(text => {
				this.customIconUrlInput = text;
				text
					.setPlaceholder('https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico')
					.setValue(this.link?.customIconUrl || '');
			});

		// Lucide icon name setting
		this.lucideSettingEl = new Setting(contentEl)
			.setName('Icon name')
			.setDesc('Lucide icon name (see lucide.dev)')
			.addText(text => {
				this.iconInput = text;
				text
					.setPlaceholder('e.g., globe, link, bookmark')
					.setValue(this.link?.icon || 'link');
			});

		this.toggleConditionalSettings();

		new Setting(contentEl)
			.addButton(button => button
				.setButtonText('Save')
				.setCta()
				.onClick(() => {
					const label = this.labelInput.getValue().trim();
					const url = this.urlInput.getValue().trim();
					const icon = this.iconInput.getValue().trim() || 'link';
					const customIconUrl = this.customIconUrlInput.getValue().trim();

					if (!label) {
						return;
					}

					const savedLink: RibbonLink = {
						id: this.link?.id || `link-${Date.now()}`,
						label,
						url,
						icon,
						iconType: this.iconType,
						customIconUrl,
					};

					this.onSave(savedLink);
					this.close();
				}))
			.addButton(button => button
				.setButtonText('Cancel')
				.onClick(() => {
					this.close();
				}));
	}

	toggleConditionalSettings() {
		if (this.lucideSettingEl) {
			this.lucideSettingEl.settingEl.style.display =
				this.iconType === 'lucide' ? '' : 'none';
		}
		if (this.customUrlSettingEl) {
			this.customUrlSettingEl.settingEl.style.display =
				this.iconType === 'custom' ? '' : 'none';
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class RibbonUrlLinksSettingTab extends PluginSettingTab {
	plugin: RibbonUrlLinksPlugin;

	constructor(app: App, plugin: RibbonUrlLinksPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Ribbon URL Links Settings' });

		containerEl.createEl('p', {
			text: 'Add custom URL links that will appear as icons in the left ribbon sidebar.'
		});

		new Setting(containerEl)
			.setName('Add new link')
			.setDesc('Add a new URL link to the ribbon')
			.addButton(button => button
				.setButtonText('Add Link')
				.setCta()
				.onClick(() => {
					new LinkModal(this.app, this.plugin, null, async (link) => {
						this.plugin.settings.links.push(link);
						await this.plugin.saveSettings();
						this.plugin.refreshRibbonIcons();
						this.display();
					}).open();
				}));

		this.plugin.settings.links.forEach((link, index) => {
			let iconDesc: string;
			if (link.iconType === 'favicon') {
				iconDesc = 'Favicon (auto)';
			} else if (link.iconType === 'custom') {
				iconDesc = 'Custom image';
			} else {
				iconDesc = `Lucide: ${link.icon}`;
			}
			new Setting(containerEl)
				.setName(link.label || `Link ${index + 1}`)
				.setDesc(`URL: ${link.url || '(not set)'} | ${iconDesc}`)
				.addButton(button => button
					.setButtonText('Edit')
					.onClick(() => {
						new LinkModal(this.app, this.plugin, link, async (updatedLink) => {
							this.plugin.settings.links[index] = updatedLink;
							await this.plugin.saveSettings();
							this.plugin.refreshRibbonIcons();
							this.display();
						}).open();
					}))
				.addButton(button => button
					.setButtonText('Delete')
					.setWarning()
					.onClick(async () => {
						this.plugin.settings.links.splice(index, 1);
						await this.plugin.saveSettings();
						this.plugin.refreshRibbonIcons();
						this.display();
					}));
		});

		if (this.plugin.settings.links.length === 0) {
			containerEl.createEl('p', {
				cls: 'setting-item-description',
				text: 'No links added yet. Click "Add Link" to get started!'
			});
		}

		containerEl.createEl('p', {
			cls: 'setting-item-description',
			text: 'Icon types: "Favicon" auto-fetches from URL domain. "Custom image URL" lets you specify any image URL directly. "Lucide" uses lucide.dev icons.'
		});
	}
}
