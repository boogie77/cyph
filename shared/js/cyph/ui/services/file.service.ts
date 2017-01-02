import {Injectable} from '@angular/core';
import {potassium} from '../../crypto/potassium';
import {UIEvents} from '../../files/enums';
import {Files} from '../../files/files';
import {Transfer} from '../../files/transfer';
import {util} from '../../util';
import {ChatService} from './chat.service';
import {ConfigService} from './config.service';
import {DialogService} from './dialog.service';
import {SessionService} from './session.service';
import {StringsService} from './strings.service';


/**
 * Manages file transfers.
 */
@Injectable()
export class FileService {
	/** @see Files */
	public readonly files: Files;

	/** @ignore */
	private addImage (transfer: Transfer, plaintext: Uint8Array) : void {
		this.chatService.addMessage(
			`![](data:${transfer.fileType};base64,${potassium.toBase64(plaintext)})` +
				`\n\n#### ${transfer.name}`
			,
			transfer.author,
			undefined,
			undefined,
			transfer.imageSelfDestructTimeout
		);
	}

	/** @ignore */
	private async compressImage (image: HTMLImageElement, file: File) : Promise<Uint8Array> {
		const canvas: HTMLCanvasElement			= document.createElement('canvas');
		const context: CanvasRenderingContext2D	=
			<CanvasRenderingContext2D> canvas.getContext('2d')
		;

		let widthFactor: number		= this.configService.filesConfig.maxImageWidth / image.width;
		let heightFactor: number	= this.configService.filesConfig.maxImageWidth / image.height;

		if (widthFactor > 1) {
			widthFactor		= 1;
		}
		if (heightFactor > 1) {
			heightFactor	= 1;
		}

		const factor: number	= Math.min(widthFactor, heightFactor);

		canvas.width	= image.width * factor;
		canvas.height	= image.height * factor;

		context.drawImage(image, 0, 0, canvas.width, canvas.height);

		const hasTransparency: boolean	=
			file.type !== 'image/jpeg' &&
			context.getImageData(0, 0, image.width, image.height).data[3] !== 255
		;

		const outputType: string|undefined		= !hasTransparency ? 'image/jpeg' : undefined;
		const outputQuality: number|undefined	= !hasTransparency ?
			Math.min(960 / Math.max(canvas.width, canvas.height), 1) :
			undefined
		;

		if (canvas.toBlob) {
			return new Promise<Uint8Array>(resolve => { canvas.toBlob(
				(blob: Blob) => {
					const reader	= new FileReader();
					reader.onload	= () => { resolve(new Uint8Array(reader.result)); };
					reader.readAsArrayBuffer(blob);
				},
				outputType,
				outputQuality
			); });
		}
		else {
			return potassium.fromBase64(
				canvas.toDataURL(outputType, outputQuality).split(',')[1]
			);
		}
	}

	/**
	 * Sends file.
	 * @param file
	 * @param image If true, file is processed as an image
	 * (compressed and displayed in the message list).
	 * @param imageSelfDestructTimeout
	 */
	public async send (
		file: File,
		image: boolean = file.type.indexOf('image/') === 0,
		imageSelfDestructTimeout?: number
	) : Promise<void> {
		const plaintext	= await new Promise<Uint8Array>(resolve => {
			const reader	= new FileReader();

			if (image && file.type !== 'image/gif') {
				reader.onload	= () => {
					const img	= document.createElement('img');
					img.onload	= () => { resolve(this.compressImage(img, file)); };
					img.src		= reader.result;
				};

				reader.readAsDataURL(file);
			}
			else {
				reader.onload	= () => { resolve(new Uint8Array(reader.result)); };
				reader.readAsArrayBuffer(file);
			}
		});

		this.files.send(
			plaintext,
			file.name,
			file.type,
			image,
			imageSelfDestructTimeout
		);
	}

	constructor (
		/** @ignore */
		private readonly chatService: ChatService,

		/** @ignore */
		private readonly configService: ConfigService,

		/** @ignore */
		private readonly dialogService: DialogService,

		/** @ignore */
		private readonly sessionService: SessionService,

		/** @ignore */
		private readonly stringsService: StringsService
	) {
		this.files	= new Files(this.sessionService);

		this.sessionService.on(
			this.sessionService.events.filesUI,
			async (e: {
				event: UIEvents;
				args: any[];
			}) => {
				switch (e.event) {
					case UIEvents.completed: {
						const transfer: Transfer	= e.args[0];
						const plaintext: Uint8Array	= e.args[1];

						if (transfer.answer && transfer.image) {
							this.addImage(transfer, plaintext);
						}
						else {
							const message: string	= transfer.answer ?
								this.stringsService.outgoingFileSaved :
								this.stringsService.outgoingFileRejected
							;

							this.chatService.addMessage(
								`${message} ${transfer.name}`,
								this.sessionService.users.app
							);
						}
						break;
					}
					case UIEvents.confirm: {
						const transfer: Transfer				= e.args[0];
						const isSave: boolean					= e.args[1];
						const callback: (ok: boolean) => void	= e.args[2];

						const title	=
							`${this.stringsService.incomingFile} ${transfer.name} ` +
							`(${util.readableByteLength(transfer.size)})`
						;

						callback(
							(
								!isSave &&
								transfer.size < this.configService.filesConfig.approvalLimit
							) ||
							(isSave && transfer.image) ||
							await this.dialogService.confirm({
								title,
								cancel: isSave ?
									this.stringsService.discard :
									this.stringsService.reject
								,
								content: isSave ?
									this.stringsService.incomingFileSave :
									this.stringsService.incomingFileDownload
								,
								ok: isSave ?
									this.stringsService.save :
									this.stringsService.accept
							})
						);
						break;
					}
					case UIEvents.rejected: {
						const transfer: Transfer	= e.args[0];

						this.chatService.addMessage(
							`${this.stringsService.incomingFileRejected} ${transfer.name}`,
							this.sessionService.users.app,
							undefined,
							false
						);
						break;
					}
					case UIEvents.save: {
						const transfer: Transfer	= e.args[0];
						const plaintext: Uint8Array	= e.args[1];

						if (transfer.image) {
							this.addImage(transfer, plaintext);
						}
						else {
							util.saveFile(plaintext, transfer.name);
						}
						break;
					}
					case UIEvents.started: {
						const transfer: Transfer	= e.args[0];

						const message: string	=
							transfer.author === this.sessionService.users.me ?
								this.stringsService.fileTransferInitMe :
								this.stringsService.fileTransferInitFriend
						;

						if (!transfer.image) {
							this.chatService.addMessage(
								`${message} ${transfer.name}`,
								this.sessionService.users.app
							);
						}
						break;
					}
					case UIEvents.tooLarge: {
						this.dialogService.alert({
							content: this.stringsService.fileTooLarge,
							ok: this.stringsService.ok,
							title: this.stringsService.oopsTitle
						});
						break;
					}
				}
			}
		);
	}
}
