<div align="center">
  <!-- You are encouraged to replace this logo with your own! Otherwise you can also remove it. -->
  <img src="./docs/logo/png/logo_1.png" alt="logo" width="140"  height="auto" />
  <br/>

  <h2><b>Eventio – Full Stack Aplikacija</b></h2>
  <h3>Kompletna aplikacija za događaje sa backendom u .NET-u, frontendom u React Native (mobile) i React (web), i MongoDB bazom.</h3>

</div>

# 📗 Sadržaj

- [📖 Potrebni alati i softver](#potrebni-alati)
  - [🛠 Backend](#backend)
  - [📱 Frontend mobile](#frontend-mobile)
  - [🌐 Frontend web](#frontend-web)
  - [💾 Baza podataka](#database)
- [💻 Pokretanje projekta](#getting-started)
  - [🛠Backend (.NET)](#back)
  - [📱Frontend mobile (React Native)](#frontM)
  - [🌐Frontend web (React)](#frontW)
  - [💾 Podešavanje MongoDB konekcije](#mongo)
- [🧪 Testiranje API-ja](#test)
- [🔐 Autentifikacija](#auth)
- [📂 Struktura projekta](#structure)
- [🧵 Dodatne komande (frontend)](#komande)
- [👥 Authors](#authors)

# 🧰 Potrebni alati i softver <a name="potrebni-alati"></a>
## ✅ Backend (.NET 7/8) <a name="backend"></a>
- .NET SDK (7.0 ili noviji): https://dotnet.microsoft.com/en-us/download
- Preporučeno: Visual Studio 2022+ ili VS Code sa C# ekstenzijom

## ✅ Frontend mobile (React Native + Expo) <a name="frontend-mobile"></a>
- Node.js: https://nodejs.org/ (preporučena verzija 18+)
- Expo CLI: https://docs.expo.dev/get-started/installation/
  Komanda: npm install -g expo-cli

## ✅ Frontend web (React) <a name="frontend-web"></a>
- Node.js i npm

## ✅ Baza podataka (MongoDB) <a name="database"></a>
- MongoDB Community Server: https://www.mongodb.com/try/download/community
- Ili koristi MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

# 🚀 Pokretanje projekta <a name="getting-started"></a>

<details>
  <summary>Tabela sa kredencijalima</summary>
   |E-mail|First_name|Last_name|Password|Role|

   |jati@gmail.com|Ja|Ti|Sifra123|Organizator|

   |filip1@gmail.com|null|null||null|

   |johndoe@gmail.com|John|Doe|Sifra123|Organizator|
</details>
 
## 📦 Backend (.NET) <a name="back"></a>
1. Idi u backend folder:
```sh
   cd eventioBackend
```

2. Build komanda:
```sh
   dotnet build
```

3. Pokreni aplikaciju:
```sh
   dotnet run
```

4. Aplikacija će raditi na 
```sh
http://localhost:5202
```
ili
```sh 
https://localhost:7066
```
ako koristiš HTTPS
**⚠️ Ako koristiš cookie-based autentifikaciju, koristi HTTPS za Secure cookies.**


5.Publish aplikacije (opciono):
```sh
   dotnet publish -c Release -o ./publish
```

## 📱 Frontend mobile (React Native) <a name="frontM"></a>

### Pokreni build za Android:

```sh
   eas build -p android
```

### Pokreni build za iOS:

```sh
   eas build -p ios
```

### 📌 Moraš imati instaliran eas-cli:

```sh
   npm install -g eas-cli
```

### 📌 Pre toga, moraš imati eas.json fajl u projektu i biti prijavljen na Expo nalog:

```sh
   eas login
```

1. Idi u frontend folder:
```sh
   cd src/frontend-mobile
```

2. Instaliraj zavisnosti:
```sh
   npm install
```
3. Pokreni Expo projekat:
```sh
   npx expo start
```
## 🌐 Frontend web (React) <a name="frontW"></a>
1. Idi u web frontend folder
```sh
   src/frontend-web
```
2. Instaliraj zavisnosti:
```sh
   npm install
```
3. Build komanda:
```sh
   npm run build
```
4. Pokreni dev server:
```sh
   npm run dev
```
## 💾 Podešavanje MongoDB konekcije <a name="mongo"></a>
U appsettings.json (na backendu) dodaj konekcioni string:
```sh
   "MongoDbSettings": {
   "ConnectionString": "mongodb://localhost:27017",
   "DatabaseName": "eventio"
   }
```
# 🧪 Testiranje API-ja <a name="test"></a>
Ako koristiš Swagger:
Pokreni backend i idi na:
```sh
http://localhost:5202/swagger
```

# 🔐 Autentifikacija <a name="auth"></a>
- Backend koristi JWT cookie-based autentifikaciju.
- Koristiti http.

# 📂 Struktura projekta <a name="structure"></a>
```sh
   eventio/
   ├── src/
   |   ├──backend
   |        ├──eventioBackend/  # .NET Web API
   │   ├── frontend-mobile/    # React Native (Expo)
   │   └── frontend-web/       # React Web
```

# 🧵 Dodatne komande (frontend) <a name="komande"></a>
React Native:
- Pokretanje na Android emulatoru: npm run android
- Pokretanje na iOS simulatoru: npm run ios
- Pokretanje web aplikacije (React Native Web): npm run web

# 🤝 Autori <a name="authors"></a>
👤 **Mateja Lapatanović**

👤 **Bogdan Bogićević**

👤 **Aleksandar Vuletić**

👤 **Marta Stojković**

👤 **Filip Milosavljević**
