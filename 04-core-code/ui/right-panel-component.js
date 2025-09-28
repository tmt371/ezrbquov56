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
    }

    _cacheF2Elements() {
        this.f2 = {
            d1_acceSum: this.panelElement.querySelector('#f2-d1-acce-sum'),
            b2_winderPrice: this.panelElement.querySelector('#f2-b2-winder-price'),
            d2_dualPrice: this.panelElement.querySelector('#f2-d2-dual-price'),
            d3_eAcceSum: this.panelElement.querySelector('#f2-d3-e-acce-sum'),
            b4_motorPrice: this.panelElement.querySelector('#f2-b4-motor-price'),
            d4_remotePrice: this.panelElement.querySelector('#f2-d4-remote-price'),
            b5_chargerPrice: this.panelElement.querySelector('#f2-b5-charger-price'),
            d5_cordPrice: this.panelElement.querySelector('#f2-d5-cord-price'),
            b6_wifiQty: this.panelElement.querySelector('#f2-b6-wifi-qty'),
            c6_wifiSum: this.panelElement.querySelector('#f2-c6-wifi-sum'),
            d7_feeSum: this.panelElement.querySelector('#f2-d7-fee-sum'),
            b8_deliveryQty: this.panelElement.querySelector('#f2-b8-delivery-qty'),
            d8_deliveryFee: this.panelElement.querySelector('#f2-d8-delivery-fee'),
            b9_installQty: this.panelElement.querySelector('#f2-b9-install-qty'),
            d9_installFee: this.panelElement.querySelector('#f2-d9-install-fee'),
            b10_removalQty: this.panelElement.querySelector('#f2-b10-removal-qty'),
            d10_removalFee: this.panelElement.querySelector('#f2-d10-removal-fee'),
            b12_mulPrice: this.panelElement.querySelector('#f2-b12-mul-price'),
            d12_1stProfit: this.panelElement.querySelector('#f2-d12-1st-profit'),
            b13_discount: this.panelElement.querySelector('#f2-b13-discount'),
            d13_singleProfit: this.panelElement.querySelector('#f2-d13-single-profit'),
            b14_sumPrice: this.panelElement.querySelector('#f2-b14-sum-price'),
            d14_sumProfit: this.panelElement.querySelector('#f2-d14-sum-profit'),
            b15_gst: this.panelElement.querySelector('#f2-b15-gst'),
            d15_netProfit: this.panelElement.querySelector('#f2-d15-net-profit')
        };
    }

    render(uiState) {
        this._renderF2Tab(uiState);
    }

    _renderF2Tab(uiState) {
        if (!uiState || !uiState.f2) return;
        const f2State = uiState.f2;

        const formatCurrency = (value) => (typeof value === 'number') ? `$${value.toFixed(2)}` : '$';
        const formatValue = (value, prefix = '', suffix = '') => (value !== null && value !== undefined) ? `${prefix}${value}${suffix}` : '';

        // Update display values
        this.f2.b2_winderPrice.textContent = formatCurrency(uiState.summaryWinderPrice);
        this.f2.d2_dualPrice.textContent = formatCurrency(uiState.dualPrice);
        this.f2.b4_motorPrice.textContent = formatCurrency(uiState.summaryMotorPrice);
        this.f2.d4_remotePrice.textContent = formatCurrency(uiState.summaryRemotePrice);
        this.f2.b5_chargerPrice.textContent = formatCurrency(uiState.summaryChargerPrice);
        this.f2.d5_cordPrice.textContent = formatCurrency(uiState.summaryCordPrice);

        this.f2.d1_acceSum.textContent = formatCurrency(f2State.acceSum);
        this.f2.d3_eAcceSum.textContent = formatCurrency(f2State.eAcceSum);
        this.f2.c6_wifiSum.textContent = formatCurrency(f2State.wifiSum);
        this.f2.d7_feeSum.textContent = formatCurrency(f2State.feeSum);
        this.f2.d8_deliveryFee.textContent = formatCurrency(f2State.deliveryFee);
        this.f2.d9_installFee.textContent = formatCurrency(f2State.installFee);
        this.f2.d10_removalFee.textContent = formatCurrency(f2State.removalFee);
        
        this.f2.b12_mulPrice.textContent = formatValue(f2State.mulPrice);
        this.f2.d12_1stProfit.textContent = formatValue(f2State.firstProfit);
        this.f2.b13_discount.textContent = formatValue(f2State.discount);
        this.f2.d13_singleProfit.textContent = formatValue(f2State.singleRbProfit);
        this.f2.b14_sumPrice.textContent = formatValue(f2State.sumPrice);
        this.f2.d14_sumProfit.textContent = formatValue(f2State.sumProfit);
        this.f2.b15_gst.textContent = formatValue(f2State.gst);
        this.f2.d15_netProfit.textContent = formatValue(f2State.netProfit);

        // Update input values
        this.f2.b6_wifiQty.value = f2State.wifiQty || '';
        this.f2.b8_deliveryQty.value = f2State.deliveryQty || '';
        this.f2.b9_installQty.value = f2State.installQty || '';
        this.f2.b10_removalQty.value = f2State.removalQty || '';
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
            // When switching to F2, we might need to explicitly sync data.
            // This event can be used by a controller to trigger the data sync.
            this.eventAggregator.publish('f2TabActivated');
        }
    }
}