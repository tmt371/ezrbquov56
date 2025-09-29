// /04-core-code/ui/dialog-component.js

/**
 * @fileoverview A generic, configurable component to manage confirmation dialogs.
 */
export class DialogComponent {
    constructor({ overlayElement, eventAggregator }) {
        if (!overlayElement || !eventAggregator) {
            throw new Error("Overlay element and event aggregator are required for DialogComponent.");
        }
        this.overlay = overlayElement;
        this.dialogBox = this.overlay.querySelector('.dialog-box');
        this.eventAggregator = eventAggregator;
        
        this.messageElement = this.overlay.querySelector('.dialog-message');
        this.buttonsContainer = this.overlay.querySelector('.dialog-buttons');

        this.initialize();
        console.log("DialogComponent (Refactored for Grid Layout) Initialized.");
    }

    initialize() {
        // [MODIFIED] The welcome dialog is now an interactive form for cost discount input.
        this.eventAggregator.subscribe('showWelcomeDialog', () => {
            this.show({
                message: '請問捲簾所套用的成本折扣數為多少％？',
                layout: [
                    [
                        { 
                            type: 'input', 
                            id: 'dialog-input-cost-dis',
                            placeholder: '輸入 0 到 100 之間的正整數',
                            colspan: 3 
                        }
                    ],
                    [
                        { 
                            type: 'button', 
                            text: '確定', 
                            colspan: 3,
                            callback: () => {
                                const inputElement = document.getElementById('dialog-input-cost-dis');
                                const value = inputElement.value;
                                const percentage = parseInt(value, 10);

                                if (value === '' || isNaN(percentage) || percentage < 0 || percentage > 100) {
                                    this.eventAggregator.publish('showNotification', { 
                                        message: '輸入無效。請輸入 0 到 100 之間的正整數。', 
                                        type: 'error' 
                                    });
                                    // By returning 'false', we can potentially prevent the dialog from closing,
                                    // but we need to modify the event listener logic in show() for that.
                                    // For now, we just show an error. The user will have to reopen if they make a mistake.
                                    // Let's refine this by not closing on invalid input.
                                    return false; // Indicate failure
                                } else {
                                    this.eventAggregator.publish('costDiscountEntered', { percentage });
                                    this.eventAggregator.publish('welcomeDialogConfirmed');
                                    return true; // Indicate success
                                }
                            }
                        }
                    ]
                ]
            });
        });

        this.eventAggregator.subscribe('showLoadConfirmationDialog', () => {
            this.show({
                message: 'The current quote contains unsaved data. What would you like to do?',
                layout: [
                    [
                        { type: 'button', text: 'Save then Load', callback: () => this.eventAggregator.publish('userChoseSaveThenLoad'), colspan: 1 },
                        { type: 'button', text: 'Load Directly', callback: () => this.eventAggregator.publish('userChoseLoadDirectly'), colspan: 1 },
                        { type: 'button', text: 'Cancel', className: 'secondary', callback: () => {}, colspan: 1 }
                    ]
                ]
            });
        });

        this.eventAggregator.subscribe('showConfirmationDialog', (config) => this.show(config));

        this.overlay.addEventListener('click', (event) => {
            if (event.target === this.overlay) {
                this.hide();
            }
        });
    }

    /**
     * Shows a dialog with a configurable message and a grid-based layout.
     * @param {object} config - The configuration object.
     * @param {string} config.message - The message to display.
     * @param {Array<Array<object>>} config.layout - An array of rows, where each row is an array of cell objects.
     */
    show({ message, layout = [], position = 'center' }) {
        this.buttonsContainer.innerHTML = '';

        if (this.messageElement) {
            this.messageElement.textContent = message;
        }

        layout.forEach(row => {
            row.forEach(cellConfig => {
                const cell = document.createElement('div');
                cell.className = 'dialog-grid-cell';

                if (cellConfig.type === 'button') {
                    cell.classList.add('button-cell');
                    const button = document.createElement('button');
                    button.className = 'dialog-button';
                    if (cellConfig.className) {
                        button.classList.add(...cellConfig.className.split(' '));
                    }
                    button.textContent = cellConfig.text;
                    
                    button.addEventListener('click', () => {
                        let shouldHide = true;
                        if (cellConfig.callback && typeof cellConfig.callback === 'function') {
                            const callbackResult = cellConfig.callback();
                            // If the callback returns false, it signals that we should not close the dialog.
                            if (callbackResult === false) {
                                shouldHide = false;
                            }
                        }
                        
                        if (cellConfig.closeOnClick !== false && shouldHide) {
                            this.hide();
                        }
                    });
                    cell.appendChild(button);

                } else if (cellConfig.type === 'input') {
                    // [NEW] Add support for creating input fields
                    cell.classList.add('input-cell');
                    const input = document.createElement('input');
                    input.className = 'dialog-input';
                    input.id = cellConfig.id;
                    input.type = 'number';
                    input.placeholder = cellConfig.placeholder || '';
                    input.min = 0;
                    input.max = 100;
                    cell.appendChild(input);

                } else if (cellConfig.type === 'text') {
                    cell.classList.add('text-cell');
                    cell.textContent = cellConfig.text;
                }
                
                if (cellConfig.className && cellConfig.type !== 'button') {
                     cell.classList.add(...cellConfig.className.split(' '));
                }

                if (cellConfig.colspan) {
                    cell.style.gridColumn = `span ${cellConfig.colspan}`;
                }

                this.buttonsContainer.appendChild(cell);
            });
        });

        if (position === 'bottomThird') {
            this.dialogBox.style.marginTop = `calc( (100vh - 20vh) / 3 * 2 - 50% )`;
        } else {
            this.dialogBox.style.marginTop = '';
        }

        this.overlay.classList.remove('is-hidden');
    }

    hide() {
        this.overlay.classList.add('is-hidden');
    }
}