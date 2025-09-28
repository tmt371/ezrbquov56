// File: 04-core-code/ui/right-panel-component.js

/**
 * @fileoverview A dedicated component for managing and rendering the Right Panel UI.
 */
export class RightPanelComponent {
    constructor(panelElement, eventAggregator) {
        if (!panelElement) {
            throw new Error("Panel element is required for RightPanelComponent.");
        }
        this.panelElement = panelElement;
        this.eventAggregator = eventAggregator;

        this.tabContainer = this.panelElement.querySelector('.tab-container');
        this.tabButtons = this.panelElement.querySelectorAll('.tab-button');
        this.tabContents = this.panelElement.querySelectorAll('.tab-content');

        this._cacheF2Elements();
        this.initialize();
        console.log("RightPanelComponent Initialized.");
    }

    initialize() {
        if (this.tabContainer) {
            this.tabContainer.addEventListener('click', (event) => {
                const target = event.target.closest('.tab-button');
                if (target && !target.disabled) {
                    this._setActiveTab(target);
                }
            });
        }

        // Add event listeners for all QTY input fields
        const qtyInputs = [
            this.f2.b10_wifiQty,
            this.f2.b13_deliveryQty,
            this.f2.b14_installQty,
            this.f2.b15_removalQty
        ];

        qtyInputs.forEach(input => {
            if (input) {
                input.addEventListener('input', (event) => {
                    this.eventAggregator.publish('f2QtyChanged', {
                        id: event.target.id,
                        value: event.target.value
                    });
                });
            }
        });
    }

    _cacheF2Elements() {
        const query = (id) => this.panelElement.querySelector(id);
        this.f2 = {
            b2_winderPrice: query('#f2-b2-winder-price'),
            b3_dualPrice: query('#f2-b3-dual-price'),
            b4_acceSum: query('#f2-b4-acce-sum'),
            b6_motorPrice: query('#f2-b6-motor-price'),
            b7_remotePrice: query('#f2-b7-remote-price'),
            b8_chargerPrice: query('#f2-b8-charger-price'),
            b9_cordPrice: query('#f2-b9-cord-price'),
            b10_wifiQty: query('#f2-b10-wifi-qty'),
            c10_wifiSum: query('#f2-c10-wifi-sum'),
            b11_eAcceSum: query('#f2-b11-e-acce-sum'),
            b13_deliveryQty: query('#f2-b13-delivery-qty'),
            c13_deliveryFee: query('#f2-c13-delivery-fee'),
            b14_installQty: query('#f2-b14-install-qty'),
            c14_installFee: query('#f2-c14-install-fee'),
            b15_removalQty: query('#f2-b15-removal-qty'),
            c15_removalFee: query('#f2-c15-removal-fee'),
            b16_surchargeFee: query('#f2-b16-surcharge-fee'),
            b17_mulPrice: query('#f2-b17-mul-price'),
            c17_1stRbPrice: query('#f2-c17-1st-rb-price'),
            b18_discount: query('#f2-b18-discount'),
            b19_disRbPrice: query('#f2-b19-dis-rb-price'),
            b20_singleprofit: query('#f2-b20-singleprofit'),
            b21_rbProfit: query('#f2-b21-rb-profit'),
            b22_sumprice: query('#f2-b22-sumprice'),
            b23_sumprofit: query('#f2-b23-sumprofit'),
            b24_gst: query('#f2-b24-gst'),
            b25_netprofit: query('#f2-b25-netprofit'),
        };
    }

    render(uiState) {
        this._renderF2Tab(uiState);
    }

    _renderF2Tab(uiState) {
        if (!uiState || !uiState.f2 || !this.f2.b2_winderPrice) return;
        
        const f2State = uiState.f2;
        const formatCurrency = (value) => (typeof value === 'number') ? `$${value.toFixed(2)}` : '$';
        const formatValue = (value) => (value !== null && value !== undefined) ? value : '';

        // Render values from main UI state
        this.f2.b2_winderPrice.textContent = formatCurrency(uiState.summaryWinderPrice);
        this.f2.b3_dualPrice.textContent = formatCurrency(uiState.dualPrice);
        this.f2.b6_motorPrice.textContent = formatCurrency(uiState.summaryMotorPrice);
        this.f2.b7_remotePrice.textContent = formatCurrency(uiState.summaryRemotePrice);
        this.f2.b8_chargerPrice.textContent = formatCurrency(uiState.summaryChargerPrice);
        this.f2.b9_cordPrice.textContent = formatCurrency(uiState.summaryCordPrice);

        // Render values from F2-specific state
        this.f2.b4_acceSum.textContent = formatCurrency(f2State.acceSum);
        this.f2.c10_wifiSum.textContent = formatCurrency(f2State.wifiSum);
        this.f2.b11_eAcceSum.textContent = formatCurrency(f2State.eAcceSum);
        this.f2.c13_deliveryFee.textContent = formatCurrency(f2State.deliveryFee);
        this.f2.c14_installFee.textContent = formatCurrency(f2State.installFee);
        this.f2.c15_removalFee.textContent = formatCurrency(f2State.removalFee);
        this.f2.b16_surchargeFee.textContent = formatCurrency(f2State.surchargeFee);
        
        // Render bottom section
        this.f2.b17_mulPrice.textContent = formatValue(f2State.mulPrice);
        this.f2.c17_1stRbPrice.textContent = formatValue(f2State.firstRbPrice);
        this.f2.b18_discount.textContent = formatValue(f2State.discount);
        this.f2.b19_disRbPrice.textContent = formatValue(f2State.disRbPrice);
        this.f2.b20_singleprofit.textContent = formatValue(f2State.singleprofit);
        this.f2.b21_rbProfit.textContent = formatValue(f2State.rbProfit);
        this.f2.b22_sumprice.textContent = formatValue(f2State.sumprice);
        this.f2.b23_sumprofit.textContent = formatValue(f2State.sumprofit);
        this.f2.b24_gst.textContent = formatValue(f2State.gst);
        this.f2.b25_netprofit.textContent = formatValue(f2State.netprofit);

        // Update input values from state
        this.f2.b10_wifiQty.value = f2State.wifiQty || '';
        this.f2.b13_deliveryQty.value = f2State.deliveryQty || '';
        this.f2.b14_installQty.value = f2State.installQty || '';
        this.f2.b15_removalQty.value = f2State.removalQty || '';
    }

    _setActiveTab(clickedButton) {
        const targetContentId = clickedButton.dataset.tabTarget;

        this.tabButtons.forEach(button => {
            button.classList.toggle('active', button === clickedButton);
        });

        this.tabContents.forEach(content => {
            content.classList.toggle('active', `#${content.id}` === targetContentId);
        });

        if (targetContentId === '#f2-content') {
            this.eventAggregator.publish('f2TabActivated');
        }
    }
}