import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-content',
  templateUrl: './modal-component.component.html'
})
export class ModalComponentComponent {
  @Input() changedEntities: any[] | undefined;

  constructor(public activeModal: NgbActiveModal) {}
}