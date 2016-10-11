/**
 * @file Entry point of cyph.im.
 */


/// <reference path="../preload/crypto.ts" />
/// <reference path="../preload/unsupportedbrowsers.ts" />
/// <reference path="../preload/dompurify.ts" />
/// <reference path="../preload/jquery.ts" />
/// <reference path="../preload/translations.ts" />

import {AppModule} from './appmodule';
import {BetaStates, States, UrlSections} from './enums';
import {UI} from './ui';
import {Loaded} from '../preload';
import * as Cyph from '../cyph';


if (Cyph.Env.isEdge) {
	location.pathname	= '/unsupportedbrowser';
}


Cyph.UI.Elements.html.attr('ng-controller', Cyph.Config.angularConfig.rootController);

angular.
	module(Cyph.Config.angularConfig.rootModule, [
		'ngMaterial',
		'timer',
		Cyph.UI.Components.ChatCyphertext.title,
		Cyph.UI.Components.ChatMain.title,
		Cyph.UI.Components.ChatMessageBox.title,
		Cyph.UI.Components.ChatToolbar.title,
		Cyph.UI.Components.Contact.title,
		Cyph.UI.Components.LinkConnection.title,
		Cyph.UI.Components.Beta.title,
		Cyph.UI.Components.SignupForm.title,
		Cyph.UI.Components.StaticCyphNotFound.title,
		Cyph.UI.Components.StaticCyphSpinningUp.title,
		Cyph.UI.Components.StaticFooter.title,
		Cyph.UI.Directives.Markdown.title
	]).
	controller(Cyph.Config.angularConfig.rootController, [
		'$scope',
		'$mdDialog',
		'$mdToast',

		($scope, $mdDialog, $mdToast) => {
			self['Cyph']	= Cyph;
			$scope.Cyph		= Cyph;
			$scope.Cyph.im	= {
				BetaStates,
				States,
				UI,
				UrlSections
			};

			$(() => {
				Cyph.UI.Elements.load();

				const controller: Cyph.IController			= new Cyph.Controller();
				const dialogManager: Cyph.UI.IDialogManager	= new Cyph.UI.DialogManager($mdDialog, $mdToast);
				const notifier: Cyph.UI.INotifier			= new Cyph.UI.Notifier();

				$scope.ui	= new UI(controller, dialogManager, notifier);
				self['ui']	= $scope.ui;

				controller.update();
			});
		}
	]).
	config(Cyph.Config.angularConfig.config)
;


AppModule.upgradeAdapter.bootstrap(
	document.documentElement,
	[Cyph.Config.angularConfig.rootModule]
);


export {Loaded};
