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

    render(uiState) {
        // This component currently manages its own state, but render can be used for future updates.
    }

    _setActiveTab(clickedButton) {
        const targetContentId = clickedButton.dataset.tabTarget;

        this.tabButtons.forEach(button => {
            button.classList.toggle('active', button === clickedButton);
        });

        this.tabContents.forEach(content => {
            content.classList.toggle('active', `#${content.id}` === targetContentId);
        });
    }
}