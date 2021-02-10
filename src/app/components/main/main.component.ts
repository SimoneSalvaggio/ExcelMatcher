
import { Component, OnInit } from '@angular/core';
import FinalUser from 'src/app/models/FinalUser';
import Rule from 'src/app/models/Rule';
import Rules from 'src/app/models/Rules';
import User from 'src/app/models/User';
import Users from 'src/app/models/Users';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    this.excelRules=null;
    this.excelUsers= null;
    this.outputIsReady = false;
    this.areRulesConfirmed = false;
    this.areUsersConfirmed = false;
  }

  excelRules: Rules;
  confirmedRules: Rule[];
  areRulesConfirmed: boolean;
  excelUsers: Users;
  confirmedUsers: User[];
  areUsersConfirmed: boolean;
  finalOutputArray: FinalUser[];
  multipleOutputArray: FinalUser[];
  outputIsReady: boolean;

  onRulesFileChange(ev) {
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' });
      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      this.excelRules= jsonData;
    }
    reader.readAsBinaryString(file);
  }

  confirmRules(){
    this.confirmedRules = this.excelRules.regole;
    if (this.confirmedRules!=undefined) {
      this.areRulesConfirmed = true;
    } else {
      this.areRulesConfirmed = false;
    }
    console.log(this.confirmedRules);
  }

  onUtentiFileChange(ev) {
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' });
      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      this.excelUsers = jsonData;
      console.log(jsonData);
    }
    reader.readAsBinaryString(file);
  }

  confirmUsers(){
    this.confirmedUsers = this.excelUsers.utenti;
    if (this.confirmedUsers!=undefined) {
      this.areUsersConfirmed = true;
    } else {
      this.areUsersConfirmed = false;
    }
  }

  generateFinalOutput(){
    this.finalOutputArray = [];
    this.multipleOutputArray = [];
    for (let j = 0; j < this.confirmedRules.length; j++) {
      if (this.confirmedRules[j].numeroCorsi != null) {
        this.searchCombo(this.confirmedRules[j]);
      } else {
        for (let i = 0; i < this.confirmedUsers.length; i++) {
          if (this.confirmedUsers[i].idCorso == this.confirmedRules[j].corso && this.confirmedRules[j].numeroCorsi==null) {
            let fUser = new FinalUser();
            fUser.prodotto = this.confirmedRules[j].prodotto;
            fUser.dettaglio = this.confirmedRules[j].dettaglio;
            fUser.utente = this.confirmedUsers[i].utente;
            fUser.nome = this.confirmedUsers[i].nome;
            fUser.cognome = this.confirmedUsers[i].cognome;
            fUser.organizzazione = this.confirmedUsers[i].organizzazione;
            this.finalOutputArray.push(fUser);
          }
        }
      }
    }
    for (let i = 0; i < this.multipleOutputArray.length; i++) {
      this.finalOutputArray.push(this.multipleOutputArray[i]);
    }
    console.log(this.multipleOutputArray)
    this.outputIsReady = true;
  }

  searchCombo(rule: Rule){
    let match: number = 0;
    let combinedCourse: string[] = [];
    let differentCourseControl: string[] = []
    let isDuplicate: boolean = false;
    for (let j = 0; j < this.confirmedRules.length; j++) {
      if (this.confirmedRules[j].prodotto == rule.prodotto) {
        combinedCourse.push(this.confirmedRules[j].corso);
      }
    }
    for (let i = 0; i < this.confirmedUsers.length; i++) {
      if (this.controlForDuplicates(this.confirmedUsers[i].utente, rule.prodotto)) {
        console.log("step1")
        for (let j = 0; j < combinedCourse.length; j++) {
          if (this.confirmedUsers[i].idCorso == combinedCourse[j]) {
            console.log("step2")
            for (let y = 0; y < differentCourseControl.length; y++) {
              if (differentCourseControl[y]==combinedCourse[j]) {
                isDuplicate = true;
                console.log("step3 true")
              } else {
                isDuplicate = false;
                console.log("step3 false")
              }
            }
            if (!isDuplicate) {
              match++;
              differentCourseControl.push(combinedCourse[j])
            }
            if (match==rule.numeroCorsi) {
              let fUser = new FinalUser();
              fUser.prodotto = rule.prodotto;
              fUser.dettaglio = rule.dettaglio;
              fUser.utente = this.confirmedUsers[i].utente;
              fUser.nome = this.confirmedUsers[i].nome;
              fUser.cognome = this.confirmedUsers[i].cognome;
              fUser.organizzazione = this.confirmedUsers[i].organizzazione;
              this.multipleOutputArray.push(fUser);
              match = 0;
            }
          }
        }
      }
    }
  }

  controlForDuplicates(codUtente: string, codProdotto: string): boolean{
    let added: boolean = true;
    for (let index = 0; index < this.multipleOutputArray.length; index++) {
      if (codUtente == this.multipleOutputArray[index].utente && codProdotto == this.multipleOutputArray[index].prodotto) {
        added = false;
      }
    }
    return added;
  }

  export() {
    let element;
    element = document.getElementById('export-table');
    const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Utenti abilitati");
    XLSX.writeFile(wb, "utenti_abilitati" + ".xlsx");
  }
}
