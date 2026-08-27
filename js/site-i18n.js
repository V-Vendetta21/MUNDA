/* ============================================================
   MUNDA — Website internationalization (js/site-i18n.js)
   Language dictionary + selector for the marketing website.
   Locales: English (default), German, Albanian, French,
   plus an "Other" group of additional national languages.
   Missing keys fall back to English, then to the raw key.
   ============================================================ */
(function () {
  'use strict';

  var LOCALES = [
    { code: 'en', name: 'English', flag: '🇬🇧', tab: 'EN' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪', tab: 'DE' },
    { code: 'sq', name: 'Shqip', flag: '🇦🇱', tab: 'AL' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', tab: 'FR' }
  ];
  var OTHER_LOCALES = [
    { code: 'es', name: 'Español', flag: '🇪🇸', tab: 'ES' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹', tab: 'IT' },
    { code: 'pt', name: 'Português', flag: '🇵🇹', tab: 'PT' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷', tab: 'TR' },
    { code: 'pl', name: 'Polski', flag: '🇵🇱', tab: 'PL' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱', tab: 'NL' }
  ];

  var KEY = 'munda.site.lang';

  var DICT = {
    en: {
      'nav.home': 'Home',
      'nav.technology': 'Technology',
      'nav.manufacturing': 'Manufacturing',
      'nav.kosova': 'MUNDA Kosova',
      'nav.innovation': 'Innovation',
      'nav.game': 'Interactive Game',
      'nav.play': 'PLAY THE GAME',
      'nav.askLoom': 'ASK LOOM',
      'nav.menu': 'Menu',

      'hero.overline': 'TEXTILE · ELECTRONICS · LIGHT',
      'hero.title1': 'LIGHTING,',
      'hero.title2': 'REIMAGINED.',
      'hero.sub': 'Flexible textile lighting systems for the next generation of automotive interiors.',
      'hero.lead': 'MUNDA combines advanced textile engineering with intelligent LED technology to create flexible, functional, and aesthetically integrated lighting solutions for modern vehicles.',
      'hero.cta1': 'EXPLORE OUR TECHNOLOGY',
      'hero.cta2': 'PLAY THE INTERACTIVE EXPERIENCE',

      'about.overline': 'WHAT IS MUNDA?',
      'about.title': 'ENGINEERING LIGHT INTO TEXTILES',
      'about.p1': 'MUNDA Textile Lichtsysteme GmbH develops innovative textile lighting systems by combining advanced technical textiles with LED-based electronic technology.',
      'about.p2': 'The result is a new generation of lighting elements that are flexible, visually integrated, and designed for modern automotive interiors.',
      'pipe.textile': 'TEXTILE',
      'pipe.textile.i': 'Technical fabric substrate',
      'pipe.electronics': 'ELECTRONICS',
      'pipe.electronics.i': 'LED & electronic integration',
      'pipe.light': 'LIGHT',
      'pipe.light.i': 'Flexible illuminated surfaces',

      'tech.overline': 'WHY TEXTILE LIGHTING?',
      'tech.title': 'LIGHT WHERE IT MATTERS',
      'card.flexible': 'FLEXIBLE',
      'card.flexible.p': 'Lighting can be integrated into flexible textile structures rather than relying solely on rigid components.',
      'card.integrated': 'INTEGRATED',
      'card.integrated.p': 'Lighting becomes part of the vehicle interior rather than appearing as a separate component.',
      'card.functional': 'FUNCTIONAL',
      'card.functional.p': 'The technology can combine visual design with functional lighting applications.',
      'card.automotive': 'AUTOMOTIVE',
      'card.automotive.p': 'Designed for demanding automotive environments and premium vehicle interiors.',

      'auto.overline': 'AUTOMOTIVE APPLICATION',
      'auto.title': 'LIGHT WHERE TRADITIONAL TECHNOLOGY CANNOT GO.',
      'auto.p': 'MUNDA\u2019s flexible textile lighting technology can be integrated into areas of vehicle interiors where rigid conventional lighting solutions can present physical and design limitations.',
      'auto.li1': 'Crash-sensitive interior zones',
      'auto.li2': 'Premium automotive interiors',
      'auto.li3': 'Door panels & interior trim',
      'auto.li4': 'Seats & ambient lighting surfaces',

      'kosova.overline': 'MUNDA KOSOVA',
      'kosova.title': 'PRECISION MANUFACTURING IN KOSOVO.',
      'kosova.sub': 'Established in early 2023, MUNDA Kosova expanded rapidly around its state-of-the-art production facility near Pristina.',
      'stat.investment': 'Approximate investment',
      'stat.established': 'MUNDA Kosova established',
      'stat.employees': 'Employees',
      'stat.inaugurated': 'Facility officially inaugurated',

      'mfg.overline': 'PRECISION MANUFACTURING',
      'mfg.title': 'FROM MATERIAL TO LIGHT',
      'mfg.s1': 'PLANNING',
      'mfg.s1.p': 'Production planning, master data, technical drawings, inventory information, and manufacturing documentation.',
      'mfg.s2': 'CUTTING',
      'mfg.s2.p': 'Technical textiles are precisely cut using advanced cutting technology.',
      'mfg.s3': 'ELECTRONIC INTEGRATION',
      'mfg.s3.p': 'LED and electronic components are integrated into the textile structure.',
      'mfg.s4': 'QUALITY CONTROL',
      'mfg.s4.p': 'Finished components undergo rigorous quality verification.',
      'mfg.s5': 'AUTOMOTIVE APPLICATION',
      'mfg.s5.p': 'The completed textile lighting systems become part of advanced vehicle interiors.',

      'lectra.overline': 'LECTRA CUTTING TECHNOLOGY',
      'lectra.title': 'PRECISION AT SCALE',
      'lectra.p': 'MUNDA\u2019s Kosovo facility uses the <b>Lectra Vector iP</b> cutting solution for high-capacity technical textile cutting.',
      'lectra.li1': 'High precision',
      'lectra.li2': 'High production capacity',
      'lectra.li3': 'Reduced energy consumption',
      'lectra.li4': 'Industry 4.0 connectivity',
      'lectra.li5': 'Simplified operator interaction',
      'lectra.li6': 'Scheduled maintenance capabilities',
      'lectra.d.precision': 'PRECISION',
      'lectra.d.capacity': 'CAPACITY',
      'lectra.d.i40': 'INDUSTRY 4.0',

      'quality.overline': 'QUALITY & AUTOMOTIVE STANDARDS',
      'quality.title': 'QUALITY IS PART OF THE PRODUCT.',
      'quality.sub': 'MUNDA Kosova became the first automotive supplier in Kosovo to successfully complete the <b>Volkswagen Group</b> audit and approval process, demonstrating compliance with demanding automotive quality requirements.',
      'quality.name': 'VOLKSWAGEN GROUP',
      'quality.sub2': 'AUDIT & APPROVAL · FIRST IN KOSOVO',

      'i40.overline': 'INDUSTRY 4.0',
      'i40.title': 'CONNECTED MANUFACTURING',
      'i40.data': 'DATA',
      'i40.planning': 'PLANNING',
      'i40.production': 'PRODUCTION',
      'i40.quality': 'QUALITY',
      'i40.supply': 'GLOBAL SUPPLY CHAIN',
      'i40.caption': 'A fully connected digital manufacturing network — from data and planning through production and quality to the global automotive supply chain.',

      'explorer.overline': 'INTERACTIVE TECHNOLOGY EXPLORER',
      'explorer.title': 'HOW TEXTILE LIGHTING WORKS',
      'x.textile': 'TEXTILE',
      'x.led': 'LED',
      'x.flexible': 'FLEXIBLE STRUCTURE',
      'x.electronics': 'ELECTRONICS',
      'x.structure': 'STRUCTURE',
      'x.d.textile': '<b>TEXTILE</b> — Technical fabrics form the flexible substrate that carries light across the interior.',
      'x.d.led': '<b>LED</b> — Miniature LEDs are embedded directly into the textile structure to emit light.',
      'x.d.flexible': '<b>FLEXIBLE STRUCTURE</b> — Unlike conventional rigid lighting components, textile lighting can be integrated into flexible interior structures.',
      'x.d.electronics': '<b>ELECTRONICS</b> — Electronic integration connects power and control to the lighting elements.',

      'game.overline': 'INTERACTIVE GAME',
      'game.title': 'EXPERIENCE THE PROCESS',
      'game.sub': '<b>Can you make the connection?</b> Step into a simplified interactive representation of precision electrical assembly. Match the correct connections, complete the textile-lighting system, and see how accurately you can work.',
      'game.mode': 'PRODUCTION SHIFT',
      'game.level': 'LEVEL',
      'game.score': 'SCORE',
      'game.strip': 'INTEGRATION · LIVE',
      'game.hint': 'SELECT A TERMINAL',
      'game.endless': '∞ ENDLESS MODE',
      'game.launch': 'PLAY THE MUNDA GAME',
      'game.streak': '×3 STREAK',

      'cta.title': 'READY TO MAKE THE CONNECTION?',
      'cta.p': 'Explore the technology behind MUNDA — then test your own precision.',
      'cta.play': 'PLAY THE MUNDA GAME',
      'cta.explore': 'EXPLORE MUNDA TECHNOLOGY',

      'footer.links': 'Footer',
      'footer.copyright': '© MUNDA Textile Lichtsysteme GmbH',
      'footer.disclaimer': 'Fictional concept inspired by MUNDA textile lighting technology.',

      'overlay.precision': 'PRECISION ASSEMBLY',
      'overlay.return': 'RETURN TO MAIN',
      'fab.play': 'PLAY',

      'loom.title': 'PRIVATE AI GUIDE',
      'loom.welcome': 'Ask me a general question or explore MUNDA textile-lighting technology.',
      'loom.q1': 'What is textile lighting?',
      'loom.q2': 'How does MUNDA support automotive interiors?',
      'loom.q3': 'What makes flexible LED textiles useful?',
      'loom.q4': 'Explain LEDs in simple terms.',
      'loom.placeholder': 'Ask Loom',
      'loom.ask': 'ASK',
      'loom.you': 'YOU',
      'loom.thinking': 'Thinking',
      'loom.privacy': 'Your Groq credential remains on the private server and is never sent to the browser.',
      'loom.unavailable': 'Unable to reach Loom\u2019s private server. Run this site with `npm start` or deploy it to a serverless host.',
      'loom.temp': 'Loom is temporarily unavailable.'
    },

    de: {
      'nav.home': 'Startseite',
      'nav.technology': 'Technologie',
      'nav.manufacturing': 'Fertigung',
      'nav.kosova': 'MUNDA Kosova',
      'nav.innovation': 'Innovation',
      'nav.game': 'Interaktives Spiel',
      'nav.play': 'SPIEL STARTEN',
      'nav.askLoom': 'FRAG LOOM',
      'nav.menu': 'Menü',

      'hero.overline': 'TEXTIL · ELEKTRONIK · LICHT',
      'hero.title1': 'LICHT,',
      'hero.title2': 'NEU GEDACHT.',
      'hero.sub': 'Flexible Textil-Beleuchtungssysteme für die nächste Generation von Fahrzeuginnenräumen.',
      'hero.lead': 'MUNDA verbindet fortschrittliche Textiltechnik mit intelligenter LED-Technologie, um flexible, funktionale und ästhetisch integrierte Beleuchtungslösungen für moderne Fahrzeuge zu schaffen.',
      'hero.cta1': 'TECHNOLOGIE ENTDECKEN',
      'hero.cta2': 'INTERAKTIVES ERLEBNIS SPIELEN',

      'about.overline': 'WAS IST MUNDA?',
      'about.title': 'LICHT IN TEXTILIEN TECHNISCH UMSETZEN',
      'about.p1': 'MUNDA Textile Lichtsysteme GmbH entwickelt innovative textile Beleuchtungssysteme durch die Kombination fortschrittlicher technischer Textilien mit LED-basierter Elektroniktechnologie.',
      'about.p2': 'Das Ergebnis ist eine neue Generation von Beleuchtungselementen, die flexibel, visuell integriert und für moderne Fahrzeuginnenräume konzipiert sind.',
      'pipe.textile': 'TEXTIL',
      'pipe.textile.i': 'Technisches Gewebe als Substrat',
      'pipe.electronics': 'ELEKTRONIK',
      'pipe.electronics.i': 'LED- & Elektronikintegration',
      'pipe.light': 'LICHT',
      'pipe.light.i': 'Flexible beleuchtete Flächen',

      'tech.overline': 'WARUM TEXTIL-BELEUCHTUNG?',
      'tech.title': 'LICHT DORT, WO ES ZÄHLT',
      'card.flexible': 'FLEXIBEL',
      'card.flexible.p': 'Beleuchtung kann in flexible Textilstrukturen integriert werden, statt nur auf starre Bauteile zu setzen.',
      'card.integrated': 'INTEGRIERT',
      'card.integrated.p': 'Beleuchtung wird Teil des Fahrzeuginnenraums statt eines separaten Bauteils.',
      'card.functional': 'FUNKTIONAL',
      'card.functional.p': 'Die Technologie verbindet visuelles Design mit funktionalen Beleuchtungsanwendungen.',
      'card.automotive': 'AUTOMOBIL',
      'card.automotive.p': 'Entwickelt für anspruchsvolle Automobilumgebungen und Premium-Innenräume.',

      'auto.overline': 'AUTOMOBILANWENDUNG',
      'auto.title': 'LICHT DORT, WO TRADITIONELLE TECHNIK NICHT HINKOMMT.',
      'auto.p': 'MUNDAs flexible Textil-Beleuchtungstechnologie kann in Bereiche der Fahrzeuginnenräume integriert werden, in denen starre konventionelle Lösungen an physikalische und gestalterische Grenzen stoßen.',
      'auto.li1': 'Crashempfindliche Innenzonen',
      'auto.li2': 'Premium-Fahrzeuginnenräume',
      'auto.li3': 'Türverkleidungen & Innenausstattung',
      'auto.li4': 'Sitze & Umgebungslichtflächen',

      'kosova.overline': 'MUNDA KOSOVA',
      'kosova.title': 'PRÄZISIONSFERTIGUNG IM KOSOVO.',
      'kosova.sub': 'Anfang 2023 gegründet, expandierte MUNDA Kosova schnell rund um sein modernstes Produktionswerk nahe Pristina.',
      'stat.investment': 'Ungefähre Investition',
      'stat.established': 'MUNDA Kosova gegründet',
      'stat.employees': 'Mitarbeiter',
      'stat.inaugurated': 'Werk offiziell eröffnet',

      'mfg.overline': 'PRÄZISIONSFERTIGUNG',
      'mfg.title': 'VOM MATERIAL ZUM LICHT',
      'mfg.s1': 'PLANUNG',
      'mfg.s1.p': 'Produktionsplanung, Stammdaten, technische Zeichnungen, Lagerinformationen und Fertigungsdokumentation.',
      'mfg.s2': 'SCHNEIDEN',
      'mfg.s2.p': 'Technische Textilien werden mit moderner Schneidetechnik präzise geschnitten.',
      'mfg.s3': 'ELEKTRONIKINTEGRATION',
      'mfg.s3.p': 'LED- und Elektronikkomponenten werden in die Textilstruktur integriert.',
      'mfg.s4': 'QUALITÄTSKONTROLLE',
      'mfg.s4.p': 'Fertige Komponenten durchlaufen eine strenge Qualitätsprüfung.',
      'mfg.s5': 'AUTOMOBILANWENDUNG',
      'mfg.s5.p': 'Die fertigen Textil-Beleuchtungssysteme werden Teil moderner Fahrzeuginnenräume.',

      'lectra.overline': 'LECTRA SCHNEIDTECHNOLOGIE',
      'lectra.title': 'PRÄZISION IM GROSSFORMAT',
      'lectra.p': 'MUNDAs Werk im Kosovo nutzt die <b>Lectra Vector iP</b> Schneidlösung für die hochkapazitive Verarbeitung technischer Textilien.',
      'lectra.li1': 'Hohe Präzision',
      'lectra.li2': 'Hohe Produktionskapazität',
      'lectra.li3': 'Reduzierter Energieverbrauch',
      'lectra.li4': 'Industrie-4.0-Konnektivität',
      'lectra.li5': 'Vereinfachte Bedienung',
      'lectra.li6': 'Geplante Wartungsfunktionen',
      'lectra.d.precision': 'PRÄZISION',
      'lectra.d.capacity': 'KAPAZITÄT',
      'lectra.d.i40': 'INDUSTRIE 4.0',

      'quality.overline': 'QUALITÄT & AUTOMOBILSTANDARDS',
      'quality.title': 'QUALITÄT IST TEIL DES PRODUKTS.',
      'quality.sub': 'MUNDA Kosova war der erste Automobilzulieferer im Kosovo, der den <b>Volkswagen-Konzern</b>-Audit und -Freigabeprozess erfolgreich abgeschlossen hat.',
      'quality.name': 'VOLKSWAGEN-KONZERN',
      'quality.sub2': 'AUDIT & FREIGABE · ERSTE IM KOSOVO',

      'i40.overline': 'INDUSTRIE 4.0',
      'i40.title': 'VERNETZTE FERTIGUNG',
      'i40.data': 'DATEN',
      'i40.planning': 'PLANUNG',
      'i40.production': 'PRODUKTION',
      'i40.quality': 'QUALITÄT',
      'i40.supply': 'GLOBALE LIEFERKETTE',
      'i40.caption': 'Ein vollständig vernetztes digitales Fertigungsnetzwerk — von Daten und Planung über Produktion und Qualität bis zur globalen Automobillieferkette.',

      'explorer.overline': 'INTERAKTIVER TECHNOLOGIE-EXPLORER',
      'explorer.title': 'SO FUNKTIONIERT TEXTIL-BELEUCHTUNG',
      'x.textile': 'TEXTIL',
      'x.led': 'LED',
      'x.flexible': 'FLEXIBLE STRUKTUR',
      'x.electronics': 'ELEKTRONIK',
      'x.structure': 'STRUKTUR',
      'x.d.textile': '<b>TEXTIL</b> — Technische Gewebe bilden das flexible Substrat, das Licht im Innenraum trägt.',
      'x.d.led': '<b>LED</b> — Mikro-LEDs werden direkt in die Textilstruktur eingebettet, um Licht zu erzeugen.',
      'x.d.flexible': '<b>FLEXIBLE STRUKTUR</b> — Anders als starre Bauteile lässt sich Textil-Beleuchtung in flexible Innenstrukturen integrieren.',
      'x.d.electronics': '<b>ELEKTRONIK</b> — Die elektronische Integration verbindet Stromversorgung und Steuerung mit den Beleuchtungselementen.',

      'game.overline': 'INTERAKTIVES SPIEL',
      'game.title': 'DEN PROZESS ERLEBEN',
      'game.sub': '<b>Schaffst du die Verbindung?</b> Tauche ein in eine vereinfachte interaktive Darstellung der präzisen Elektromontage. Verbinde die richtigen Anschlüsse, vervollständige das Textil-Beleuchtungssystem und finde heraus, wie präzise du arbeiten kannst.',
      'game.mode': 'PRODUKTIONSSCHICHT',
      'game.level': 'LEVEL',
      'game.score': 'PUNKTE',
      'game.strip': 'INTEGRATION · LIVE',
      'game.hint': 'WÄHLE EINEN ANSCHLUSS',
      'game.endless': '∞ ENDLOSMODUS',
      'game.launch': 'MUNDA-SPIEL SPIELEN',
      'game.streak': '×3 SERIE',

      'cta.title': 'BEREIT, DIE VERBINDUNG HERZUSTELLEN?',
      'cta.p': 'Entdecke die Technologie hinter MUNDA — und teste dann deine eigene Präzision.',
      'cta.play': 'MUNDA-SPIEL SPIELEN',
      'cta.explore': 'MUNDA-TECHNOLOGIE ENTDECKEN',

      'footer.copyright': '© MUNDA Textile Lichtsysteme GmbH',
      'footer.disclaimer': 'Fiktives Konzept, inspiriert von MUNDA-Textil-Beleuchtungstechnologie.',

      'overlay.precision': 'PRÄZISIONSMONTAGE',
      'overlay.return': 'ZURÜCK ZUM HAUPTBEREICH',
      'fab.play': 'SPIELEN',

      'loom.title': 'PRIVATER KI-GUIDE',
      'loom.welcome': 'Stelle eine allgemeine Frage oder erkunde MUNDA-Textil-Beleuchtungstechnologie.',
      'loom.q1': 'Was ist Textil-Beleuchtung?',
      'loom.q2': 'Wie unterstützt MUNDA Fahrzeuginnenräume?',
      'loom.q3': 'Was macht flexible LED-Textilien nützlich?',
      'loom.q4': 'Erkläre LEDs einfach.',
      'loom.placeholder': 'Frag Loom',
      'loom.ask': 'FRAGEN',
      'loom.you': 'DU',
      'loom.thinking': 'Denkt nach',
      'loom.privacy': 'Dein Groq-Zugangsdaten bleiben auf dem privaten Server und werden nie an den Browser gesendet.',
      'loom.unavailable': 'Loom\u2019s privater Server ist nicht erreichbar. Starte diese Seite mit `npm start` oder stelle sie auf einem Serverless-Host bereit.',
      'loom.temp': 'Loom ist vorübergehend nicht verfügbar.'
    },

    sq: {
      'nav.home': 'Faqja kryesore',
      'nav.technology': 'Teknologjia',
      'nav.manufacturing': 'Prodhimi',
      'nav.kosova': 'MUNDA Kosova',
      'nav.innovation': 'Inovacioni',
      'nav.game': 'Lojë interaktive',
      'nav.play': 'LUAJ LOJËN',
      'nav.askLoom': 'PYET LOOM',
      'nav.menu': 'Menuja',

      'hero.overline': 'TEKSTIL · ELEKTRONIKË · DRITË',
      'hero.title1': 'NDRIÇIM,',
      'hero.title2': 'I RIMENDUAR.',
      'hero.sub': 'Sisteme fleksibël ndriçimi tekstil për brezin e ri të brendësive të automjeteve.',
      'hero.lead': 'MUNDA kombinon inxhinierinë e avancuar tekstile me teknologjinë inteligjente LED për të krijuar zgjidhje ndriçimi fleksibël, funksionale dhe të integruara estetikisht për automjetet moderne.',
      'hero.cta1': 'ZBULO TEKNOLOGJINË TONË',
      'hero.cta2': 'LUAJ PËRVOJËN INTERAKTIVE',

      'about.overline': 'ÇFARË ËSHTË MUNDA?',
      'about.title': 'INXHINIERIA E DRITËS NË TEKSTILE',
      'about.p1': 'MUNDA Textile Lichtsysteme GmbH zhvillon sisteme inovative ndriçimi tekstil duke kombinuar tekstile teknike të avancuara me teknologjinë elektronike të bazuar në LED.',
      'about.p2': 'Rezultati është një brez i ri elementesh ndriçimi që janë fleksibël, të integruar vizualisht dhe të dizajnuar për brendësi moderne automjetesh.',
      'pipe.textile': 'TEKSTIL',
      'pipe.textile.i': 'Substrat i pëlhurës teknike',
      'pipe.electronics': 'ELEKTRONIKË',
      'pipe.electronics.i': 'Integrimi LED & elektronik',
      'pipe.light': 'DRITË',
      'pipe.light.i': 'Sipërfaqe fleksibël të ndriçuara',

      'tech.overline': 'PSE NDRIÇIM TEKSTIL?',
      'tech.title': 'DRITË ATY KU KA RËNDËSI',
      'card.flexible': 'FLEKSIBËL',
      'card.flexible.p': 'Ndriçimi mund të integrohet në struktura tekstile fleksibël në vend që të mbështetet vetëm në komponentë të ngurtë.',
      'card.integrated': 'I INTEGRUAR',
      'card.integrated.p': 'Ndriçimi bëhet pjesë e brendësisë së automjetit në vend që të shfaqet si komponent i veçantë.',
      'card.functional': 'FUNKSIONAL',
      'card.functional.p': 'Teknologjia mund të kombinojë dizajnin vizual me aplikime funksionale ndriçimi.',
      'card.automotive': 'AUTOMOTIVE',
      'card.automotive.p': 'Dizajnuar për mjedise kërkuese automjetesh dhe brendësi premium.',

      'auto.overline': 'APLIKIMI NË AUTOMJETE',
      'auto.title': 'DRITË ATY KU TEKNOLOGJIA TRADICIONALE NUK SHKON.',
      'auto.p': 'Teknologjia fleksibël e ndriçimit tekstil e MUNDA-s mund të integrohet në zona të brendësisë së automjetit ku zgjidhjet konvencionale të ngurta paraqesin kufizime fizike dhe dizajni.',
      'auto.li1': 'Zona të brendshme të ndjeshme ndaj goditjeve',
      'auto.li2': 'Brendësi premium automjetesh',
      'auto.li3': 'Panele dyert & dekor të brendshëm',
      'auto.li4': 'Vende & sipërfaqe ndriçimi ambienti',

      'kosova.overline': 'MUNDA KOSOVA',
      'kosova.title': 'PRODHIM PRECIZ NË KOSOVË.',
      'kosova.sub': 'E themeluar në fillim të 2023-s, MUNDA Kosova u zgjerua shpejt rreth objektit të saj të avancuar të prodhimit pranë Prishtinës.',
      'stat.investment': 'Investim i përafërt',
      'stat.established': 'MUNDA Kosova u themelua',
      'stat.employees': 'Punonjës',
      'stat.inaugurated': 'Objekti u inaugurua zyrtarisht',

      'mfg.overline': 'PRODHIM PRECIZ',
      'mfg.title': 'NGA MATERIALI NË DRITË',
      'mfg.s1': 'PLANIFIKIMI',
      'mfg.s1.p': 'Planifikimi i prodhimit, të dhënat master, vizatimet teknike, informacioni i inventarit dhe dokumentacioni i prodhimit.',
      'mfg.s2': 'PRERJA',
      'mfg.s2.p': 'Tekstilet teknike priten me saktësi duke përdorur teknologji të avancuar prerjeje.',
      'mfg.s3': 'INTEGRIMI ELEKTRONIK',
      'mfg.s3.p': 'Komponentët LED dhe elektronikë integrohen në strukturën tekstile.',
      'mfg.s4': 'KONTROLLI I CILËSISË',
      'mfg.s4.p': 'Komponentët e përfunduar i nënshtrohen verifikimit rigoroz të cilësisë.',
      'mfg.s5': 'APLIKIMI NË AUTOMJETE',
      'mfg.s5.p': 'Sistemet e përfunduara të ndriçimit tekstil bëhen pjesë e brendësive të avancuara të automjeteve.',

      'lectra.overline': 'TEKNOLOGJIA E PRERJES LECTRA',
      'lectra.title': 'SAKTËSI NË SHKALLË TË GJERË',
      'lectra.p': 'Objekti i MUNDA-s në Kosovë përdor zgjidhjen e prerjes <b>Lectra Vector iP</b> për prerje tekstili teknik me kapacitet të lartë.',
      'lectra.li1': 'Saktësi e lartë',
      'lectra.li2': 'Kapacitet i lartë prodhimi',
      'lectra.li3': 'Konsum i reduktuar energjie',
      'lectra.li4': 'Lidhje Industria 4.0',
      'lectra.li5': 'Ndërveprim i thjeshtuar i operatorit',
      'lectra.li6': 'Aftësi mirëmbajtjeje të planifikuar',
      'lectra.d.precision': 'SAKTËSIA',
      'lectra.d.capacity': 'KAPACITETI',
      'lectra.d.i40': 'INDUSTRIA 4.0',

      'quality.overline': 'CILËSIA & STANDARDET AUTOMOTIVE',
      'quality.title': 'CILËSIA ËSHTË PJESË E PRODUKTIT.',
      'quality.sub': 'MUNDA Kosova u bë furnizuesi i parë automotiv në Kosovë që përfundoi me sukses procesin e auditimit dhe miratimit të <b>Grupit Volkswagen</b>.',
      'quality.name': 'GRUPI VOLKSWAGEN',
      'quality.sub2': 'AUDITIM & MIRATIM · I PARI NË KOSOVË',

      'i40.overline': 'INDUSTRIA 4.0',
      'i40.title': 'PRODHIM I LIDHUR',
      'i40.data': 'TË DHËNA',
      'i40.planning': 'PLANIFIKIMI',
      'i40.production': 'PRODHIMI',
      'i40.quality': 'CILËSIA',
      'i40.supply': 'ZINXHIRI GLOBAL I FURNIZIMIT',
      'i40.caption': 'Një rrjet prodhimi dixhital plotësisht i lidhur — nga të dhënat dhe planifikimi përmes prodhimit dhe cilësisë deri te zinxhiri global i furnizimit automotiv.',

      'explorer.overline': 'Eksploruesi interaktiv i teknologjisë',
      'explorer.title': 'SI FUNKSIONON NDRIÇIMI TEKSTIL',
      'x.textile': 'TEKSTIL',
      'x.led': 'LED',
      'x.flexible': 'STRUKTURË FLEKSIBËL',
      'x.electronics': 'ELEKTRONIKË',
      'x.structure': 'STRUKTURË',
      'x.d.textile': '<b>TEKSTIL</b> — Pëlhurat teknike formojnë substratin fleksibël që mbart dritën në brendësi.',
      'x.d.led': '<b>LED</b> — LED-të miniaturë futen drejtpërdrejt në strukturën tekstile për të emetuar dritë.',
      'x.d.flexible': '<b>STRUKTURË FLEKSIBËL</b> — Ndryshe nga komponentët e ngurtë konvencionalë, ndriçimi tekstil mund të integrohet në struktura të brendshme fleksibël.',
      'x.d.electronics': '<b>ELEKTRONIKË</b> — Integrimi elektronik lidh fuqinë dhe kontrollin me elementet e ndriçimit.',

      'game.overline': 'LOJA INTERAKTIVE',
      'game.title': 'PËRJETO PROCESIN',
      'game.sub': '<b>A e bën dot lidhjen?</b> Hyr në një paraqitje interaktive të thjeshtuar të montimit elektrik preciz. Përputh lidhjet e sakta, plotëso sistemin e ndriçimit tekstil dhe shiko sa saktë mund të punosh.',
      'game.mode': 'NDËRRIMI I PRODHIMIT',
      'game.level': 'NIVELI',
      'game.score': 'PIKËT',
      'game.strip': 'INTEGRIMI · LIVE',
      'game.hint': 'ZGJIDH NJË TERMINAL',
      'game.endless': '∞ MODI PA FUND',
      'game.launch': 'LUAJ LOJËN MUNDA',
      'game.streak': '×3 SERI',

      'cta.title': 'GATI PËR TË BËRË LIDHJEN?',
      'cta.p': 'Zbulo teknologjinë pas MUNDA-s — pastaj testo saktësinë tënde.',
      'cta.play': 'LUAJ LOJËN MUNDA',
      'cta.explore': 'ZBULO TEKNOLOGJINË MUNDA',

      'footer.copyright': '© MUNDA Textile Lichtsysteme GmbH',
      'footer.disclaimer': 'Koncept fiktiv i frymëzuar nga teknologjia e ndriçimit tekstil MUNDA.',

      'overlay.precision': 'MONTIM PRECIZ',
      'overlay.return': 'KTHEHU TE FAQJA KRYESORE',
      'fab.play': 'LUAJ',

      'loom.title': 'UDHËZUES PRIVAT AI',
      'loom.welcome': 'Bëj një pyetje të përgjithshme ose eksploro teknologjinë e ndriçimit tekstil MUNDA.',
      'loom.q1': 'Çfarë është ndriçimi tekstil?',
      'loom.q2': 'Si e mbështet MUNDA brendësinë e automjeteve?',
      'loom.q3': 'Çfarë i bën tekstilet LED fleksibël të dobishme?',
      'loom.q4': 'Shpjego LED-të me fjalë të thjeshta.',
      'loom.placeholder': 'Pyet Loom',
      'loom.ask': 'PYET',
      'loom.you': 'TI',
      'loom.thinking': 'Duke menduar',
      'loom.privacy': 'Kredenciali yt Groq mbetet në serverin privat dhe nuk dërgohet kurrë në shfletues.',
      'loom.unavailable': 'Serveri privat i Loom nuk është i arritshëm. Ekzekuto këtë faqe me `npm start` ose vendose në një host serverless.',
      'loom.temp': 'Loom është përkohësisht i padisponueshëm.'
    },

    fr: {
      'nav.home': 'Accueil',
      'nav.technology': 'Technologie',
      'nav.manufacturing': 'Fabrication',
      'nav.kosova': 'MUNDA Kosova',
      'nav.innovation': 'Innovation',
      'nav.game': 'Jeu interactif',
      'nav.play': 'JOUER AU JEU',
      'nav.askLoom': 'DEMANDER À LOOM',
      'nav.menu': 'Menu',

      'hero.overline': 'TEXTILE · ÉLECTRONIQUE · LUMIÈRE',
      'hero.title1': 'LUMIÈRE,',
      'hero.title2': 'RÉINVENTÉE.',
      'hero.sub': 'Des systèmes d\u2019éclairage textile flexibles pour la prochaine génération d\u2019intérieurs automobiles.',
      'hero.lead': 'MUNDA associe une ingénierie textile avancée à une technologie LED intelligente pour créer des solutions d\u2019éclairage flexibles, fonctionnelles et esthétiquement intégrées pour les véhicules modernes.',
      'hero.cta1': 'DÉCOUVRIR NOTRE TECHNOLOGIE',
      'hero.cta2': 'JOUER L\u2019EXPÉRIENCE INTERACTIVE',

      'about.overline': 'QU\u2019EST-CE QUE MUNDA ?',
      'about.title': 'INGÉNIERIE DE LA LUMIÈRE DANS LES TEXTILES',
      'about.p1': 'MUNDA Textile Lichtsysteme GmbH développe des systèmes d\u2019éclairage textile innovants en combinant des textiles techniques avancés avec la technologie électronique à base de LED.',
      'about.p2': 'Le résultat est une nouvelle génération d\u2019éléments d\u2019éclairage flexibles, visuellement intégrés et conçus pour les intérieurs automobiles modernes.',
      'pipe.textile': 'TEXTILE',
      'pipe.textile.i': 'Substrat en tissu technique',
      'pipe.electronics': 'ÉLECTRONIQUE',
      'pipe.electronics.i': 'Intégration LED & électronique',
      'pipe.light': 'LUMIÈRE',
      'pipe.light.i': 'Surfaces lumineuses flexibles',

      'tech.overline': 'POURQUOI L\u2019ÉCLAIRAGE TEXTILE ?',
      'tech.title': 'LA LUMIÈRE LÀ OÙ ELLE COMPTE',
      'card.flexible': 'FLEXIBLE',
      'card.flexible.p': 'L\u2019éclairage peut être intégré dans des structures textiles flexibles plutôt que de reposer uniquement sur des composants rigides.',
      'card.integrated': 'INTÉGRÉ',
      'card.integrated.p': 'L\u2019éclairage fait partie de l\u2019habitacle plutôt que d\u2019apparaître comme un composant séparé.',
      'card.functional': 'FONCTIONNEL',
      'card.functional.p': 'La technologie peut combiner le design visuel avec des applications d\u2019éclairage fonctionnelles.',
      'card.automotive': 'AUTOMOBILE',
      'card.automotive.p': 'Conçu pour les environnements automobiles exigeants et les intérieurs de véhicules premium.',

      'auto.overline': 'APPLICATION AUTOMOBILE',
      'auto.title': 'LA LUMIÈRE LÀ OÙ LA TECHNOLOGIE TRADITIONNELLE NE VA PAS.',
      'auto.p': 'La technologie d\u2019éclairage textile flexible de MUNDA peut être intégrée dans des zones de l\u2019habitacle où les solutions rigides conventionnelles présentent des limites physiques et de conception.',
      'auto.li1': 'Zones intérieures sensibles aux chocs',
      'auto.li2': 'Intérieurs automobiles premium',
      'auto.li3': 'Panneaux de porte & garnitures intérieures',
      'auto.li4': 'Sièges & surfaces d\u2019éclairage d\u2019ambiance',

      'kosova.overline': 'MUNDA KOSOVA',
      'kosova.title': 'FABRICATION DE PRÉCISION AU KOSOVO.',
      'kosova.sub': 'Créée début 2023, MUNDA Kosova s\u2019est développée rapidement autour de son installation de production de pointe près de Pristina.',
      'stat.investment': 'Investissement approximatif',
      'stat.established': 'MUNDA Kosova créée',
      'stat.employees': 'Employés',
      'stat.inaugurated': 'Installation inaugurée officiellement',

      'mfg.overline': 'FABRICATION DE PRÉCISION',
      'mfg.title': 'DU MATÉRIAU À LA LUMIÈRE',
      'mfg.s1': 'PLANIFICATION',
      'mfg.s1.p': 'Planification de production, données maîtres, dessins techniques, informations d\u2019inventaire et documentation de fabrication.',
      'mfg.s2': 'DÉCOUPE',
      'mfg.s2.p': 'Les textiles techniques sont découpés avec précision grâce à une technologie de découpe avancée.',
      'mfg.s3': 'INTÉGRATION ÉLECTRONIQUE',
      'mfg.s3.p': 'Les composants LED et électroniques sont intégrés dans la structure textile.',
      'mfg.s4': 'CONTRÔLE QUALITÉ',
      'mfg.s4.p': 'Les composants finis subissent une vérification qualité rigoureuse.',
      'mfg.s5': 'APPLICATION AUTOMOBILE',
      'mfg.s5.p': 'Les systèmes d\u2019éclairage textile terminés font partie des intérieurs de véhicules avancés.',

      'lectra.overline': 'TECHNOLOGIE DE DÉCOUPE LECTRA',
      'lectra.title': 'PRÉCISION À GRANDE ÉCHELLE',
      'lectra.p': 'L\u2019installation de MUNDA au Kosovo utilise la solution de découpe <b>Lectra Vector iP</b> pour la découpe de textiles techniques à grande capacité.',
      'lectra.li1': 'Haute précision',
      'lectra.li2': 'Grande capacité de production',
      'lectra.li3': 'Consommation d\u2019énergie réduite',
      'lectra.li4': 'Connectivité Industrie 4.0',
      'lectra.li5': 'Interaction simplifiée pour l\u2019opérateur',
      'lectra.li6': 'Capacités de maintenance planifiée',
      'lectra.d.precision': 'PRÉCISION',
      'lectra.d.capacity': 'CAPACITÉ',
      'lectra.d.i40': 'INDUSTRIE 4.0',

      'quality.overline': 'QUALITÉ & NORMES AUTOMOBILES',
      'quality.title': 'LA QUALITÉ FAIT PARTIE DU PRODUIT.',
      'quality.sub': 'MUNDA Kosova est devenue le premier fournisseur automobile du Kosovo à réussir le processus d\u2019audit et d\u2019approbation du <b>Groupe Volkswagen</b>.',
      'quality.name': 'GROUPE VOLKSWAGEN',
      'quality.sub2': 'AUDIT & APPROBATION · PREMIER AU KOSOVO',

      'i40.overline': 'INDUSTRIE 4.0',
      'i40.title': 'FABRICATION CONNECTÉE',
      'i40.data': 'DONNÉES',
      'i40.planning': 'PLANIFICATION',
      'i40.production': 'PRODUCTION',
      'i40.quality': 'QUALITÉ',
      'i40.supply': 'CHAÎNE D\u2019APPROVISIONNEMENT MONDIALE',
      'i40.caption': 'Un réseau de fabrication numérique entièrement connecté — des données et de la planification, à travers la production et la qualité, jusqu\u2019à la chaîne d\u2019approvisionnement automobile mondiale.',

      'explorer.overline': 'EXPLORATEUR INTERACTIF DE TECHNOLOGIE',
      'explorer.title': 'COMMENT FONCTIONNE L\u2019ÉCLAIRAGE TEXTILE',
      'x.textile': 'TEXTILE',
      'x.led': 'LED',
      'x.flexible': 'STRUCTURE FLEXIBLE',
      'x.electronics': 'ÉLECTRONIQUE',
      'x.structure': 'STRUCTURE',
      'x.d.textile': '<b>TEXTILE</b> — Les tissus techniques forment le substrat flexible qui porte la lumière à travers l\u2019intérieur.',
      'x.d.led': '<b>LED</b> — Des LED miniatures sont intégrées directement dans la structure textile pour émettre de la lumière.',
      'x.d.flexible': '<b>STRUCTURE FLEXIBLE</b> — Contrairement aux composants rigides conventionnels, l\u2019éclairage textile s\u2019intègre dans des structures intérieures flexibles.',
      'x.d.electronics': '<b>ÉLECTRONIQUE</b> — L\u2019intégration électronique relie l\u2019alimentation et le contrôle aux éléments d\u2019éclairage.',

      'game.overline': 'JEU INTERACTIF',
      'game.title': 'VIVEZ LE PROCESSUS',
      'game.sub': '<b>Pouvez-vous faire la connexion ?</b> Entrez dans une représentation interactive simplifiée de l\u2019assemblage électrique de précision. Associez les bonnes connexions, complétez le système d\u2019éclairage textile et voyez avec quelle précision vous pouvez travailler.',
      'game.mode': 'QUART DE PRODUCTION',
      'game.level': 'NIVEAU',
      'game.score': 'SCORE',
      'game.strip': 'INTÉGRATION · LIVE',
      'game.hint': 'SÉLECTIONNEZ UNE BORNE',
      'game.endless': '∞ MODE SANS FIN',
      'game.launch': 'JOUER AU JEU MUNDA',
      'game.streak': '×3 SÉRIE',

      'cta.title': 'PRÊT À FAIRE LA CONNEXION ?',
      'cta.p': 'Découvrez la technologie derrière MUNDA — puis testez votre propre précision.',
      'cta.play': 'JOUER AU JEU MUNDA',
      'cta.explore': 'DÉCOUVRIR LA TECHNOLOGIE MUNDA',

      'footer.copyright': '© MUNDA Textile Lichtsysteme GmbH',
      'footer.disclaimer': 'Concept fictif inspiré de la technologie d\u2019éclairage textile MUNDA.',

      'overlay.precision': 'ASSEMBLAGE DE PRÉCISION',
      'overlay.return': 'RETOUR À L\u2019ACCUEIL',
      'fab.play': 'JOUER',

      'loom.title': 'GUIDE IA PRIVÉ',
      'loom.welcome': 'Posez-moi une question générale ou explorez la technologie d\u2019éclairage textile MUNDA.',
      'loom.q1': 'Qu\u2019est-ce que l\u2019éclairage textile ?',
      'loom.q2': 'Comment MUNDA soutient-elle les intérieurs automobiles ?',
      'loom.q3': 'Qu\u2019est-ce qui rend les textiles LED flexibles utiles ?',
      'loom.q4': 'Expliquez les LED en termes simples.',
      'loom.placeholder': 'Demander à Loom',
      'loom.ask': 'DEMANDER',
      'loom.you': 'VOUS',
      'loom.thinking': 'Réflexion',
      'loom.privacy': 'Votre identifiant Groq reste sur le serveur privé et n\u2019est jamais envoyé au navigateur.',
      'loom.unavailable': 'Le serveur privé de Loom est injoignable. Exécutez ce site avec `npm start` ou déployez-le sur un hébergement sans serveur.',
      'loom.temp': 'Loom est temporairement indisponible.'
    }
  };

  // Additional national languages (Other group) — minimal overrides,
  // everything else falls back to English.
  var OTHER_DICT = {
    es: { 'nav.play': 'JUGAR AL JUEGO', 'nav.askLoom': 'PREGUNTAR A LOOM', 'hero.title2': 'REINVENTADA.', 'cta.play': 'JUGAR AL JUEGO MUNDA', 'overlay.return': 'VOLVER AL INICIO', 'fab.play': 'JUGAR' },
    it: { 'nav.play': 'GIOCA AL GIOCO', 'nav.askLoom': 'CHIEDI A LOOM', 'hero.title2': 'REINVENTATA.', 'cta.play': 'GIOCA AL GIOCO MUNDA', 'overlay.return': 'TORNA ALL\'INIZIO', 'fab.play': 'GIOCA' },
    pt: { 'nav.play': 'JOGAR O JOGO', 'nav.askLoom': 'PERGUNTAR AO LOOM', 'hero.title2': 'REINVENTADA.', 'cta.play': 'JOGAR O JOGO MUNDA', 'overlay.return': 'VOLTAR AO INÍCIO', 'fab.play': 'JOGAR' },
    tr: { 'nav.play': 'OYUNU OYNA', 'nav.askLoom': 'LOOM\'A SOR', 'hero.title2': 'YENİDEN TASARLANDI.', 'cta.play': 'MUNDA OYUNUNU OYNA', 'overlay.return': 'ANA SAYFAYA DÖN', 'fab.play': 'OYNA' },
    pl: { 'nav.play': 'ZAGRAJ W GRĘ', 'nav.askLoom': 'ZAPYTAJ LOOM', 'hero.title2': 'NA NOWO.', 'cta.play': 'ZAGRAJ W GRĘ MUNDA', 'overlay.return': 'WRÓĆ DO GŁÓWNEJ', 'fab.play': 'GRAJ' },
    nl: { 'nav.play': 'SPEEL HET SPEL', 'nav.askLoom': 'VRAAG LOOM', 'hero.title2': 'OPNIEUW BEDACHT.', 'cta.play': 'SPEEL HET MUNDA-SPEL', 'overlay.return': 'TERUG NAAR START', 'fab.play': 'SPEEL' }
  };

  function registry() {
    var map = {};
    LOCALES.forEach(function (l) { map[l.code] = l; });
    OTHER_LOCALES.forEach(function (l) { map[l.code] = l; });
    return map;
  }
  function isOther(code) {
    return OTHER_LOCALES.some(function (l) { return l.code === code; });
  }
  function current() {
    var v = 'en';
    try { v = localStorage.getItem(KEY) || 'en'; } catch (e) { /* ignore */ }
    return registry()[v] ? v : 'en';
  }
  function t(key, vars) {
    var code = current();
    var val = DICT[code] && DICT[code][key];
    if (val === undefined && OTHER_DICT[code]) val = OTHER_DICT[code][key];
    if (val === undefined) val = DICT.en[key];
    if (val === undefined) return key;
    if (vars) {
      return String(val).replace(/\{(\w+)\}/g, function (m, k) { return vars[k] !== undefined ? vars[k] : m; });
    }
    return val;
  }
  function applyToDOM() {
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var key = el.getAttribute('data-i18n');
      var attr = el.getAttribute('data-i18n-attr');
      if (attr) el.setAttribute(attr, t(key));
      else el.textContent = t(key);
    }
    // translate attr placeholders like title
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
    });
    // set html lang
    var html = document.documentElement;
    html.setAttribute('lang', current());
  }
  function setLanguage(code) {
    if (!registry()[code]) return false;
    try { localStorage.setItem(KEY, code); } catch (e) { /* ignore */ }
    applyToDOM();
    var ev = document.createEvent('Event'); ev.initEvent('languagechange', true, false);
    document.dispatchEvent(ev);
    return true;
  }

  window.MUNDA_SITE_I18N = {
    LOCALES: LOCALES, OTHER_LOCALES: OTHER_LOCALES,
    t: t, current: current, setLanguage: setLanguage, isOther: isOther,
    applyToDOM: applyToDOM, registry: registry
  };
})();
