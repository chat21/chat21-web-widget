import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Globals } from '../../utils/globals';

import { DepartmentModel } from '../../../models/department';
import { MessagingService } from '../../providers/messaging.service';
import { StorageService } from '../../providers/storage.service';

@Component({
    selector: 'tiledeskwidget-selection-department',
    templateUrl: './selection-department.component.html',
    styleUrls: ['./selection-department.component.scss']
})

export class SelectionDepartmentComponent implements OnInit, AfterViewInit {
    @ViewChild('afSelectionDepartment') private afSelectionDepartment: ElementRef;

    // ========= begin:: Input/Output values ===========//
    @Output() eventDepartmentSelected = new EventEmitter<any>();
    @Output() eventClosePage = new EventEmitter();
    @Output() eventOpenPage = new EventEmitter();
    // @Input() token: string;
    // ========= end:: Input/Output values ===========//

    // ========= begin:: component variables ======= //
    // departments: DepartmentModel[];
    // isLogged: boolean;
    // projectid: string;
    // ========= end:: component variables ======= //

    constructor(
        public g: Globals,
        public messagingService: MessagingService,
        public storageService: StorageService,
    ) {
    }

    ngOnInit() {
        this.g.wdLog(['ngOnInit :::: SelectionDepartmentComponent']);
    }

    ngAfterViewInit() {
        setTimeout(() => {
            if (this.afSelectionDepartment) {
                this.afSelectionDepartment.nativeElement.focus();
            }
        }, 1000);
    }


    // initDepartments() {
    //      that.g.wdLog(['initDepartments ::::', this.g.departments);
    //     if (this.g.departments.length === 1) {
    //         // DEPARTMENT DEFAULT SEMPRE PRESENTE
    //          that.g.wdLog(['DEPARTMENT DEFAULT ::::', this.g.departments[0]);
    //         this.setDepartment(this.g.departments[0]);
    //     } else if (this.g.departments.length === 2) {
    //         // UN SOLO DEPARTMENT
    //          that.g.wdLog(['DEPARTMENT FIRST ::::', this.g.departments[1]);
    //         this.setDepartment(this.g.departments[1]);
    //     } else if (this.g.departments.length > 2) {
    //         let i = 0;
    //         this.g.departments.forEach(department => {
    //             if (department['default'] === true) {
    //                 this.g.departments.splice(i, 1);
    //                 return;
    //             }
    //             i++;
    //         });
    //         this.openPage();
    //     } else {
    //         // DEPARTMENT DEFAULT NON RESTITUISCE RISULTATI !!!!
    //     }
    // }

    /**
     *
    */
    setDepartment(department: any) {
        this.g.setParameter('departmentSelected', department);
        if (this.g.attributes) {
            const attributes = this.g.attributes;
            this.g.setAttributeParameter('departmentId', department._id);
            this.g.setAttributeParameter('departmentName', department.name);
            // attributes.departmentId = department._id;
            // attributes.departmentName = department.name;
            // this.g.setParameter('attributes', attributes);
            this.storageService.setItem('attributes', JSON.stringify(attributes));
            this.g.wdLog(['setAttributes setDepartment: ', JSON.stringify(attributes)]);
        }
        this.closePage();
    }


    // /**
    //  * recupero elenco dipartimenti
    //  * - recupero il token fisso
    //  * - mi sottoscrivo al servizio
    //  * - se c'è un solo dipartimento la setto di default
    //  * - altrimenti visualizzo la schermata di selezione del dipartimento
    // */
    // getMongDbDepartments() {
    //     const that = this;
    //      that.g.wdLog(['getMongDbDepartments ::::', this.g.projectid);
    //     this.messagingService.getMongDbDepartments( this.g.projectid )
    //     .subscribe(response => {
    //         that.departments = response;
    //         if (that.departments.length === 1) {
    //             // DEPARTMENT DEFAULT SEMPRE PRESENTE
    //             that.onSelectDepartment(that.departments[0]);
    //         } else if (that.departments.length === 2) {
    //             // UN SOLO DEPARTMENT
    //             that.onSelectDepartment(that.departments[1]);
    //         } else if (that.departments.length > 2) {
    //             let i = 0;
    //             that.departments.forEach(department => {
    //                 if (department['default'] === true) {
    //                     that.departments.splice(i, 1);
    //                     return;
    //                 }
    //                 i++;
    //             });
    //         } else {
    //             // DEPARTMENT DEFAULT NON RESTITUISCE RISULTATI
    //         }
    //         // that.isLogged = true;
    //     },
    //     errMsg => {
    //          that.g.wdLog(['http ERROR MESSAGE', errMsg);
    //         // that.isLogged = false;
    //     },
    //     () => {
    //             //  that.g.wdLog(['API ERROR NESSUNO');
    //             // attivo pulsante aprichat!!!!!
    //     });
    // }




    // ========= begin:: ACTIONS ============//
    private onSelectDepartment(department) {
        this.g.wdLog([' onSelectDepartment: ', department]);
        this.setDepartment(department);
        this.eventDepartmentSelected.emit(department);
    }

    openPage() {
        this.g.wdLog([' openPage: ']);
        this.eventOpenPage.emit();
    }

    closePage() {
        this.g.wdLog([' closePage:  SelectDepartment']);
        this.eventClosePage.emit();
    }
    // ========= end:: ACTIONS ============//

}
