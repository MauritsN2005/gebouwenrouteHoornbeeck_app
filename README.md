# Hoornbeeck Campusroute PWA — werkende lokaalkeuze en GPS-koppeling (v9)

PWA-demo met GPS en interactieve binnenroute op basis van de aangeleverde plattegrond.

## Werking
- GPS controleert of de gebruiker bij de campus is en levert het actuele startpunt voor de binnenroute.
- Buiten de campus kan de gebruiker een externe looproute naar de campus openen.
- Op de campus kiest de gebruiker een lokaal.
- De stip op de 4e-verdiepingsplattegrond volgt de actuele GPS-schatting. De stip wordt niet meer op een gang vastgezet. De blauwe lijn begint op exact dezelfde kaartcoördinaat als de stip, loopt naar het dichtstbijzijnde gangsegment en volgt vervolgens het gangen-netwerk naar het gekozen lokaal. Beide worden bij elke nieuwe meting bijgewerkt.
- De app kiest geen vaste startkamer. Je kunt je huidige lokaal expliciet aangeven om de kaartkoppeling af te stellen. Zonder recente GPS-meting verschijnt die plek duidelijk als handmatig aangegeven.
- Er is geen QR-code scanner.
- De PWA is offline-first: plattegrond, routeberekening, voortgang en XP werken zonder WiFi nadat de app één keer online is geladen/geïnstalleerd.
- XP wordt pas toegekend wanneer de gebruiker daadwerkelijk bij de gekozen bestemming is aangekomen. De app bevestigt dit met 3 opeenvolgende GPS-metingen binnen 8 meter van de doelpositie en een GPS-nauwkeurigheid van maximaal 15 meter.
- Bij het eerste lokaal dat op een verdieping wordt bereikt, wordt daarnaast +50 XP voor die verdieping toegekend. Alleen een verdieping openen geeft dus geen XP meer.

## Offline gebruiken
Open of installeer de PWA één keer terwijl je online bent, zodat de browser de app en plattegrond in de cache opslaat. Daarna kan de app zonder WiFi worden gestart en blijft de lokale route werken. GPS zelf is afhankelijk van de locatiehardware en instellingen van de telefoon; internet is niet nodig voor de lokale routeberekening. De externe wandelroute naar de campus is zonder internet niet beschikbaar.

## Starten
Open de map in Visual Studio Code en start `index.html` via Live Server of een andere localhost/HTTPS-server. GPS werkt in moderne browsers alleen op localhost of HTTPS.


## Belangrijk voor echte indoor-nauwkeurigheid

De browser-GPS wordt in gebouwen snel onnauwkeurig. De standaard kaartkoppeling uit de oorspronkelijke app is bovendien geschat. Een GPS-positie kan daardoor buiten de kaart vallen terwijl je wel binnen bent. Deze versie laat je die koppeling op je eigen apparaat afstellen. Tot die tijd gebruikt de app de oorspronkelijke waarden bij `gpsMap.anchor`, `mapWidthMeters` en `mapHeightMeters` in `app.js`.

Het gekleurde gebied rond de stip toont de door de browser opgegeven GPS-nauwkeurigheid in meters. De extra afwijking van het gekozen referentiepunt en de afstelling zit niet in dat gebied. De stip blijft dus een schatting; het instellen van een referentiepunt maakt de GPS-hardware niet nauwkeuriger.

## Als je positie buiten de kaart staat
1. Ga naar een lokaal dat op deze plattegrond staat en open een route op de **4e verdieping**.
2. Open onder de kaart **Kaartpositie afstellen**. Bij een buitenpositie opent dit vak vanzelf.
3. Klik bij **Ik ben nu in lokaal** op de grote knop van het lokaal waar je werkelijk bent. Dit hoeft niet je bestemming te zijn. Bij **4.03** staat ook **B403**; deze versie neemt aan dat die namen hetzelfde lokaal op de aangeleverde plattegrond aanduiden.
4. Klik **Gebruik als huidige plek**. Je gekozen plek verschijnt direct op de kaart. Met een recente GPS-meting koppelt de app die meting aan de marker van het lokaal. Daarna verplaatsen nieuwe metingen de stip en route op basis van de verandering in GPS.
5. Voor betere richting en schaal: loop naar een verder gelegen lokaal, kies dat lokaal en klik **Tweede referentiepunt toevoegen**. De app berekent dan ook de draaiing en schaal van GPS naar de kaart. Bij onvoldoende afstand of te grote GPS-afwijking blijft de eerste afstelling behouden en verschijnt een melding.

Een ontbrekende of oude GPS-meting blokkeert de lokaalknoppen niet. Voor het afstellen gebruikt de app alleen een meting van maximaal 5 seconden oud. Ontbreekt die, dan verschijnt de gekozen plek als **Handmatig aangegeven** en probeert de app gedurende 20 seconden een nieuwe meting te koppelen. Blijf daarbij op de gekozen plek staan. Lukt het niet of verlaat je ondertussen de app, dan blijft de plek handmatig zichtbaar en moet je je huidige lokaal opnieuw bevestigen om GPS te koppelen. Een later binnenkomende meting wordt niet stilzwijgend aan je oude plek gekoppeld. De handmatige plek wordt niet bewaard na herladen en geeft geen XP.

Bij onnauwkeurige GPS mag je wel expliciet je huidige lokaal koppelen; de app toont dat volgende schattingen ruim kunnen afwijken. Een pc zonder nauwkeurige locatiebron kan beweging binnen het gebouw niet betrouwbaar volgen. De lokaalknoppen geven je een handmatige keuze, geen automatische herkenning van het lokaal.

De afstelling is per plattegrond en per browser/apparaat opgeslagen. Ze bevat één of twee GPS-referentiepunten en wordt niet naar een server gestuurd. Je hoeft niet steeds je huidige lokaal op te geven: na de eerste afstelling volgt de app nieuwe GPS-metingen automatisch, ook nadat je de pagina herlaadt. **Afstelling wissen** verwijdert deze instelling; je XP blijft behouden. Bij een gewijzigde plattegrond wordt een oude afstelling automatisch genegeerd.

Een eerste referentiepunt corrigeert de verschuiving. Een tweede referentiepunt corrigeert ook richting en schaal. Dit blijft afstellen met telefoon- of browser-GPS, geen nauwkeurige landmeting of indoor-positioning.

Let op: standaard telefoon-GPS kan binnen niet betrouwbaar genoeg zijn om een lokaal op kamerniveau of de juiste verdieping te bewijzen. Deze versie gebruikt daarom een strenge nabijheidscontrole als praktische benadering. Voor echt betrouwbare indoor-aankomst heb je aanvullende indoor-positioning nodig, bijvoorbeeld BLE-beacons, Wi-Fi RTT of UWB.

## Automatische GPS-update
De app start de GPS-watcher automatisch zodra de app zichtbaar is (na toestemming van de browser). Daarbij vraagt de app direct een nieuwe, zo nauwkeurig mogelijke meting op, zonder een oude meting uit de GPS-cache te gebruiken. Als de watcher even niets levert, vraagt de app na 3 seconden opnieuw een meting op. Periodieke extra metingen worden niet overlappend opgevraagd; het precieze meettempo wordt door de telefoon en browser bepaald.

Zodra GPS is gekoppeld, worden de actuele positie, de resterende blauwe route, de geschatte afstand en de aankomstcontrole bijgewerkt terwijl je loopt. De kaart blijft staan tijdens een update, zodat je scherm en knoppen niet telkens opnieuw worden opgebouwd. Bij snelle opeenvolgende metingen wordt altijd de laatste positie getoond.

Ook bij een onnauwkeurige meting (meer dan ±35 m) blijft de stip bewegen, met een groter nauwkeurigheidsgebied en een melding dat het om een ruime schatting gaat. De strengere grens voor aankomst en XP blijft gelden.

Valt de GPS-schatting buiten de plattegrond, dan verschijnt een richtingaanwijzer **GPS** aan de kaartrand. De binnenroute wordt dan verborgen totdat de schatting weer op de kaart ligt. Een buitenpositie wordt niet als een positie in een lokaal voorgesteld.

Bij een meting ouder dan 15 seconden of een GPS-fout blijft de laatste positie staan met een grijze stip en een melding. Zonder eerste meting toont de app **START** bij de centrale trap/lift; dit is geen gemeten positie.

Na terugkeer uit een ander tabblad, na ontgrendelen of na herstel uit de browsergeschiedenis start de app de locatiecontrole opnieuw en vraagt direct een verse meting op. Terwijl de app verborgen is, stopt de watcher. Houd de app zichtbaar tijdens het lopen: achtergrondtracking wordt door mobiele browsers beperkt.

Oude of dubbele meettijdstippen worden genegeerd, zodat één GPS-meting niet als meerdere aankomstbevestigingen kan tellen. Bij een tijdelijke meetfout blijft de watcher actief. Bij geweigerde toestemming stopt de locatiecontrole; geef de browser toestemming en kies daarna **Opnieuw proberen**.

## Deze versie installeren
Vervang alle bestaande appbestanden door de bestanden uit deze ZIP, inclusief `index.html` en `sw.js`, en open de app online via HTTPS of localhost. De cache heet nu `hoornbeeck-route-v9-lokaalkeuze`. Appcode en CSS worden online eerst vers opgehaald en blijven offline beschikbaar. De pagina verwijst bovendien naar de nieuwe versie van de scripts en stijlen.

Herlaad de app na het vervangen. Staat de oude versie nog open, herlaad dan na de serviceworker-update nogmaals. Onder de kaart staat **v9-lokaalkeuze**; daarmee kun je controleren dat de nieuwe versie actief is. Er is geen wijziging in je lokaal opgeslagen XP.

## Controleren op je telefoon
1. Open **Gebouwen**, kies **Hoofdgebouw**, **4e verdieping** en een lokaal.
2. Sta locatietoegang toe. Staat de GPS buiten de kaart, open dan **Kaartpositie afstellen**, klik op je huidige lokaal en vervolgens op **Gebruik als huidige plek**. De knop werkt ook zonder verse GPS; de app meldt dan dat je plek handmatig is aangegeven en vraagt een nieuwe meting op.
3. Loop de route met de app zichtbaar. De marker en resterende blauwe lijn moeten meebewegen met nieuwe GPS-metingen; onder de kaart staat hoe recent de laatste meting is.
4. Open kort een ander tabblad en keer terug. De app vraagt direct een nieuwe locatie op.
5. Bij zwak GPS blijft de schatting bijwerken en wordt het gekleurde nauwkeurigheidsgebied groter. Alleen bij een oude of mislukte meting wordt de stip grijs.

## Controle van de wijziging
Er zijn 33 gesimuleerde controles geslaagd op locatieverwerking en HTML/SVG-weergave. Ze bedienen de zichtbare lokaalknoppen, waaronder B403, en controleren kiezen zonder eerste GPS-meting, direct tonen van de handmatige plek, koppelen aan een nieuwe meting, verlopen verzoeken, veranderen van lokaal en verlaten van de app tijdens het wachten. Verder controleren ze automatisch meelopen, bewaren en opnieuw laden, twee referentiepunten voor richting en schaal, oude metingen, het wissen van een afstelling en het behouden van XP. De online/offline-cache is apart gecontroleerd. Er is geen praktijktest uitgevoerd op jouw apparaat of in het gebouw.
