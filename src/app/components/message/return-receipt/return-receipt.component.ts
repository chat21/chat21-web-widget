import { Component, Input, OnInit } from '@angular/core';
import { MSG_STATUS_RETURN_RECEIPT, MSG_STATUS_SENT, MSG_STATUS_SENT_SERVER } from '../../../../chat21-core/utils/constants';

@Component({
  selector: 'tiledeskwidget-return-receipt',
  templateUrl: './return-receipt.component.html',
  styleUrls: ['./return-receipt.component.scss']
})
export class ReturnReceiptComponent implements OnInit {

  @Input() status: number;

  // ========== begin:: set icon status message
  MSG_STATUS_SENT = MSG_STATUS_SENT;
  MSG_STATUS_SENT_SERVER = MSG_STATUS_SENT_SERVER;
  MSG_STATUS_RETURN_RECEIPT = MSG_STATUS_RETURN_RECEIPT;
  // ========== end:: icon status message

  constructor() { }

  ngOnInit() {
  }

}
