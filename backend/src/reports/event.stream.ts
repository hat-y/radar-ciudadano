import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

export interface ReportEvent {
  type: 'report.created' | 'report.updated' | 'report.deleted';
  data: any;
  timestamp: Date;
}

@Injectable()
export class ReportsStream {
  private subject = new Subject<ReportEvent>();

  emitCreated(report: any) {
    this.subject.next({
      type: 'report.created',
      data: report,
      timestamp: new Date(),
    });
  }

  emitUpdated(report: any) {
    this.subject.next({
      type: 'report.updated',
      data: report,
      timestamp: new Date(),
    });
  }

  emitDeleted(reportId: number) {
    this.subject.next({
      type: 'report.deleted',
      data: { id: reportId },
      timestamp: new Date(),
    });
  }

  asObservable(): Observable<ReportEvent> {
    return this.subject.asObservable();
  }
}
