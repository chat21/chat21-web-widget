import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Globals } from '../../utils/globals';
import { DepartmentModel } from '../../../models/department';
import { MessagingService } from '../../providers/messaging.service';

@Component({
  selector: 'app-selection-department',
  templateUrl: './selection-department.component.html',
  styleUrls: ['./selection-department.component.scss']
})

export class SelectionDepartmentComponent implements OnInit {
    // ========= begin:: Input/Output values ===========//
    @Output() eventDepartmentSelected = new EventEmitter<any>();
    @Output() eventClosePage = new EventEmitter();
    // ========= end:: Input/Output values ===========//

    // ========= begin:: component variables ======= //
    departments: DepartmentModel[];
    isLogged: boolean;
    token: string;
    // ========= end:: component variables ======= //

    constructor(
        public g: Globals,
        public messagingService: MessagingService
    ) {
    }

    ngOnInit() {
        this.getMongDbDepartments();
    }

    /**
     * recupero elenco dipartimenti
     * - recupero il token fisso
     * - mi sottoscrivo al servizio
     * - se c'è un solo dipartimento la setto di default
     * - altrimenti visualizzo la schermata di selezione del dipartimento
    */
    getMongDbDepartments() {
        if (this.g.token) {
            this.token = this.g.token;
            this.messagingService.getMongDbDepartments(this.token, this.g.projectid)
            .subscribe(
                response => {
                    this.departments = response;
                    console.log('OK DEPARTMENTS ::::', this.departments[0]);
                    // DEPARTMENT DEFAULT SEMPRE PRESENTE
                    if (this.departments.length === 1) {
                        this.onSelectDepartment(this.departments[0]);
                        //this.openSelectionDepartment = false;
                        //this.departmentSelected = this.departments[0];
                        //this.setFocusOnId('chat21-main-message-context');
                        //console.log('this.departmentSelected ::::', this.departmentSelected);
                    } else if (this.departments.length === 2) {
                        // UN SOLO DEPARTMENT
                        //this.openSelectionDepartment = false;
                        this.onSelectDepartment(this.departments[1]);
                        //this.departmentSelected = this.departments[1];
                        //this.setFocusOnId('chat21-main-message-context');
                        //console.log('this.departmentSelected ::::', this.departmentSelected);
                    } else if (this.departments.length > 2) {
                        //this.setFocusOnId('chat21-modal-select');
                        let i = 0;
                        this.departments.forEach(department => {
                            // console.log('DEPARTMENT ::::', department);
                            if (department['default'] === true) {
                                // console.log('ELIMINO DEPARTMENT::::', department);
                                this.departments.splice(i, 1);
                                // console.log('DEPARTMENTS::::', this.departments);
                                return;
                            }
                            i++;
                        });
                        //this.openSelectionDepartment = true;
                    } else {
                        //this.setFocusOnId('chat21-main-message-context');
                        //this.openSelectionDepartment = false;
                    }
                    this.isLogged = true;
                    //console.log('IS_LOGGED', 'AppComponent:getMongDbDepartments:', this.isLogged);
                },
                errMsg => {
                    console.log('http ERROR MESSAGE', errMsg);
                    // window.alert('MSG_GENERIC_SERVICE_ERROR');
                    //this.openSelectionDepartment = false;
                    //this.setFocusOnId('chat21-main-message-context');

                    this.isLogged = false;
                    console.log('IS_LOGGED', 'AppComponent:getMongDbDepartments:', this.isLogged);
                },
                () => {
                    // console.log('API ERROR NESSUNO');
                    // attivo pulsante aprichat!!!!!
                }
            );
            }
        
    }


  private onSelectDepartment(department) {
    console.log(' onSelectDepartment: ', department);
    this.eventDepartmentSelected.emit(department);
  }

  private closePage() {
    console.log(' closePage: ');
    this.eventClosePage.emit();
  }

}
