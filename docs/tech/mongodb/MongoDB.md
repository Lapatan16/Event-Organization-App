# Instalacija i Povezivanje sa MongoDB Lokalnim Serverom

### MongoDB je popularna NoSQL baza podataka koja koristi dokumentno orijentisani model podataka. Ovaj vodič pokriva instalaciju MongoDB-a na Windows operativnom sistemu i povezivanje na lokalni server.

---

## 1. Preuzimanje i instalacija MongoDB-a

### 1) Posetite zvanični [MongoDB](https://www.mongodb.com/try/download/community) sajt za preuzimanje.
### 2) Izaberite operativni sistem (Windows 64-bit) i preuzmite MSI instalacioni fajl (MongoDB Community Server)
![Download1](slike/download4.png)
### 3) Pokrenite instalaciju i pratite sledeće korake:
   - Izaberite "Complete" instalaciju

   ![Install1](slike/install1.png)
   - Ostavite uključenu opciju "Install MongoDB as a Service"

   ![Install2](slike/install2.png)
   - Po želji instalirajte MongoDB Compass (GUI alat)

   ![Install3](slike/install3.png)

---

## 2. Preuzimanje i instalacija MongoSH

### 1) Posetite zvanični [MongoSH](https://www.mongodb.com/try/download/shell) sajt za preuzimanje.
### 2) Izaberite operativni sistem (Windows 64-bit) i preuzmite MongoDB Shell
![Shell1](slike/shell3.png)
### 3) Raspakujte zip fajl
![Shell2](slike/shell4.png)
### 4) Pratite sledece korake:
   - Unutar raspakovanog foldera u folderu bin nalazi se .exe fajl
   ![Shell3](slike/shell5.png)
   - Desnim klikom na fajl otvoriće se meni sa opcijom Properties na koju je potrebno kliknuti. Potrebno je kopirati lokaciju prikazanu na slici
   ![Shell4](slike/shell6.png)
   - Klikom na Windows dugme se otvara Search bar u kome je potrebno uneti "environment" i izabrati opciju kao na slici
   ![Shell5](slike/shell7.png)
   - U tabu Advanced kliknuti dugme Environment Variables

   ![Shell6](slike/shell8.png)
   - Kliknuti na New kao na slici.

   ![Shell7](slike/shell9.png)
   - Dati unikatno ime varijabli i prelepiti kopiranu lokaciju.

   ![Shell8](slike/shell10.png)

## 3. Uputsvo za pokretanje MongoSH u VSC-u

### 1) U "Extensions" tabu u VSC-u instalirati prikazanu ekstenziju
![Mongoshvsc1](slike/mongoshVSC1.png)

### 2) Pojaviće se novi tab gde se nalazi prikazana komanda
![Mongoshvsc2](slike/mongoshVSC2.png)

### 3) Kliknite na "Open form" kao na slici
![Mongoshvsc3](slike/mongoshVSC3.png)

### 4) Save & Connect
![Mongoshvsc4](slike/mongoshVSC4.png)

### 5) Sa leve strane ce pozeleneti logo servera, i desnim klikom ce se pojaviti meni. Izabrati komandu kao sa slike
![Mongoshvsc5](slike/mongoshVSC5.png)


## 4. Povezivanje na lokalni MongoDB server pomoću MongoDB Compass-a

### 1) Kliknuti na dugme kao na slici
![Conenct1](slike/connect1.png)

### 2) U opciju "Uri" uneti lokaciju kao sa slike i kliknuti na "Save & Connect"
![Connect2](slike/connect2.png)


## 5. Kreiranje baze preko MongoDB Compass-a

### 1. Nakon povezivanja na lokalni server, pored servera kliknuti na znak "plus"

![Create1](slike/CreateDB1.png)

### 2. Dodati naziv bazi i kolekciji i napraviti bazu klikom na "Create Database"

![Create2](slike/CreateDB2.png)


## 6. Popunjavanje baze podacima preko MongoDB Compass-a

### 1. Kada otvorimo novo-kreiranu bazu, otvoriće nam se prozor kao na slici. Kliknuti na "Add data" pa zatim na "Insert document"

![Add1](slike/addData1.png)

### 2. Uneti podatke u fomratu kao na slici, zatim kliknuti sa desne strane dugme za formatiranje i kliknuti "Insert"

![Add2](slike/addData2.png)

## 7. Testiranje konekcije U mongo shell-u:

```js
use testdb
db.testCollection.insertOne({ime: "Test", vrednost: 123})
db.testCollection.find()
```

