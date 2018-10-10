import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslatorService } from '../../providers/translator.service';

@Component({
  selector: 'app-selection-department',
  templateUrl: './selection-department.component.html',
  styleUrls: ['./selection-department.component.scss']
})
export class SelectionDepartmentComponent implements OnInit {
  @Input() departments: any;
  @Input() themeColor: string;
  @Input() themeForegroundColor: string;

  @Output() messageEvent = new EventEmitter<string>();


  LABEL_SELECT_TOPIC: string;

  constructor(
    private translatorService: TranslatorService,
  ) {
    this.initAll();
  }

  ngOnInit() {
  }

  private initAll() {
    this.translate();
  }

  private translate() {
    this.LABEL_SELECT_TOPIC = this.translatorService.translate('LABEL_SELECT_TOPIC');
  }

  /** */
  private onSelectDepartment(department) {
    console.log('onSelectDepartment: ', department);
    this.messageEvent.emit(department);
    // this.openSelectionDepartment = false;
    // this.departmentSelected = department;
    // this.setFocusOnId('chat21-main-message-context');
  }

}
