# Hoornbeeck Campusroute PWA — live locatie (v6)

PWA-demo met GPS en interactieve binnenroute op basis van de aangeleverde plattegrond.

## Werking
- GPS controleert of de gebruiker bij de campus is en levert het actuele startpunt voor de binnenroute.
- Buiten de campus kan de gebruiker een externe looproute naar de campus openen.
- Op de campus kiest de gebruiker een lokaal.
- De 4e-verdiepingsplattegrond berekent een dynamische blauwe route vanaf het actuele GPS-startpunt naar het gekozen lokaal. De positie wordt op het dichtstbijzijnde gangsegment geplaatst, ook tussen knooppunten. De marker schuift mee en de resterende route wordt bij elke nieuwe meting opnieuw berekend.
- Er is geen QR-code scanner.
- De PWA is offline-first: plattegrond, routeberekening, voortgang en XP werken zonder WiFi nadat de app één keer online is geladen/geïnstalleerd.
- XP wordt pas toegekend wanneer de gebruiker daadwerkelijk bij de gekozen bestemming is aangekomen. De app bevestigt dit met 3 opeenvolgende GPS-metingen binnen 8 meter van de doelpositie en een GPS-nauwkeurigheid van maximaal 15 meter.
- Bij het eerste lokaal dat op een verdieping wordt bereikt, wordt daarnaast +50 XP voor die verdieping toegekend. Alleen een verdieping openen geeft dus geen XP meer.

## Offline gebruiken
Open of installeer de PWA één keer terwijl je online bent, zodat de browser de app en plattegrond in de cache opslaat. Daarna kan de app zonder WiFi worden gestart en blijft de lokale route werken. GPS zelf is afhankelijk van de locatiehardware en instellingen van de telefoon; internet is niet nodig voor de lokale routeberekening. De externe wandelroute naar de campus is zonder internet niet beschikbaar.

## Starten
Open de map in Visual Studio Code en start `index.html` via Live Server of een andere localhost/HTTPS-server. GPS werkt in moderne browsers alleen op localhost of HTTPS.


## Belangrijk voor echte indoor-nauwkeurigheid

De browser-GPS wordt in gebouwen snel onnauwkeurig. De 4e-verdiepingsroute werkt daarom met GPS + een gangen-netwerk. De kalibratie staat in `app.js` bij `gpsMap.anchor`, `mapWidthMeters` en `mapHeightMeters`; vul daar echte meetwaarden van het gebouw in om de projectie op de plattegrond zo goed mogelijk te maken.

Let op: standaard telefoon-GPS kan binnen niet betrouwbaar genoeg zijn om een lokaal op kamerniveau of de juiste verdieping te bewijzen. Deze versie gebruikt daarom een strenge nabijheidscontrole als praktische benadering. Voor echt betrouwbare indoor-aankomst heb je aanvullende indoor-positioning nodig, bijvoorbeeld BLE-beacons, Wi-Fi RTT of UWB.

## Automatische GPS-update
De app start de GPS-watcher automatisch zodra de app zichtbaar is (na toestemming van de browser). Daarbij vraagt de app direct een nieuwe, zo nauwkeurig mogelijke meting op, zonder een oude meting uit de GPS-cache te gebruiken. Als de watcher even niets levert, vraagt de app na 3 seconden opnieuw een meting op. Periodieke extra metingen worden niet overlappend opgevraagd; het precieze meettempo wordt door de telefoon en browser bepaald.

De actuele positie, de resterende blauwe route, de geschatte afstand en de aankomstcontrole worden bijgewerkt terwijl je loopt. De kaart blijft staan tijdens een update, zodat je scherm en knoppen niet telkens opnieuw worden opgebouwd. Bij snelle opeenvolgende metingen wordt altijd de laatste positie getoond.

Bij een onnauwkeurige meting (meer dan ±35 m), een positie buiten de plattegrond of een meting ouder dan 15 seconden blijft de laatst bruikbare positie staan en meldt de app waarom er geen live positie beschikbaar is. Zonder bruikbare meting toont de app een marker met **START** bij de centrale trap/lift. Dit startpunt wordt niet als jouw gemeten locatie voorgesteld.

Na terugkeer uit een ander tabblad, na ontgrendelen of na herstel uit de browsergeschiedenis start de app de locatiecontrole opnieuw en vraagt direct een verse meting op. Terwijl de app verborgen is, stopt de watcher. Houd de app zichtbaar tijdens het lopen: achtergrondtracking wordt door mobiele browsers beperkt.

Oude of dubbele meettijdstippen worden genegeerd, zodat één GPS-meting niet als meerdere aankomstbevestigingen kan tellen. Bij een tijdelijke meetfout blijft de watcher actief. Bij geweigerde toestemming stopt de locatiecontrole; geef de browser toestemming en kies daarna **Opnieuw proberen**.

## Deze versie installeren
Vervang de bestaande appbestanden door de bestanden uit deze ZIP en open de app één keer online via HTTPS of localhost. De offline-cache heeft een nieuwe versienaam (`hoornbeeck-route-v6-live`), zodat de bijgewerkte app wordt opgeslagen. Als de app al openstond tijdens het vervangen, sluit en open of herlaad hem na het laden van de nieuwe versie.

## Controleren op je telefoon
1. Open **Gebouwen**, kies **Hoofdgebouw**, **4e verdieping** en een lokaal.
2. Sta locatietoegang toe en wacht op **Live positie ✓**. De marker toont nu **JIJ**.
3. Loop de route met de app zichtbaar. De marker en resterende blauwe lijn moeten meebewegen met nieuwe GPS-metingen; onder de kaart staat hoe recent de laatste meting is.
4. Open kort een ander tabblad en keer terug. De app vraagt direct een nieuwe locatie op.
5. Test bij zwak GPS of de app **Laatst bekende positie** toont. Binnen het gebouw blijft de nauwkeurigheid afhankelijk van het GPS-signaal en de kalibratie van de plattegrond.
