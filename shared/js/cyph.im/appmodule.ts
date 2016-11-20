import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {UpgradeModule} from '@angular/upgrade/static';
import {
	Beta,
	ChatCyphertext,
	ChatMain,
	ChatMessageBox,
	Checkout,
	Contact,
	FileInput,
	LinkConnection,
	Markdown,
	SignupForm,
	StaticCyphNotFound,
	StaticCyphSpinningUp,
	StaticFooter
} from '../cyph/ui/components';
import {AppComponent} from './appcomponent';


@NgModule({
	declarations: [
		AppComponent,
		Beta,
		ChatCyphertext,
		ChatMain,
		ChatMessageBox,
		Checkout,
		Contact,
		FileInput,
		LinkConnection,
		Markdown,
		SignupForm,
		StaticCyphNotFound,
		StaticCyphSpinningUp,
		StaticFooter
	],
	entryComponents: [
		AppComponent
	],
	imports: [
		BrowserModule,
		CommonModule,
		UpgradeModule
	]
})
export class AppModule {
	public ngDoBootstrap () : void {}
}
