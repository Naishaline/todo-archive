import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	archivePath: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	archivePath: ''
}




//Thank you stackoverflow
function getFormattedDate(date: Date) {
    let year = date.getFullYear();
    let month = (1 + date.getMonth()).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
	let hour = date.getHours().toString().padStart(2, '0');
	let minute = date.getMinutes().toString().padStart(2, '0');
	let second = date.getSeconds().toString().padStart(2, '0');
  
    return month + '-' + day + '-' + year;
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		this.registerEvent(this.app.vault.on('rename', async (file, oldPath) => {
			const path = file.path.slice(0, -file.name.length-1);
			const oldSlug = oldPath.slice(0, -oldPath.split("/").last().length-1)
			if(path == this.settings.archivePath && path != oldSlug) {
				const date = new Date;
				//console.log(fileButTFile)
				if(file instanceof	TFile) {
					this.app.vault.copy(file, oldSlug + "/" + file.name)
					this.app.fileManager.renameFile(file, path+"/"+getFormattedDate(date)+" "+file.name);
				}
			}
		}));
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Daily Todo Archive Settings.'});

		new Setting(containerEl)
			.setName('Archive Folder')
			.setDesc('Folder to drag into for archiving.')
			.addText(text => text
				.setPlaceholder('Daily Todo Archive')
				.setValue(this.plugin.settings.archivePath)
				.onChange(async (value) => {
					this.plugin.settings.archivePath = value;
					await this.plugin.saveSettings();
				}));
	}
}
