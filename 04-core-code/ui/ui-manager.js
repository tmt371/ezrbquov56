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
        console.log("%c--- Adjusting Left Panel Layout ---", "color: blue; font-weight: bold;");
        const leftPanel = this.leftPanelElement;
        const appContainer = this.appElement;
        const numericKeyboard = this.numericKeyboardPanel;

        if (!leftPanel || !appContainer || !numericKeyboard) {
            console.error("Layout adjustment aborted: One or more critical elements not found.");
            return;
        }

        const isKeyboardCollapsed = numericKeyboard.classList.contains('is-collapsed');
        console.log(`%cKeyboard collapsed state: ${isKeyboardCollapsed}`, "color: purple;");

        // [BUG FIX] The entire layout calculation should ONLY run when the keyboard is visible.
        // The previous "FALLBACK MODE" (the 'else' block) caused incorrect, full-height
        // calculations when the keyboard was collapsed. By removing the 'else' block,
        // the panel will retain its last calculated correct dimensions when the keyboard is hidden.
        if (!isKeyboardCollapsed) {
            console.log("-> Entering PRECISION MODE (calculating based on keys).");
            const key7 = document.getElementById('key-7');
            const key0 = document.getElementById('key-0');
            const typeKey = document.getElementById('key-type');
            if (!key7 || !key0 || !typeKey) {
                console.error("Precision mode aborted: One or more keypad keys not found.");
                return; 
            }

            const key7Rect = key7.getBoundingClientRect();
            const key0Rect = key0.getBoundingClientRect();
            const typeKeyRect = typeKey.getBoundingClientRect();
            console.log("Measured Key Coordinates:", { key7: key7Rect, key0: key0Rect, typeKey: typeKeyRect });

            if (key7Rect.width > 0) {
                const dynamicTop = key7Rect.top;
                const dynamicHeight = key0Rect.bottom - key7Rect.top;
                const dynamicWidth = typeKeyRect.left + (typeKeyRect.width / 2);
                console.log("%cCalculated Styles (Precision):", "color: green;", { top: dynamicTop, height: dynamicHeight, width: dynamicWidth });
                
                leftPanel.style.top = `${dynamicTop}px`;
                leftPanel.style.height = `${dynamicHeight}px`;
                leftPanel.style.width = `${dynamicWidth}px`;
            } else {
                console.warn("Keys have no width, precision layout skipped.");
            }
        }
        console.log("%c--- Left Panel Layout Adjustment Finished ---", "color: blue; font-weight: bold;");
    }

    _initializeLeftPanelLayout() {
        // The ResizeObserver ensures the layout is recalculated if the window size changes.
        const resizeObserver = new ResizeObserver(() => {
            if (this.leftPanelElement.classList.contains('is-expanded')) {
                this._adjustLeftPanelLayout();
            }
        });
        resizeObserver.observe(this.appElement);

        // BUG FIX: The MutationObserver below was the root cause of the layout issue
        // and has been definitively removed.
    }
    
    _updateLeftPanelState(currentView) {
        if (this.leftPanelElement) {
            const isExpanded = (currentView === 'DETAIL_CONFIG');
            console.log(`Updating left panel state. Is expanding? ${isExpanded}`);
            
            if (isExpanded) {
                this._adjustLeftPanelLayout();
            }
            
            this.leftPanelElement.classList.toggle('is-expanded', isExpanded);
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