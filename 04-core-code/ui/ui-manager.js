// File: 04-core-code/ui/ui-manager.js

import { TableComponent } from './table-component.js';
import { SummaryComponent } from './summary-component.js';
import { PanelComponent } from './panel-component.js';
import { NotificationComponent } from './notification-component.js';
import { DialogComponent } from './dialog-component.js';
import { LeftPanelComponent } from './left-panel-component.js';
import { RightPanelComponent } from './right-panel-component.js';

export class UIManager {
    constructor(appElement, eventAggregator) {
        this.appElement = appElement;
        this.eventAggregator = eventAggregator;

        this.numericKeyboardPanel = document.getElementById('numeric-keyboard-panel');
        this.insertButton = document.getElementById('key-insert');
        this.deleteButton = document.getElementById('key-delete');
        this.mSelButton = document.getElementById('key-m-sel');
        this.clearButton = document.getElementById('key-clear');
        this.leftPanelElement = document.getElementById('left-panel');
        
        this.cachedLeftPanelHeight = 0;

        const tableElement = document.getElementById('results-table');
        this.tableComponent = new TableComponent(tableElement);

        const summaryElement = document.getElementById('total-sum-value');
        this.summaryComponent = new SummaryComponent(summaryElement);

        this.leftPanelComponent = new LeftPanelComponent(this.leftPanelElement);

        this.functionPanel = new PanelComponent({
            panelElement: document.getElementById('function-panel'),
            toggleElement: document.getElementById('function-panel-toggle'),
            eventAggregator: this.eventAggregator,
            expandedClass: 'is-expanded',
            retractEventName: 'operationSuccessfulAutoHidePanel'
        });
        
        this.rightPanelComponent = new RightPanelComponent(
            document.getElementById('function-panel'),
            this.eventAggregator
        );

        this.notificationComponent = new NotificationComponent({
            containerElement: document.getElementById('toast-container'),
            eventAggregator: this.eventAggregator
        });

        this.dialogComponent = new DialogComponent({
            overlayElement: document.getElementById('confirmation-dialog-overlay'),
            eventAggregator: this.eventAggregator
        });

        this.initialize();
        this._initializeLeftPanelLayout();
    }

    initialize() {
        this.eventAggregator.subscribe('userToggledNumericKeyboard', () => this._toggleNumericKeyboard());
    }

    render(state) {
        const isDetailView = state.ui.currentView === 'DETAIL_CONFIG';
        this.appElement.classList.toggle('detail-view-active', isDetailView);

        this.tableComponent.render(state);
        this.summaryComponent.render(state.quoteData.summary, state.ui.isSumOutdated);
        this.leftPanelComponent.render(state.ui, state.quoteData);
        this.rightPanelComponent.render(state.ui);
        
        this._updateButtonStates(state);
        this._updateLeftPanelState(state.ui.currentView);
        this._scrollToActiveCell(state);
    }

    _adjustLeftPanelLayout() {
        const leftPanel = this.leftPanelElement;
        const appContainer = this.appElement;
        const numericKeyboard = this.numericKeyboardPanel;
        const virtualKeyboard = document.getElementById('numeric-keyboard');
        const typeKey = document.getElementById('key-type');
        const zeroKey = document.getElementById('key-0');

        if (!leftPanel || !appContainer || !numericKeyboard || !virtualKeyboard || !typeKey || !zeroKey) return;

        const containerRect = appContainer.getBoundingClientRect();
        const keyboardRect = numericKeyboard.getBoundingClientRect();
        const virtualKeyboardRect = virtualKeyboard.getBoundingClientRect();
        const typeKeyRect = typeKey.getBoundingClientRect();
        const zeroKeyRect = zeroKey.getBoundingClientRect();

        // --- Width Calculation ---
        // Calculate the center of the 'TYPE' key relative to the viewport
        const typeKeyCenter = typeKeyRect.left + (typeKeyRect.width / 2);
        // The panel's width is the distance from the left edge of the viewport to the key's center
        const dynamicWidth = typeKeyCenter;
        
        // --- Height & Top Calculation ---
        // The panel's height is the distance from the top of the virtual keyboard grid to the bottom of the '0' key
        const dynamicHeight = zeroKeyRect.bottom - virtualKeyboardRect.top;
        // The panel's top position is aligned with the top of the numeric keyboard panel
        const dynamicTop = keyboardRect.top;

        // Apply dynamic styles
        leftPanel.style.width = `${dynamicWidth}px`;
        leftPanel.style.height = `${dynamicHeight}px`;
        leftPanel.style.top = `${dynamicTop}px`;
    }

    _initializeLeftPanelLayout() {
        const resizeObserver = new ResizeObserver(() => {
            if (this.leftPanelElement.classList.contains('is-expanded')) {
                this._adjustLeftPanelLayout();
            }
        });
        resizeObserver.observe(this.appElement);
        
        new MutationObserver(() => {
            if(this.leftPanelElement.classList.contains('is-expanded')) {
                 this._adjustLeftPanelLayout();
            }
        }).observe(this.numericKeyboardPanel, { attributes: true, attributeFilter: ['class'] });

        setTimeout(() => this._adjustLeftPanelLayout(), 0);
    }
    
    _updateLeftPanelState(currentView) {
        if (this.leftPanelElement) {
            const isExpanded = (currentView === 'DETAIL_CONFIG');
            this.leftPanelElement.classList.toggle('is-expanded', isExpanded);

            if (isExpanded) {
                // Use a short timeout to ensure the transition has started and all elements are visible for measurement
                setTimeout(() => this._adjustLeftPanelLayout(), 50);
            }
        }
    }

    _updateButtonStates(state) {
        const { selectedRowIndex, isMultiSelectMode, multiSelectSelectedIndexes } = state.ui;
        const items = state.quoteData.rollerBlindItems;
        const isSingleRowSelected = selectedRowIndex !== null;
        
        let insertDisabled = true;
        if (isSingleRowSelected) {
            const isLastRow = selectedRowIndex === items.length - 1;
            if (!isLastRow) {
                const nextItem = items[selectedRowIndex + 1];
                const isNextRowEmpty = !nextItem.width && !nextItem.height && !nextItem.fabricType;
                if (!isNextRowEmpty) { insertDisabled = false; }
            }
        }
        if (this.insertButton) this.insertButton.disabled = insertDisabled;

        let deleteDisabled = true;
        if (isMultiSelectMode) {
            if (multiSelectSelectedIndexes.size > 0) { deleteDisabled = false; }
        } else if (isSingleRowSelected) {
            const item = items[selectedRowIndex];
            const isLastRow = selectedRowIndex === items.length - 1;
            const isRowEmpty = !item.width && !item.height && !item.fabricType;
            if (!(isLastRow && isRowEmpty)) { deleteDisabled = false; }
        }
        if (this.deleteButton) this.deleteButton.disabled = deleteDisabled;
        
        const mSelDisabled = !isSingleRowSelected && !isMultiSelectMode;
        if (this.mSelButton) {
            this.mSelButton.disabled = mSelDisabled;
            this.mSelButton.style.backgroundColor = isMultiSelectMode ? '#f5c6cb' : '';
        }

        if (this.clearButton) this.clearButton.disabled = !isSingleRowSelected;
    }
    
    _scrollToActiveCell(state) {
        if (!state.ui.activeCell) return;
        const { rowIndex, column } = state.ui.activeCell;
        const activeCellElement = document.querySelector(`tr[data-row-index="${rowIndex}"] td[data-column="${column}"]`);
        if (activeCellElement) {
            activeCellElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
    _toggleNumericKeyboard() {
        if (this.numericKeyboardPanel) {
            this.numericKeyboardPanel.classList.toggle('is-collapsed');
        }
    }
}