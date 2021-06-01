import { Component, Input, OnInit } from '@angular/core';
import { MSG_STATUS_RETURN_RECEIPT, MSG_STATUS_SENT, MSG_STATUS_SENT_SERVER } from '../../../utils/constants';

@Component({
  selector: 'chat-return-receipt',
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
