# Stile del progetto

Questo documento descrive lo stile visivo effettivamente usato nel progetto, prendendo come riferimento principale il file `Gamified Stats Dashboard.tsx` e le variabili CSS presenti in `src/styles.css`.

Non include assunzioni su design system futuri, branding non definito o regole non visibili nel codice attuale.

## Identita visiva generale

Lo stile del progetto e quello di una dashboard personale "gamified" a tema dark, con un tono visivo:

- immersivo;
- compatto;
- leggermente RPG / productivity game;
- orientato a cards e pannelli;
- con enfasi su progressione, statistiche e stato personale.

L'interfaccia non e minimalista in senso neutro: usa ombre, trasparenze, overlay, gradienti, badge e icone per dare un feeling da "character dashboard".

## Tema base

Il tema di default e scuro.

Le variabili CSS principali in `src/styles.css` impostano:

- `--background`: sfondo molto scuro;
- `--foreground`: testo chiaro quasi bianco;
- `--card`: pannelli scuri;
- `--muted` e `--muted-foreground`: superfici e testi secondari attenuati;
- `--border`: bordi soft, non aggressivi;
- `--primary`: colore accent principale, modificabile dal selettore tema dentro la UI.

Questo significa che la base visiva del progetto e:

- sfondo quasi nero/blu notte;
- testo chiaro;
- superfici leggermente staccate dal fondo;
- accenti cromatici usati con parsimonia ma in punti strategici.

## Palette

### Colori strutturali

I colori strutturali servono a sfondo, testo, bordi, superfici e contenuti secondari.

Caratteristiche:

- sfondo principale molto scuro;
- card scure ma leggibili;
- bordi semi-soft;
- testo principale chiaro;
- testo secondario grigio-freddo.

### Colori di accento

Gli accenti sono gestiti dinamicamente tramite `colorThemes` nel file principale.

Temi disponibili:

- `white`
- `violet`
- `green`
- `orange`
- `rose`
- `blue`

Ogni tema modifica:

- `--primary`
- `--primary-foreground`

Uso visivo dell'accento:

- icone chiave;
- badge;
- barre di progresso;
- focus state;
- piccoli marker di selezione;
- elementi attivi o rilevanti.

### Colori chart

Per il radar chart vengono usate variabili dedicate:

- `--chart-1`
- `--chart-2`
- `--chart-3`
- `--chart-4`
- `--chart-5`
- `--chart-6`

Servono a distinguere le aree del personaggio e a mantenere il radar leggibile anche con piu statistiche.

## Layout

Il layout e una dashboard responsive a tre colonne.

Struttura visiva:

- colonna sinistra: identita, avatar, energia giornaliera, selezione tema, gestione stats;
- colonna centrale: vista principale di profilo e motivazione;
- colonna destra: esperienza, habit tracker, banner e tabella valori.

Il contenitore principale:

- e centrato;
- usa `max-w-6xl`;
- ha padding orizzontale e verticale contenuto;
- adatta le colonne con `flex-wrap`.

Il responsive non cambia il linguaggio visivo: ricompone solo i blocchi da layout multi-colonna a layout verticale.

## Forma dei componenti

Il progetto usa soprattutto card.

Caratteristiche ricorrenti:

- angoli arrotondati;
- bordi leggeri;
- sfondi `bg-card/90` o simili;
- ombre morbide;
- separazione interna tramite spacing regolare;
- layering con overlay e blur in alcuni punti.

In generale i componenti sono:

- densi ma ordinati;
- ricchi di micro-segnali visivi;
- non flat.

## Tipografia

Dal codice non emerge una font custom dedicata; la base attuale e sans-serif.

A livello di gerarchia visiva:

- titolo principale con peso `font-semibold` e tracking stretto;
- descrizioni e helper text piu piccoli;
- microtesti e badge in dimensioni ridotte;
- label e metadati spesso in maiuscolo o con tracking aumentato.

Pattern frequenti:

- `text-xl` / `text-2xl` per heading principali;
- `text-sm`, `text-xs`, `text-[0.7rem]`, `text-[0.65rem]` per contenuti secondari e dati compatti;
- uso di `italic` per la frase motivazionale.

Il risultato e una tipografia:

- gerarchica;
- compatta;
- orientata alla dashboard piu che alla lettura lunga.

## Uso delle icone

Le icone `lucide-react` sono una parte importante dello stile.

Non sono decorative in senso puro: servono a rinforzare il significato di ogni blocco.

Esempi di ruoli:

- `Sparkles` per titolo/dashboard;
- `Flame` per energia e streak;
- `Award` per XP;
- `Target` per stats e habits;
- `Palette` per il tema;
- `Brush` per la parte motivazionale;
- `Upload` per avatar;
- `Trash2` per azioni distruttive;
- `ChevronUp` per il livello.

Le icone sono quasi sempre:

- piccole;
- allineate al testo;
- colorate con `text-primary` o con colori semantici.

## Mood visivo

Il mood del progetto e una combinazione di:

- self-improvement;
- dashboard personale;
- avatar/character progression;
- dark UI elegante ma non corporate.

Ci sono elementi che danno questa sensazione:

- terminologia da gioco: level, XP, stats, streak;
- avatar grande e centrale;
- radar delle aree della vita;
- badge e pillole;
- barra progresso;
- pannelli tematici dedicati.

## Trattamento delle superfici

Le superfici non sono piatte.

Pattern usati:

- `bg-card/90`;
- `bg-background/80`;
- `bg-muted/30`, `bg-muted/40`;
- overlay gradienti;
- talvolta `backdrop-blur`;
- immagini di sfondo con gradient overlay per migliorare leggibilita.

Questo crea profondita senza uscire dal tema scuro.

## Bordi, ombre e layering

I bordi sono visibili ma discreti:

- spesso `border-border/70`;
- raramente pieni o pesanti.

Le ombre:

- sono presenti quasi su tutte le card;
- servono piu a separare i pannelli che a creare forte elevazione materiale;
- nel profilo avatar e in alcune card principali sono piu marcate.

Il layering e evidente in:

- card profilo con overlay gradiente;
- pulsante upload avatar sovrapposto all'immagine;
- badge livello sovrapposto al pannello avatar;
- banner con immagine + gradiente + testo in overlay.

## Componenti chiave

### Profile card

E uno degli elementi visivi piu forti.

Caratteristiche:

- immagine ampia;
- overlay in basso per leggibilita;
- nome personaggio e livello integrati dentro l'immagine;
- pulsante upload piccolo e flottante.

Questa card definisce molto del carattere del progetto.

### Daily Energy

Blocchi piccoli con:

- icona in cerchio;
- etichetta;
- input numerico compatto.

Stile: strumento rapido, non narrativo.

### Theme Accent

Pulsanti circolari con preview colore.

Stile:

- semplice;
- funzionale;
- coerente con il concetto di personalizzazione rapida.

### Manage Stats

Lista/tabella compatta con input numerici e azione di rimozione.

Stile:

- tecnico;
- da pannello di configurazione;
- sempre dentro il linguaggio card-based.

### Radar View

E il cuore visivo del centro dashboard.

Caratteristiche:

- chart grande;
- colori leggibili su sfondo dark;
- legenda sotto il grafico;
- etichette piccole ma ordinate.

E la parte piu "game stat sheet" del progetto.

### Motivation / Daring Arc

Blocco piu editoriale, meno tecnico.

Segnali visivi:

- bordo verticale accentato;
- testo in corsivo;
- textarea con stile leggermente piu morbido.

Serve a bilanciare la dashboard con una parte piu riflessiva.

### Experience card

Card dedicata alla progressione.

Elementi:

- livello;
- XP correnti;
- bisogno residuo per level up;
- barra di progresso;
- input rapido per aggiungere XP.

Stile:

- leggibile;
- orientato al feedback immediato;
- uno dei punti focali a destra.

### Habit Tracker

Usa pattern da checklist, ma trattati con estetica coerente col resto:

- checkbox;
- streak badge;
- hover state per la rimozione;
- lista compatta con separazione morbida.

## Immagini

Le immagini vengono usate in modo atmosferico e identitario:

- avatar principale molto visibile;
- banner decorativo laterale.

Entrambe sono trattate con:

- crop pieno;
- overlay scuro/gradiente quando serve;
- integrazione con il resto della palette dark.

## Densita dell'interfaccia

La UI e relativamente densa.

Questo significa:

- molte informazioni in poco spazio;
- uso frequente di `text-xs` e `text-sm`;
- controlli piccoli ma non microscopici;
- forte enfasi su compattezza e dashboarding.

Non e una UI "airy" o estremamente spaziosa.

## Responsive behavior

Dal codice si vede che il layout e pensato per adattarsi a schermi piccoli senza cambiare l'identita.

Comportamenti osservabili:

- card che diventano full width;
- colonne che collassano in verticale;
- spaziature leggermente adattate tra mobile e desktop;
- altezze avatar diverse tra mobile e desktop.

## Principi stilistici impliciti del progetto

Guardando il codice, i principi che emergono davvero sono questi:

1. La dashboard deve sembrare una scheda personaggio, non una semplice todo app.
2. I dati devono essere leggibili subito, con molta gerarchia visiva.
3. L'accent color va usato come evidenziatore, non come riempimento generale.
4. Le card sono l'unita base di composizione.
5. Il dark theme e parte dell'identita, non solo una variante.
6. L'interfaccia unisce produttivita e introspezione, non solo tracking numerico.

## Cose da non cambiare se si vuole restare coerenti

Se il progetto deve restare fedele allo stile attuale, conviene non alterare questi aspetti:

- non trasformarlo in una UI chiara o minimalista piatta;
- non sostituire la struttura a card con layout troppo vuoti;
- non rimuovere badge, icone e indicatori di progressione;
- non sostituire il radar con visual piu "business";
- non aumentare troppo il bianco o i contrasti freddi da pannello enterprise;
- non cambiare la logica "character / progression / ritual".

## Nota finale

Questo documento descrive lo stile osservabile nel progetto attuale.

Non definisce:

- brand voice testuale completa;
- linee guida di motion;
- sistema tipografico avanzato;
- libreria di componenti formalizzata;
- regole di design token oltre a quelle gia presenti nel codice.

Se vuoi, nel prossimo passo posso anche creare una seconda versione di `stile.md` piu operativa, cioe scritta come guida per futuri sviluppatori con sezioni tipo "do / don't", "component rules" e "regole da rispettare quando si modifica la UI".
