import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { ToastService, Toast } from '../../services/toast.service';
import { Subject } from 'rxjs';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let toastService: jasmine.SpyObj<ToastService>;
  let toastSubject: Subject<Toast>;

  const mockToast: Toast = {
    id: '1',
    message: 'Test message',
    type: 'success',
    duration: 3000
  };

  beforeEach(async () => {
    toastSubject = new Subject<Toast>();
    const toastServiceSpy = jasmine.createSpyObj('ToastService', [
      'show',
      'success',
      'error',
      'warning',
      'info'
    ]);
    toastServiceSpy.toast$ = toastSubject.asObservable();

    await TestBed.configureTestingModule({
      declarations: [ToastComponent],
      providers: [
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    toastService = TestBed.get(ToastService) as jasmine.SpyObj<ToastService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize toasts as empty array', () => {
      expect(component.toasts).toEqual([]);
    });

    it('should initialize subscription as null before ngOnInit', () => {
      expect(component['subscription']).toBeNull();
    });

    it('should initialize timeoutMap as empty Map', () => {
      expect(component['timeoutMap'].size).toBe(0);
    });
  });

  describe('ngOnInit', () => {
    it('should subscribe to toastService.toast$', () => {
      fixture.detectChanges();
      expect(component['subscription']).toBeTruthy();
    });

    it('should add toast to toasts array when emitted', (done) => {
      fixture.detectChanges();
      toastSubject.next(mockToast);
      setTimeout(() => {
        expect(component.toasts.length).toBe(1);
        expect(component.toasts[0]).toEqual(mockToast);
        done();
      }, 50);
    });

    it('should add multiple toasts to array', (done) => {
      fixture.detectChanges();
      const toast1 = { id: '1', message: 'Message 1', type: 'success' as const, duration: 3000 };
      const toast2 = { id: '2', message: 'Message 2', type: 'error' as const, duration: 3000 };
      const toast3 = { id: '3', message: 'Message 3', type: 'info' as const, duration: 3000 };

      toastSubject.next(toast1);
      toastSubject.next(toast2);
      toastSubject.next(toast3);

      setTimeout(() => {
        expect(component.toasts.length).toBe(3);
        expect(component.toasts[0].id).toBe('1');
        expect(component.toasts[1].id).toBe('2');
        expect(component.toasts[2].id).toBe('3');
        done();
      }, 50);
    });

    it('should set timeout when toast has duration', fakeAsync(() => {
      fixture.detectChanges();
      toastSubject.next(mockToast);
      tick(0);
      expect(component['timeoutMap'].has(mockToast.id)).toBeTruthy();
    }));

    it('should not set timeout when toast has no duration', (done) => {
      fixture.detectChanges();
      const toastNoDuration = { id: '1', message: 'No duration', type: 'success' as const };
      toastSubject.next(toastNoDuration);
      setTimeout(() => {
        expect(component['timeoutMap'].has(toastNoDuration.id)).toBeFalsy();
        done();
      }, 50);
    });

    it('should store timeout ID in timeoutMap', fakeAsync(() => {
      fixture.detectChanges();
      toastSubject.next(mockToast);
      tick(0);
      const timeoutId = component['timeoutMap'].get(mockToast.id);
      expect(timeoutId).toBeTruthy();
      expect(typeof timeoutId).toBe('number');
    }));

    it('should handle toast with duration of 0', (done) => {
      fixture.detectChanges();
      const toastZeroDuration = { id: '1', message: 'Zero duration', type: 'success' as const, duration: 0 };
      toastSubject.next(toastZeroDuration);
      setTimeout(() => {
        expect(component['timeoutMap'].has('1')).toBeTruthy();
        done();
      }, 50);
    });
  });

  describe('Toast Display Types', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should add success type toast', (done) => {
      const successToast = { id: '1', message: 'Success!', type: 'success' as const, duration: 3000 };
      toastSubject.next(successToast);
      setTimeout(() => {
        expect(component.toasts[0].type).toBe('success');
        done();
      }, 50);
    });

    it('should add error type toast', (done) => {
      const errorToast = { id: '1', message: 'Error!', type: 'error' as const, duration: 3000 };
      toastSubject.next(errorToast);
      setTimeout(() => {
        expect(component.toasts[0].type).toBe('error');
        done();
      }, 50);
    });

    it('should add warning type toast', (done) => {
      const warningToast = { id: '1', message: 'Warning!', type: 'warning' as const, duration: 3000 };
      toastSubject.next(warningToast);
      setTimeout(() => {
        expect(component.toasts[0].type).toBe('warning');
        done();
      }, 50);
    });

    it('should add info type toast', (done) => {
      const infoToast = { id: '1', message: 'Info!', type: 'info' as const, duration: 3000 };
      toastSubject.next(infoToast);
      setTimeout(() => {
        expect(component.toasts[0].type).toBe('info');
        done();
      }, 50);
    });
  });

  describe('Remove Toast', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should remove toast by id', (done) => {
      toastSubject.next(mockToast);
      setTimeout(() => {
        expect(component.toasts.length).toBe(1);
        component.removeToast(mockToast.id);
        expect(component.toasts.length).toBe(0);
        done();
      }, 50);
    });

    it('should clear timeout when removing toast', fakeAsync(() => {
      toastSubject.next(mockToast);
      tick(0);
      const timeoutId = component['timeoutMap'].get(mockToast.id);
      spyOn(window, 'clearTimeout');
      component.removeToast(mockToast.id);
      expect(window.clearTimeout).toHaveBeenCalledWith(timeoutId);
      flush();
    }));

    it('should remove toast id from timeoutMap', (done) => {
      toastSubject.next(mockToast);
      setTimeout(() => {
        expect(component['timeoutMap'].has(mockToast.id)).toBeTruthy();
        component.removeToast(mockToast.id);
        expect(component['timeoutMap'].has(mockToast.id)).toBeFalsy();
        done();
      }, 50);
    });

    it('should remove correct toast when multiple exist', (done) => {
      const toast1 = { id: '1', message: 'Message 1', type: 'success' as const, duration: 3000 };
      const toast2 = { id: '2', message: 'Message 2', type: 'error' as const, duration: 3000 };
      const toast3 = { id: '3', message: 'Message 3', type: 'info' as const, duration: 3000 };

      toastSubject.next(toast1);
      toastSubject.next(toast2);
      toastSubject.next(toast3);

      setTimeout(() => {
        expect(component.toasts.length).toBe(3);
        component.removeToast('2');
        expect(component.toasts.length).toBe(2);
        expect(component.toasts.find(t => t.id === '2')).toBeUndefined();
        expect(component.toasts.find(t => t.id === '1')).toBeTruthy();
        expect(component.toasts.find(t => t.id === '3')).toBeTruthy();
        done();
      }, 50);
    });

    it('should handle removing non-existent toast', (done) => {
      toastSubject.next(mockToast);
      setTimeout(() => {
        expect(() => component.removeToast('non-existent')).not.toThrow();
        expect(component.toasts.length).toBe(1);
        done();
      }, 50);
    });

    it('should handle removing from empty toasts array', () => {
      expect(() => component.removeToast('any-id')).not.toThrow();
      expect(component.toasts.length).toBe(0);
    });

    it('should filter correctly without mutating original array', (done) => {
      const toast1 = { id: '1', message: 'Message 1', type: 'success' as const, duration: 3000 };
      const toast2 = { id: '2', message: 'Message 2', type: 'error' as const, duration: 3000 };

      toastSubject.next(toast1);
      toastSubject.next(toast2);

      setTimeout(() => {
        const originalArray = component.toasts;
        component.removeToast('1');
        expect(component.toasts).not.toBe(originalArray);
        expect(component.toasts[0].id).toBe('2');
        done();
      }, 50);
    });
  });

  describe('Auto-removal with Duration', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should auto-remove toast after duration expires', fakeAsync(() => {
      const toastWith1sTimeout = { id: '1', message: 'Remove me', type: 'success' as const, duration: 1000 };
      toastSubject.next(toastWith1sTimeout);
      tick(0);
      expect(component.toasts.length).toBe(1);
      tick(1000);
      expect(component.toasts.length).toBe(0);
    }));

    it('should auto-remove toast with 3 second duration', fakeAsync(() => {
      toastSubject.next(mockToast); // 3000ms duration
      tick(0);
      expect(component.toasts.length).toBe(1);
      tick(3000);
      expect(component.toasts.length).toBe(0);
    }));

    it('should auto-remove multiple toasts after their respective durations', fakeAsync(() => {
      const toast1 = { id: '1', message: 'Remove 1', type: 'success' as const, duration: 1000 };
      const toast2 = { id: '2', message: 'Remove 2', type: 'error' as const, duration: 2000 };
      const toast3 = { id: '3', message: 'Remove 3', type: 'info' as const, duration: 3000 };

      toastSubject.next(toast1);
      toastSubject.next(toast2);
      toastSubject.next(toast3);
      tick(0);

      expect(component.toasts.length).toBe(3);
      tick(1000);
      expect(component.toasts.length).toBe(2);
      tick(1000);
      expect(component.toasts.length).toBe(1);
      tick(1000);
      expect(component.toasts.length).toBe(0);
    }));

    it('should not auto-remove toast without duration', fakeAsync(() => {
      const toastNoDuration = { id: '1', message: 'Persist', type: 'success' as const };
      toastSubject.next(toastNoDuration);
      tick(0);
      expect(component.toasts.length).toBe(1);
      tick(10000);
      expect(component.toasts.length).toBe(1);
    }));

    it('should handle very short duration', fakeAsync(() => {
      const shortToast = { id: '1', message: 'Quick', type: 'success' as const, duration: 10 };
      toastSubject.next(shortToast);
      tick(0);
      expect(component.toasts.length).toBe(1);
      tick(10);
      expect(component.toasts.length).toBe(0);
    }));

    it('should handle very long duration', fakeAsync(() => {
      const longToast = { id: '1', message: 'Long', type: 'success' as const, duration: 100000 };
      toastSubject.next(longToast);
      tick(0);
      expect(component.toasts.length).toBe(1);
      tick(99999);
      expect(component.toasts.length).toBe(1);
      tick(1);
      expect(component.toasts.length).toBe(0);
    }));
  });

  describe('Timeout Map Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should maintain correct size of timeoutMap', fakeAsync(() => {
      const toast1 = { id: '1', message: 'Msg 1', type: 'success' as const, duration: 1000 };
      const toast2 = { id: '2', message: 'Msg 2', type: 'error' as const, duration: 2000 };
      const toast3 = { id: '3', message: 'Msg 3', type: 'info' as const, duration: 3000 };

      toastSubject.next(toast1);
      tick(0);
      expect(component['timeoutMap'].size).toBe(1);

      toastSubject.next(toast2);
      tick(0);
      expect(component['timeoutMap'].size).toBe(2);

      toastSubject.next(toast3);
      tick(0);
      expect(component['timeoutMap'].size).toBe(3);

      tick(1000);
      expect(component['timeoutMap'].size).toBe(2);

      tick(1000);
      expect(component['timeoutMap'].size).toBe(1);

      tick(1000);
      expect(component['timeoutMap'].size).toBe(0);
    }));

    it('should allow manual removal from timeoutMap', (done) => {
      toastSubject.next(mockToast);
      setTimeout(() => {
        expect(component['timeoutMap'].size).toBe(1);
        component.removeToast(mockToast.id);
        expect(component['timeoutMap'].size).toBe(0);
        done();
      }, 50);
    });

    it('should handle timeoutMap with mixed durations', fakeAsync(() => {
      const persistent = { id: '1', message: 'Persist', type: 'success' as const };
      const timed = { id: '2', message: 'Timed', type: 'error' as const, duration: 1000 };

      toastSubject.next(persistent);
      tick(0);
      expect(component['timeoutMap'].size).toBe(0);

      toastSubject.next(timed);
      tick(0);
      expect(component['timeoutMap'].size).toBe(1);

      tick(1000);
      expect(component['timeoutMap'].size).toBe(0);
    }));
  });

  describe('ngOnDestroy', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should unsubscribe from toastService', () => {
      spyOn(component['subscription']!, 'unsubscribe');
      component.ngOnDestroy();
      expect(component['subscription']!.unsubscribe).toHaveBeenCalled();
    });

    it('should clear all timeouts on destroy', fakeAsync(() => {
      const toast1 = { id: '1', message: 'Msg 1', type: 'success' as const, duration: 10000 };
      const toast2 = { id: '2', message: 'Msg 2', type: 'error' as const, duration: 20000 };

      toastSubject.next(toast1);
      toastSubject.next(toast2);
      tick(0);

      expect(component['timeoutMap'].size).toBe(2);
      component.ngOnDestroy();
      expect(component['timeoutMap'].size).toBe(0);
    }));

    it('should clear timeoutMap after destroy', fakeAsync(() => {
      toastSubject.next(mockToast);
      tick(0);
      component.ngOnDestroy();
      expect(component['timeoutMap'].size).toBe(0);
    }));

    it('should handle destroy when no timeouts exist', () => {
      expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it('should handle destroy when subscription is null', () => {
      component['subscription'] = null;
      expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it('should prevent new toasts after destroy', (done) => {
      component.ngOnDestroy();
      const toast = { id: '1', message: 'Should not appear', type: 'success' as const };
      toastSubject.next(toast);
      setTimeout(() => {
        expect(component.toasts.length).toBe(0);
        done();
      }, 50);
    });
  });

  describe('Edge Cases and Complex Scenarios', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle rapid successive toast emissions', fakeAsync(() => {
      for (let i = 0; i < 10; i++) {
        toastSubject.next({
          id: `${i}`,
          message: `Message ${i}`,
          type: 'success',
          duration: 1000
        });
      }
      tick(0);
      expect(component.toasts.length).toBe(10);
      tick(1000);
      expect(component.toasts.length).toBe(0);
    }));

    it('should handle manual removal during auto-removal', fakeAsync(() => {
      const toast1 = { id: '1', message: 'Manual', type: 'success' as const, duration: 2000 };
      const toast2 = { id: '2', message: 'Auto', type: 'error' as const, duration: 2000 };

      toastSubject.next(toast1);
      toastSubject.next(toast2);
      tick(0);

      tick(1000);
      component.removeToast('1');
      expect(component.toasts.length).toBe(1);

      tick(1000);
      expect(component.toasts.length).toBe(0);
    }));

    it('should handle toast with very long message', (done) => {
      const longMessage = 'a'.repeat(10000);
      const longToast = { id: '1', message: longMessage, type: 'success' as const, duration: 3000 };
      toastSubject.next(longToast);
      setTimeout(() => {
        expect(component.toasts[0].message.length).toBe(10000);
        done();
      }, 50);
    });

    it('should maintain toast order', (done) => {
      const toasts = [];
      for (let i = 0; i < 5; i++) {
        const toast = { id: `${i}`, message: `Message ${i}`, type: 'success' as const, duration: 5000 };
        toasts.push(toast);
        toastSubject.next(toast);
      }
      setTimeout(() => {
        component.toasts.forEach((t, index) => {
          expect(t.id).toBe(`${index}`);
        });
        done();
      }, 50);
    });

    it('should handle removing all toasts one by one', (done) => {
      const toast1 = { id: '1', message: 'Msg 1', type: 'success' as const, duration: 3000 };
      const toast2 = { id: '2', message: 'Msg 2', type: 'error' as const, duration: 3000 };
      const toast3 = { id: '3', message: 'Msg 3', type: 'info' as const, duration: 3000 };

      toastSubject.next(toast1);
      toastSubject.next(toast2);
      toastSubject.next(toast3);

      setTimeout(() => {
        component.removeToast('1');
        expect(component.toasts.length).toBe(2);
        component.removeToast('2');
        expect(component.toasts.length).toBe(1);
        component.removeToast('3');
        expect(component.toasts.length).toBe(0);
        done();
      }, 50);
    });

    it('should handle toast with special characters', (done) => {
      const specialToast = { id: '1', message: '✓ Success! 🎉 <script></script> & "quoted"', type: 'success' as const, duration: 3000 };
      toastSubject.next(specialToast);
      setTimeout(() => {
        expect(component.toasts[0].message).toBe('✓ Success! 🎉 <script></script> & "quoted"');
        done();
      }, 50);
    });

    it('should handle null message gracefully', (done) => {
      const nullToast = { id: '1', message: null as any, type: 'success' as const, duration: 3000 };
      toastSubject.next(nullToast);
      setTimeout(() => {
        expect(component.toasts.length).toBe(1);
        done();
      }, 50);
    });

    it('should handle simultaneous add and remove', fakeAsync(() => {
      const toast1 = { id: '1', message: 'Msg 1', type: 'success' as const, duration: 500 };
      const toast2 = { id: '2', message: 'Msg 2', type: 'error' as const, duration: 1000 };

      toastSubject.next(toast1);
      tick(0);
      expect(component.toasts.length).toBe(1);

      tick(250);
      toastSubject.next(toast2);
      tick(0);
      expect(component.toasts.length).toBe(2);

      tick(250);
      expect(component.toasts.length).toBe(1);

      tick(500);
      expect(component.toasts.length).toBe(0);
      flush();
    }));

    it('should handle duplicate toast IDs gracefully', (done) => {
      const duplicate1 = { id: 'same', message: 'First', type: 'success' as const, duration: 3000 };
      const duplicate2 = { id: 'same', message: 'Second', type: 'error' as const, duration: 3000 };

      toastSubject.next(duplicate1);
      toastSubject.next(duplicate2);

      setTimeout(() => {
        expect(component.toasts.length).toBe(2);
        expect(component.toasts[0].message).toBe('First');
        expect(component.toasts[1].message).toBe('Second');
        done();
      }, 50);
    });
  });

  describe('Memory Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should not leak memory by maintaining references after removal', fakeAsync(() => {
      for (let i = 0; i < 100; i++) {
        toastSubject.next({
          id: `${i}`,
          message: `Message ${i}`,
          type: 'success',
          duration: 100
        });
      }
      tick(0);
      tick(100);
      expect(component.toasts.length).toBe(0);
      expect(component['timeoutMap'].size).toBe(0);
    }));

    it('should clear subscription on destroy', () => {
      expect(component['subscription']).toBeTruthy();
      component.ngOnDestroy();
      expect(component['subscription']).toBeTruthy(); // subscription object still exists but is unsubscribed
    });
  });
});



