import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {util} from '../../util';
import {ConfigService} from '../services/config.service';
import {EnvService} from '../services/env.service';


/**
 * Angular component for Braintree payment checkout UI.
 */
@Component({
	selector: 'cyph-checkout',
	templateUrl: '../../../../templates/checkout.html'
})
export class CheckoutComponent implements OnInit {
	/** Amount in dollars. */
	@Input() public amount: number;

	/** Item category ID number. */
	@Input() public category: number;

	/** Email address. */
	@Input() public email: string;

	/** Item ID number. */
	@Input() public item: number;

	/** Name. */
	@Input() public name: string;

	/** Indicates whether checkout is complete. */
	public complete: boolean;

	/** @inheritDoc */
	public async ngOnInit () : Promise<void> {
		const token: string	= await util.request({
			retries: 5,
			url: this.envService.baseUrl + this.configService.braintreeConfig.endpoint
		});

		const checkoutUI: JQuery	= $(this.elementRef.nativeElement).find('.braintree');

		checkoutUI.empty();

		(<any> self).braintree.setup(token, 'dropin', {
			container: checkoutUI[0],
			enableCORS: true,
			onPaymentMethodReceived: async (data: any) => {
				const response: string	= await util.request({
					data: {
						Amount: Math.floor(this.amount * 100),
						Category: this.category,
						Email: this.email,
						Item: this.item,
						Name: this.name,
						Nonce: data.nonce
					},
					method: 'POST',
					url: this.envService.baseUrl + this.configService.braintreeConfig.endpoint
				});

				if (JSON.parse(response).Status === 'authorized') {
					this.complete	= true;
				}
			}
		});
	}

	constructor (
		/** @ignore */
		private readonly elementRef: ElementRef,

		/** @ignore */
		private readonly configService: ConfigService,

		/** @ignore */
		private readonly envService: EnvService
	) {}
}
