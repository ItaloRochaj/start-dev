import { TestBed } from '@angular/core/testing';
import { ToastService, Toast } from './toast.service';
import { take } from 'rxjs/operators';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastService]
    });
    service = TestBed.get(ToastService);
  });

  describe('Service creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have toast$ observable', () => {
      expect(service.toast$).toBeTruthy();
    });
  });

  describe('show method', () => {
    it('should emit toast with default type (info)', (done) => {
      const message = 'Test message';

      service.toast$.pipe(take(1)).subscribe(toast => {
        expect(toast.message).toBe(message);
        expect(toast.type).toBe('info');
        expect(toast.duration).toBe(4000);
        done();
      });

      service.show(message);
    });

    it('should emit toast with specific type', (done) => {
      const message = 'Success message';

      service.toast$.pipe(take(1)).subscribe(toast => {
        expect(toast.type).toBe('success');
        done();
      });

      service.show(message, 'success');
    });

    it('should emit toast with custom duration', (done) => {
      const message = 'Custom duration';
      const duration = 2000;

      service.toast$.pipe(take(1)).subscribe(toast => {
        expect(toast.duration).toBe(duration);
        done();
      });

      service.show(message, 'info', duration);
    });

    it('should generate unique id for each toast', (done) => {
      const ids: string[] = [];
      let count = 0;

      service.toast$.subscribe(toast => {
        ids.push(toast.id);
        count++;

        if (count === 3) {
          expect(ids[0]).not.toBe(ids[1]);
          expect(ids[1]).not.toBe(ids[2]);
          expect(ids[0]).not.toBe(ids[2]);
          done();
        }
      });

      service.show('Message 1');
      service.show('Message 2');
      service.show('Message 3');
    });

    it('should emit toast with error type', (done) => {
      const message = 'Error message';

      service.toast$.pipe(take(1)).subscribe(toast => {
        expect(toast.type).toBe('error');
        done();
      });

      service.show(message, 'error');
    });

    it('should emit toast with warning type', (done) => {
      const message = 'Warning message';

      service.toast$.pipe(take(1)).subscribe(toast => {
        expect(toast.type).toBe('warning');
        done();
      });

      service.show(message, 'warning');
    });

    it('should handle empty message', (done) => {
      service.toast$.pipe(take(1)).subscribe(toast => {
        expect(toast.message).toBe('');
        done();
      });

      service.show('');
    });

    it('should handle very long message', (done) => {
      const longMessage = 'A'.repeat(1000);

      service.toast$.pipe(take(1)).subscribe(toast => {
        expect(toast.message).toBe(longMessage);
        done();
      });

      service.show(longMessage);
    });

    it('should handle special characters in message', (done) => {
      const message = 'Message with special chars: @#$%^&*()';

      service.toast$.pipe(take(1)).subscribe(toast => {
        expect(toast.message).toBe(message);
        done();
      });

      service.show(message);
    });

    it('should emit toast with default duration 4000ms', (done) => {
      service.toast$.pipe(take(1)).subscribe(toast => {
        expect(toast.duration).toBe(4000);
        done();
      });

      service.show('Test');
    });

    it('should emit toast with zero duration', (done) => {
      service.toast$.pipe(take(1)).subscribe(toast => {
        expect(toast.duration).toBe(0);
        done();
      });

      service.show('Test', 'info', 0);
    });

    it('should have all required toast properties', (done) => {
      service.toast$.pipe(take(1)).subscribe(toast => {
        expect(toast.id).toBeTruthy();
        expect(toast.message).toBeTruthy();
        expect(toast.type).toBeTruthy();
        expect(toast.duration).toBeDefined();
        done();
      });

      service.show('Test message');
    });

    it('should support all valid toast types', () => {
      const types: Array<'success' | 'error' | 'warning' | 'info'> = [
        'success',
        'error',
        'warning',
        'info'
      ];
      let count = 0;

      service.toast$.subscribe(toast => {
        expect(types).toContain(toast.type);
        count++;
      });

      types.forEach(type => {
        service.show('Test', type);
      });

      expect(count).toBe(4);
    });
  });

  describe('success method', () => {
    it('should emit success toast', (done) => {
      const message = 'Operation successful';

      service.toast$.pipe(take(1)).subscribe(toast => {
        expect(toast.message).toBe(message);
        expect(toast.type).toBe('success');
        done();
      });

      service.success(message);
    });

    it('should use default duration of 4000ms', (done) => {
      service.toast$.pipe(take(1)).subscribe(toast => {
        expect(toast.duration).toBe(4000);
        done();
      });

      service.success('Success');
    });

    it('should accept custom duration', (done) => {
      const duration = 2000;

      service.toast$.pipe(take(1)).subscribe(toast => {
        expect(toast.duration).toBe(duration);
        done();
      });

      service.success('Success', duration);
    });

    it('should work multiple times', () => {
      let count = 0;

      service.toast$.subscribe(() => {
        count++;
      });

      service.success('Success 1');
      service.success('Success 2');
      service.success('Success 3');

      expect(count).toBe(3);
    });
  });

  describe('error method', () => {
    it('should emit error toast', (done) => {
      const message = 'An error occurred';

      service.toast$.pipe(take(1)).subscribe(toast => {
        expect(toast.message).toBe(message);
        expect(toast.type).toBe('error');
        done();
      });

      service.error(message);
    });

    it('should use default duration of 4000ms', (done) => {
      service.toast$.pipe(take(1)).subscribe(toast => {
        expect(toast.duration).toBe(4000);
        done();
      });

      service.error('Error');
    });

    it('should accept custom duration', (done) => {
      const duration = 5000;

      service.toast$.pipe(take(1)).subscribe(toast => {
        expect(toast.duration).toBe(duration);
        done();
      });

      service.error('Error', duration);
    });

    it('should handle error messages with details', (done) => {
      const message = 'Error: Invalid input data';

      service.toast$.pipe(take(1)).subscribe(toast => {
        expect(toast.message).toBe(message);
        done();
      });

      service.error(message);
    });
  });

  describe('warning method', () => {
    it('should emit warning toast', (done) => {
      const message = 'This is a warning';

      service.toast$.pipe(take(1)).subscribe(toast => {
        expect(toast.message).toBe(message);
        expect(toast.type).toBe('warning');
        done();
      });

      service.warning(message);
    });

    it('should use default duration of 4000ms', (done) => {
      service.toast$.pipe(take(1)).subscribe(toast => {
        expect(toast.duration).toBe(4000);
        done();
      });

      service.warning('Warning');
    });

    it('should accept custom duration', (done) => {
      const duration = 3000;

      service.toast$.pipe(take(1)).subscribe(toast => {
        expect(toast.duration).toBe(duration);
        done();
      });

      service.warning('Warning', duration);
    });
  });

  describe('info method', () => {
    it('should emit info toast', (done) => {
      const message = 'Information message';

      service.toast$.pipe(take(1)).subscribe(toast => {
        expect(toast.message).toBe(message);
        expect(toast.type).toBe('info');
        done();
      });

      service.info(message);
    });

    it('should use default duration of 4000ms', (done) => {
      service.toast$.pipe(take(1)).subscribe(toast => {
        expect(toast.duration).toBe(4000);
        done();
      });

      service.info('Info');
    });

    it('should accept custom duration', (done) => {
      const duration = 3000;

      service.toast$.pipe(take(1)).subscribe(toast => {
        expect(toast.duration).toBe(duration);
        done();
      });

      service.info('Info', duration);
    });
  });

  describe('Multiple toasts', () => {
    it('should handle multiple toasts in sequence', () => {
      const toasts: Toast[] = [];

      service.toast$.subscribe(toast => {
        toasts.push(toast);
      });

      service.success('Success');
      service.error('Error');
      service.warning('Warning');
      service.info('Info');

      expect(toasts.length).toBe(4);
      expect(toasts[0].type).toBe('success');
      expect(toasts[1].type).toBe('error');
      expect(toasts[2].type).toBe('warning');
      expect(toasts[3].type).toBe('info');
    });

    it('should emit different messages', () => {
      const messages: string[] = [];

      service.toast$.subscribe(toast => {
        messages.push(toast.message);
      });

      service.show('Message 1');
      service.show('Message 2');
      service.show('Message 3');

      expect(messages).toEqual(['Message 1', 'Message 2', 'Message 3']);
    });

    it('should handle rapid toast emissions', () => {
      let count = 0;

      service.toast$.subscribe(() => {
        count++;
      });

      for (let i = 0; i < 100; i++) {
        service.show(`Message ${i}`);
      }

      expect(count).toBe(100);
    });
  });

  describe('Observable behavior', () => {
    it('should allow multiple subscribers', () => {
      let subscriber1Count = 0;
      let subscriber2Count = 0;

      service.toast$.subscribe(() => {
        subscriber1Count++;
      });

      service.toast$.subscribe(() => {
        subscriber2Count++;
      });

      service.show('Test');

      expect(subscriber1Count).toBe(1);
      expect(subscriber2Count).toBe(1);
    });

    it('should emit to new subscribers for each show call', (done) => {
      service.show('Message 1');

      // New subscriber should not receive Message 1 (Subject behavior)
      service.toast$.pipe(take(1)).subscribe(toast => {
        expect(toast.message).toBe('Message 2');
        done();
      });

      service.show('Message 2');
    });
  });
});



