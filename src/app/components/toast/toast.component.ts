import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastService, Toast } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toasts"
        class="toast toast-{{ toast.type }}"
        role="alert"
      >
        <div class="toast-content">
          <span class="toast-message">{{ toast.message }}</span>
        </div>
        <button
          type="button"
          class="toast-close"
          (click)="removeToast(toast.id)"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-width: 300px;
      max-width: 500px;
      padding: 16px 20px;
      margin-bottom: 12px;
      border-radius: 4px;
      border-left: 4px solid;
      background-color: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      pointer-events: auto;
      word-break: break-word;
      animation: slideIn 0.3s ease-out;
    }

    .toast.ng-leave {
      animation: slideOut 0.3s ease-out forwards;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }

    .toast-success {
      border-left-color: #28a745;
      background-color: #d4edda;
    }

    .toast-success .toast-message {
      color: #155724;
    }

    .toast-error {
      border-left-color: #dc3545;
      background-color: #f8d7da;
    }

    .toast-error .toast-message {
      color: #721c24;
    }

    .toast-warning {
      border-left-color: #ffc107;
      background-color: #fff3cd;
    }

    .toast-warning .toast-message {
      color: #856404;
    }

    .toast-info {
      border-left-color: #17a2b8;
      background-color: #d1ecf1;
    }

    .toast-info .toast-message {
      color: #0c5460;
    }

    .toast-content {
      flex: 1;
      margin-right: 12px;
    }

    .toast-message {
      font-size: 14px;
      line-height: 1.5;
    }

    .toast-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      margin: -8px;
      color: inherit;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .toast-close:hover {
      opacity: 1;
    }

    @media (max-width: 480px) {
      .toast {
        min-width: 90vw;
        max-width: 90vw;
      }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription: Subscription | null = null;
  private timeoutMap: Map<string, any> = new Map();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toast$.subscribe((toast: Toast) => {
      this.toasts.push(toast);

      if (toast.duration) {
        const timeoutId = setTimeout(() => {
          this.removeToast(toast.id);
        }, toast.duration);
        this.timeoutMap.set(toast.id, timeoutId);
      }
    });
  }

  removeToast(id: string): void {
    const timeoutId = this.timeoutMap.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeoutMap.delete(id);
    }
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    // Clear all timeouts
    this.timeoutMap.forEach(timeoutId => clearTimeout(timeoutId));
    this.timeoutMap.clear();
  }
}
