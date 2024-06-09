import { Component, NgModule, OnInit } from '@angular/core';
import ilceler from '../assets/data/ilceler.json';
import iller from '../assets/data/iller.json';
import { isNullOrUndefined } from '@swimlane/ngx-datatable';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponentComponent } from './modal-component/modal-component.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ngx-datatables-case';

  //MEMBERS START -------------------------------------------------------------------------------------------------------------------

  citiesArray: any[] = [];        //İller verisini jsondan alıyorum, tablodaki değişiklikleri array'e de yansıtıyorum.
  countiesArray: any[] = [];      //İlçeler verisini jsondan alıyorum, tablodaki değişiklikleri array'e de yansıtıyorum.
  changeHistoryArray: any[] = []; //Rowda her yapılan değişikliği adım adım tutar.
  uniqueChangesByRowId: any[] = []; //Row'un ilk hali ve son halini tutar.
  editing: any[] = [];

  //MEMBERS END ---------------------------------------------------------------------------------------------------------------------

  constructor(private modalService: NgbModal) {
    console.log('constructed');
  }

  ngOnInit() {
    this.countiesArray = ilceler;
    this.citiesArray = iller;


    console.log('Initialized');
  };

  GetCityNameById(cityId: string): string {
    try {
      var cityEntity = this.citiesArray.find(c => c.id == cityId).name;

      if (cityEntity) {
        return cityEntity.toString();
      }
    }
    catch (error) {
      console.log(error);
    }
    return "Tanımsız";
  }

  updateValue(event: any, cell: any, p_rowIndex: number): void {
    var temp_oldValue = {...this.countiesArray[p_rowIndex]};
    this.countiesArray[p_rowIndex][cell] = event.target.value; //değişen veriyi update et.

    var entityToAppend = {
      changeEntityId: this.changeHistoryArray.length, //Array içindeki indeks
      rowIndex: p_rowIndex,                           //Row index, sort kapalı olduğu için sabit
      oldValue: temp_oldValue,                        //Eski değer
      newValue: {...this.countiesArray[p_rowIndex]}        //Yeni değer burada tutulur.
    };
    this.changeHistoryArray.push(entityToAppend); //Change history'e old ve new value'yu ekler. Bu şekilde entity'nin ilk haline dönebiliriz.
    this.UpdateLocalChangesArray(entityToAppend); //Her rowId için maximum bir değiştirilmiş veri entity'si tutar.

    this.countiesArray = [...this.countiesArray]; //dokümantasyon change detection ??????
  }

  UpdateLocalChangesArray(param_entity: any): void {
    //uniqueChangesByRowId listesinde entity'nin rowId'si var mı diye bak.
    // varsa değeri update et.
    //Yoksa yeni referans ile append et.
    var temp_entities = this.uniqueChangesByRowId.filter(x => x.rowIndex == param_entity.rowIndex);
    if (temp_entities.length > 0) { //Update et
      temp_entities[0].newValue = {...param_entity.newValue};
    }
    else { //Append et.
      this.uniqueChangesByRowId.push({...param_entity});
    }
  }

  ToggleEdit(event: any, rowIndex: number): void {
    console.log("EDIT TOGGLE BEFORE: " + this.editing[rowIndex]);
    if (this.editing[rowIndex] != null) {
      this.editing[rowIndex] = !this.editing[rowIndex];
    }
    else {
      this.editing[rowIndex] = true;
    }
    console.log("EDIT TOGGLE AFTER: " + this.editing[rowIndex]);
  }


  SaveChangesByRowIndex(rowIndex: number): void {
    //changeHistory listesinden rowIndex'in son değişim elemanını çek.
    //Alert ile ekrana bas.
    if (this.editing[rowIndex]) this.ToggleEdit(null, rowIndex); //Edit açıksa kapat.

    try {
      var filteredChangesArray = this.changeHistoryArray.filter(x => x.rowIndex == rowIndex);

      if (filteredChangesArray.length > 0) {
        var entity = filteredChangesArray.sort((a, b) => b.changeEntityId - a.changeEntityId).at(0); // desc

        if (!isNullOrUndefined(entity)) {
          const modalRef = this.modalService.open(ModalComponentComponent,{size:'xl'});
          modalRef.componentInstance.changedEntities = [{
            cityName: this.GetCityNameById(entity.newValue.city),
            countyId: entity.newValue.id,
            countyName: entity.newValue.name
          }];
        }
      }
      else
        alert("CHANGE YOK!!!");
    }
    catch (error) {
      console.log(error)
    }
  }


  on_BatchSaveClicked()
  {
    const modalRef = this.modalService.open(ModalComponentComponent,{size:'xl'});
    modalRef.componentInstance.changedEntities = {...this.uniqueChangesByRowId};
  }

}