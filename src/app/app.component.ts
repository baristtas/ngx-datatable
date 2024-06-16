import { Component, NgModule, OnInit } from '@angular/core';
import ilceler from '../assets/data/ilceler.json';
import iller from '../assets/data/iller.json';
import { ColumnMode, SelectionType, isNullOrUndefined } from '@swimlane/ngx-datatable';
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
  SelectionType = SelectionType;
  ColumnMode = ColumnMode;
  isDropdownOpen: boolean[] = [];
  selected :any[] =[];
  //MEMBERS END ---------------------------------------------------------------------------------------------------------------------

  constructor(private modalService: NgbModal) {
    console.log('constructed');
  }

  ngOnInit() {
    this.countiesArray = ilceler;
    this.citiesArray = iller;
    this.citiesArray = this.citiesArray.sort((a, b) => Number(a.id) - Number(b.id));

    console.log('Initialized');
  };

  ngAfterViewInit() {
    console.log("after view init");

    console.log(JSON.stringify(this.citiesArray[3]));
    this.selected.push(this.citiesArray[3]);
  }

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
  GetCityIdByName(cityName: string): number {
    try {
      var cityId = this.citiesArray.find(c => c.name == cityName).id;

      if (!isNullOrUndefined(cityId)) {
        return Number(cityId);
      }
    }
    catch (error) {
      console.log(error);
    }
    return -1;
  }

  updateValue(event: any, cell: any, p_rowIndex: number): void {
    var temp_oldValue = { ...this.countiesArray[p_rowIndex] };
    console.log(JSON.stringify(cell));
    if (cell != 'city') {
      this.countiesArray[p_rowIndex][cell] = event.target.value; //değişen veriyi update et.
    }
    else {
      this.countiesArray[p_rowIndex].city = this.GetCityIdByName(event.target.value);
    }

    var entityToAppend = {
      changeEntityId: this.changeHistoryArray.length, //Array içindeki indeks
      rowIndex: p_rowIndex,                           //Row index, sort kapalı olduğu için sabit
      oldValue: temp_oldValue,                        //Eski değer
      newValue: { ...this.countiesArray[p_rowIndex] }        //Yeni değer burada tutulur.
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
      temp_entities[0].newValue = { ...param_entity.newValue };
    }
    else { //Append et.
      this.uniqueChangesByRowId.push({ ...param_entity });
    }
  }
  CloseEveryEditMode(exceptRowIndex: boolean, p_rowIndex: number) {
    if (exceptRowIndex) {
      // Tüm değerleri false yap, p_rowIndex hariç
      this.editing = this.editing.map((value, index) => {
        return index === p_rowIndex ? value : false;
      });
    } else {
      this.editing = this.editing.map(() => false);
    }
  }

  ToggleEdit(event: any, rowIndex: number): void {
    this.CloseEveryEditMode(true, rowIndex);
    this.editing[rowIndex] = !this.editing[rowIndex];
  }

  toggleDropdown(p_rowIndex: number) {
    for (let i = 0; i < this.isDropdownOpen.length; i++) {
      if (i !== p_rowIndex) {
        this.isDropdownOpen[i] = false;
      }
    }
    this.isDropdownOpen[p_rowIndex] = !this.isDropdownOpen[p_rowIndex];
  }

  SaveChangesByRowIndex(rowIndex: number): void {
    //changeHistory listesinden rowIndex'in son değişim elemanını çek.
    //Alert ile ekrana bas.
    if (this.editing[rowIndex]) this.ToggleEdit(null, rowIndex); //Edit açıksa kapat.

    try {
      var temp_entity = this.uniqueChangesByRowId.filter(x => x.rowIndex == rowIndex);

      if (temp_entity.length > 0) {
        if (!isNullOrUndefined(temp_entity)) {
          const modalRef = this.modalService.open(ModalComponentComponent, { size: 'xl', scrollable: true });

          temp_entity.forEach(element => {
            element.oldValue.cityName = this.GetCityNameById(element.oldValue.city);
            element.newValue.cityName = this.GetCityNameById(element.newValue.city);
          });
          modalRef.componentInstance.changedEntities = temp_entity;
        }
      }
      else
        alert("GÖNDERİLEBİLECEK DEĞİŞİKLİK YOK!");
    }
    catch (error) {
      console.log(error)
    }
  }


  on_BatchSaveClicked() {
    try {
      this.CloseEveryEditMode(false,-1);
      var temp_entities = this.uniqueChangesByRowId;

      if (temp_entities.length > 0) {
        if (!isNullOrUndefined(temp_entities)) {
          const modalRef = this.modalService.open(ModalComponentComponent, { size: 'xl', scrollable: true });

          temp_entities.forEach(element => {
            element.oldValue.cityName = this.GetCityNameById(element.oldValue.city);
            element.newValue.cityName = this.GetCityNameById(element.newValue.city);
          });
          modalRef.componentInstance.changedEntities = temp_entities;
        }
      }
      else
        alert("GÖNDERİLEBİLECEK DEĞİŞİKLİK YOK!");
    }
    catch (error) {
      console.log(error)
    }
  }

  IsDropdownOpen(p_rowIndex: number): boolean {
    if (isNullOrUndefined(this.isDropdownOpen[p_rowIndex])) {
      return false;
    }
    return this.isDropdownOpen[p_rowIndex];
  }

  onCitySelect(event:any, p_rowIndex:number)
  {
    console.log('Select Event' + JSON.stringify(event.value) + " |||| " + JSON.stringify(this.selected) + ". RowIndex: " + p_rowIndex);
  }
}