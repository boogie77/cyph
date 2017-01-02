import {
	ChangeDetectorRef,
	Component,
	ElementRef,
	Input,
	OnChanges,
	SimpleChanges
} from '@angular/core';
import * as clipboard from 'clipboard-js';
import {Timer} from '../../timer';
import {util} from '../../util';
import {ChatService} from '../services/chat.service';
import {ConfigService} from '../services/config.service';
import {DialogService} from '../services/dialog.service';
import {EnvService} from '../services/env.service';
import {SessionService} from '../services/session.service';
import {StringsService} from '../services/strings.service';


/**
 * Angular component for a link-based initial connection screen
 * (e.g. for starting a new cyph).
 */
@Component({
	selector: 'cyph-link-connection',
	templateUrl: '../../../../templates/link-connection.html'
})
export class LinkConnectionComponent implements OnChanges {
	/** @ignore */
	private isInitiated: boolean;

	/** @ignore */
	private linkConstant: string;

	/** @ignore */
	private readonly addTimeLock: {}	= {};

	/** @ignore */
	private readonly copyLock: {}		= {};

	/** Base URL to use before the hash in new link. */
	@Input() public baseUrl: string;

	/** Indicates whether advanced features UI should be displayed. */
	@Input() public enableAdvancedFeatures: boolean;

	/** Indicates whether the advanced features menu is open. */
	public advancedFeatures: boolean;

	/** Indicates whether this link connection was initiated passively via API integration. */
	public isPassive: boolean;

	/** The link to join this connection. */
	public link: string;

	/** URL-encoded version of this link (for sms and mailto links). */
	public linkEncoded: string;

	/** Counts down until link expires. */
	public timer: Timer;

	/** Draft of queued message. */
	public queuedMessageDraft: string	= '';

	/**
	 * Extends the countdown duration.
	 * @param milliseconds
	 */
	public async addTime (milliseconds: number) : Promise<void> {
		this.timer.addTime(milliseconds);

		return util.lockTryOnce(
			this.addTimeLock,
			async () => {
				await this.dialogService.toast({
					content: this.stringsService.timeExtended,
					delay: 2500
				});
			}
		);
	}

	/** Copies link to clipboard. */
	public async copyToClipboard () : Promise<void> {
		return util.lockTryOnce(
			this.copyLock,
			async () => {
				await clipboard.copy(this.linkConstant);
				await this.dialogService.toast({
					content: this.stringsService.linkCopied,
					delay: 2500
				});
			}
		);
	}

	/** @inheritDoc */
	public async ngOnChanges (_CHANGES: SimpleChanges) : Promise<void> {
		if (this.isInitiated || !this.baseUrl) {
			return;
		}

		this.isInitiated	= true;
		let isWaiting		= true;

		this.linkConstant	=
			this.baseUrl +
			(this.baseUrl.indexOf('#') > -1 ? '' : '#') +
			this.sessionService.state.sharedSecret
		;

		this.linkEncoded	= encodeURIComponent(this.linkConstant);
		this.link			= this.linkConstant;
		this.isPassive		= this.sessionService.state.wasInitiatedByAPI;

		const $element		= $(this.elementRef.nativeElement);

		if (this.envService.isMobile) {
			const $connectLinkLink	= await util.waitForIterable(
				() => $element.find('.connect-link-link')
			);

			/* Only allow right-clicking (for copying the link) */
			$connectLinkLink.click(e => e.preventDefault());
		}
		else {
			const $connectLinkInput	= await util.waitForIterable(
				() => $element.find('.connect-link-input input')
			);

			const connectLinkInput	= <HTMLInputElement> $connectLinkInput[0];

			/* Temporary workaround pending TypeScript fix. */
			/* tslint:disable-next-line:ban  */
			setTimeout(async () => {
				while (isWaiting) {
					await util.sleep(1000);

					if (this.advancedFeatures) {
						continue;
					}

					if (this.link !== this.linkConstant) {
						this.link	= this.linkConstant;
					}

					$connectLinkInput.focus();
					connectLinkInput.setSelectionRange(0, this.linkConstant.length);
				}
			});
		}

		this.timer	= new Timer(
			this.configService.cyphCountdown,
			false,
			this.changeDetectorRef
		);

		this.sessionService.one(this.sessionService.events.connect).then(() => {
			isWaiting			= false;
			this.link			= '';
			this.linkConstant	= '';
			this.linkEncoded	= '';

			this.timer.stop();
		});

		await this.timer.start();

		if (isWaiting) {
			this.chatService.abortSetup();
		}
	}

	constructor (
		/** @ignore */
		private readonly changeDetectorRef: ChangeDetectorRef,

		/** @ignore */
		private readonly elementRef: ElementRef,

		/** @ignore */
		private readonly configService: ConfigService,

		/** @ignore */
		private readonly dialogService: DialogService,

		/** @ignore */
		private readonly sessionService: SessionService,

		/** @ignore */
		private readonly stringsService: StringsService,

		/** @see ChatService */
		public readonly chatService: ChatService,

		/** @see EnvService */
		public readonly envService: EnvService
	) {}
}
