Array.prototype.remVal = function(value){
    let index = this.indexOf(value);
    if (index != -1){
        this.splice(index, 1);
    }
}

let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');
canvas.height = 700;
canvas.width = 700;
let tailleCase = (canvas.width/9)*0.98;
let espaceCase = (canvas.width/9)*0.02;

const A=1, B=2, C=3, D=4, E=5, F=6, G=7, H=8, I=9;

class Case{
    constructor(valeur, certain=true, humain=false, initial=false){
        this.val = valeur;
        this.possibles = null;
        this.certain = certain;
        this.humain = humain;
        this.initial = initial;
    }
}

class Grille{
    constructor(zones,y=9,x=9){
        //Grille de 9x9
        let valeurs = [];
        for (let xc = 0; xc<x; xc++){
            let ligne = [];
            for (let yc = 0; yc<y; yc++){
                ligne.push( new Case(null) );
            }
            valeurs.push(ligne);
        }
        this.valeurs = valeurs;
        this.zones = zones;
        this.nbrValeursRemplies = function(){
            let cpt = 0;
            for (let x=0; x<this.valeurs.length; x++){
                for (let y=0; y<this.valeurs[0].length; y++){
                    if (this.valeurs[x][y].val != null){
                        cpt++;
                    }
                }
            }
            return cpt;
        };
        this.placerHumain = function(x,y,valeur,initial=false,certain=true){
            this.valeurs[x-1][y-1] = new Case(valeur,certain,true,initial);
        };
        this.placer = function(x,y,valeur,certain=true){
            this.valeurs[x][y] = new Case(valeur,certain,false);
        };
        this.valeurDansColonne = function(valeur, x){
            //Une colonne => un X identique
            for (let y = 0; y<this.valeurs.length; y++){
                if (this.valeurs[x][y].val == valeur){
                    return true;
                }
            }
            return false;
        };
        this.valeurDansLigne = function(valeur, y){
            //Une ligne => un Y identique
            for (let x = 0; x<this.valeurs[0].length; x++){
                if (this.valeurs[x][y].val == valeur){
                    return true;
                }
            }
            return false;
        };
        this.valeurDansZone = function(valeur, zone){
            let occurrences = null;
            for (let coords of this.zones[zone]){
                if (this.valeurs[coords.x][coords.y].val == valeur){
                    return true;
                }
            }
            return false;
        };
        this.zoneCoordonnee = function(x,y){
            for(let iZone = 0; iZone<this.zones.length; iZone++){
                for (let co of this.zones[iZone]){
                    if (co.x == x && co.y == y){
                        return iZone;
                    }
                }
            }
            return null;
        };

    }
}

function afficherGrille(grille){
    //Fond
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    //Cases
    for (let iZone = 0; iZone<grille.zones.length; iZone++){
        for (let iCase = 0; iCase<grille.zones[iZone].length; iCase++){
            let x = grille.zones[iZone][iCase].x;
            let y = grille.zones[iZone][iCase].y;
            
            //Rectangle
            ctx.fillStyle = couleurZones[iZone];
            let coordx = (espaceCase)*(1+x) + tailleCase*x;
            let coordy = (espaceCase)*(1+y) + tailleCase*y;
            ctx.fillRect(coordx,coordy,tailleCase,tailleCase);
            
            //texte de la case
            ctx.fillStyle = "#373737";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle"; 
            let texte = "";
            let texteRotation = 0; // En radians
            if (grille.valeurs[x][y].val != null){

                //Valeur numérique
                ctx.font = "20px Bungee";
                texte += grille.valeurs[x][y].val;
                if(grille.valeurs[x][y].initial){
                    ctx.fillStyle = "#660000";
                }
                if (!grille.valeurs[x][y].certain){
                    texte+='*';
                }

            } else if (grille.valeurs[x][y].possibles != null && grille.valeurs[x][y].possibles.length > 0){
                //Si la case a des possibles, on les note
                texteRotation = -Math.PI/4;
                ctx.font = "12px Roboto";
                texte += " [";
                for (let iPossible = 0; iPossible < grille.valeurs[x][y].possibles.length; iPossible++){
                    if (iPossible != 0) {texte+="/";}
                    texte += grille.valeurs[x][y].possibles[iPossible];
                }
                texte += "]";
                
            } else {
                //Case vraiment vide
                ctx.font = "16px Roboto";
                texte += "?";
            }
            coordx += tailleCase/2;
            coordy += tailleCase/2;
            //Rotation au centre de la case
            ctx.translate(coordx,coordy);
            ctx.rotate(texteRotation);
            ctx.translate(-coordx,-coordy);
            //Texte
            ctx.fillText(texte, coordx, coordy);
            //Remise à 0 de la rotation
            ctx.translate(coordx,coordy);
            ctx.rotate(-texteRotation);
            ctx.translate(-coordx,-coordy);
        }
    }

    const lettres="ABCDEFGHI";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle"; 
    ctx.font = "14px Roboto";

    //Lettres (côté)
    for (let i=0; i<grille.valeurs.length; i++){
        let coordy = 10;
        let coordx = (espaceCase)*(1+i) + tailleCase*i + tailleCase/2;
        ctx.fillText(lettres[i], coordx, coordy);
    }

    //Chiffres (côté)
    for (let i=0; i<grille.valeurs[0].length; i++){
        let coordx = 7;
        let coordy = (espaceCase)*(1+i) + tailleCase*i + tailleCase/2;
        ctx.fillText(i+1, coordx, coordy);
    }

    requestAnimationFrame(()=>{
        afficherGrille(grille);
    });
}
function probasCasesVides(grille){
    console.log('Lancement de la recherche des possibles');
    //Parcourir toutes les cases<
    for (let iZone = 0; iZone < grille.zones.length; iZone++){
        for (let iCase = 0; iCase < grille.zones[iZone].length; iCase++){
            let co = grille.zones[iZone][iCase];
            if (grille.valeurs[co.x][co.y].val == null){
                //Si la case est n'a pas de valeur
                //On voit les différents états qu'elle PEUT prendre
                let etatsPossibles = [];
                for (let i=1; i<=9; i++){
                    if(
                        grille.valeurDansLigne(i,co.y) === false 
                        && grille.valeurDansColonne(i,co.x) === false
                        && grille.valeurDansZone(i,iZone) === false
                    ){
                        etatsPossibles.push(i);
                    }
                }
                //S'il n'y a qu'un etat possible, on l'applique
                //Sinon actualiser les états possibles de la case
                if (etatsPossibles.length == 1){
                    grille.placer(co.x,co.y,etatsPossibles[0],false);
                } else {
                    grille.valeurs[co.x][co.y].possibles = etatsPossibles;
                }
            }
        }
    }
}

function deductionCasesZones(grille){
    console.log('Démarrage de la déduction des cases dans les zones...');
    //Parcourir chaque valeur numérique
    for (let valeurCase=1; valeurCase<=9; valeurCase++){
        // ----------------------------
        // Parcourir les zones
        for (let iZone = 0; iZone<grille.zones.length; iZone++){
            // Si valeur ni dans ligne, ni dans colonne, ni dans zone et que la case est vide,
            // Alors la position est possible 
            let posPossiblesZone = [];
            for (let iCase = 0; iCase<grille.zones[iZone].length; iCase++){
                let co = grille.zones[iZone][iCase];  
                if (
                    grille.valeurs[co.x][co.y].val == null
                    && grille.valeurDansLigne(valeurCase, co.y) == false
                    && grille.valeurDansColonne(valeurCase, co.x) == false
                    && grille.valeurDansZone(valeurCase, iZone) == false
                ){
                    posPossiblesZone.push(co);
                }
            }
            if (posPossiblesZone.length == 1){
                let posUnique = posPossiblesZone[0];
                grille.placer(posUnique.x,posUnique.y,valeurCase,false);
            }
        }
    }
}
function deductionCasesLignes(grille){
    console.log('Démarrage de la déduction des cases dans les lignes...');
    //Parcourir chaque valeur numérique
    for (let valeurCase=1; valeurCase<=9; valeurCase++){
        // ----------------------------
        // Parcourir les lignes
        for (let y=0; y<grille.valeurs.length; y++){
            let posPossiblesLigne = [];
            for (let x=0; x<grille.valeurs[0].length; x++){
                //Pour chaque case
                //Si la case a la valeur dans ses possibles, on la met dans pospossibles
                if (grille.valeurs[x][y].val == null && grille.valeurs[x][y].possibles.includes(valeurCase)){
                    posPossiblesLigne.push({'x':x, 'y':y});
                }
            }
            if (posPossiblesLigne.length == 1){
                let posUnique = posPossiblesLigne[0];
                grille.placer(posUnique.x,posUnique.y,valeurCase,false);
            }
        }
    }
}
function deductionCasesColonnes(grille){
    console.log('Démarrage de la déduction des cases dans les colonnes...');
    //Parcourir chaque valeur numérique
    for (let valeurCase=1; valeurCase<=9; valeurCase++){
        // ----------------------------
        // Parcourir les colonnes
        for (let x=0; x<grille.valeurs.length; x++){
            let posPossiblesColonne = [];
            for (let y=0; y<grille.valeurs[0].length; y++){
                //Pour chaque case
                //Si la case a la valeur dans ses possibles, on la met dans pospossibles
                if (grille.valeurs[x][y].val == null && grille.valeurs[x][y].possibles.includes(valeurCase)){
                    posPossiblesColonne.push({'x':x, 'y':y});
                }
            }
            if (posPossiblesColonne.length == 1){
                let posUnique = posPossiblesColonne[0];
                grille.placer(posUnique.x,posUnique.y,valeurCase,false);
            }
        }
    }
}
function deduireParContradictions(grille){
    // TODO
    /*
        On parcourt tous les endroits où dans la grille on a le nombre X
        Une fois celà fait, on vérifie si la première position possible
        entre en conflit avec une des autres.
        Si elle entre en conflit avec aucune, elle reste.
        On fait cela pour chacune des cases possibles, 
        toutes les cases restantes sont bonnes.
*/
}

// -----------------------------------------
/* EXECUTION DU CODE */
// -----------------------------------------

let couleurZones = [
    "#E6C229", //safran
    "#F17105", //orange
    "#AAD7EE", //bleu pâle
    "#8A42FF", //violet navy
    "#1A8FE3", //bleu de france
    "#60992D", //vert maximum
    "#A6ECE0", //magic mint
    "#DB2763", //cherry
    "#EED7A2", //beige
];

// Zones, la grille n'est pas classique. 
// Ce ne sont pas des carrés, mais chaque zone fait 9 cases !
let zones = [
    [
        {x:0, y:0},
        {x:1, y:0},
        {x:2, y:0},
        {x:0, y:1},
        {x:1, y:1},
        {x:2, y:1},
        {x:3, y:1},
        {x:0, y:2},
        {x:1, y:2},
    ],
    [
        {x:3, y:0},
        {x:4, y:0},
        {x:5, y:0},
        {x:6, y:0},
        {x:7, y:0},
        {x:4, y:1},
        {x:5, y:1},
        {x:6, y:1},
        {x:7, y:1},
    ],
    [
        {x:8, y:0},
        {x:8, y:1},
        {x:8, y:2},
        {x:8, y:3},
        {x:8, y:4},
        {x:7, y:2},
        {x:7, y:3},
        {x:7, y:4},
        {x:6, y:2},
    ],
// ------    
    [
        {x:2, y:2},
        {x:3, y:2},
        {x:2, y:3},
        {x:3, y:3},
        {x:1, y:3},
        {x:0, y:3},
        {x:2, y:4},
        {x:2, y:5},
        {x:3, y:5},
    ],
    [
        {x:4, y:2},
        {x:5, y:2},
        {x:4, y:3},
        {x:3, y:4},
        {x:4, y:4},
        {x:5, y:4},
        {x:4, y:5},
        {x:3, y:6},
        {x:4, y:6},
    ],
    [
        {x:5, y:3},
        {x:6, y:3},
        {x:6, y:4},
        {x:5, y:5},
        {x:6, y:5},
        {x:7, y:5},
        {x:8, y:5},
        {x:5, y:6},
        {x:6, y:6},
    ],
// ------
    [
        {x:0, y:4},
        {x:0, y:5},
        {x:0, y:6},
        {x:0, y:7},
        {x:0, y:8},
        {x:1, y:4},
        {x:1, y:5},
        {x:1, y:6},
        {x:2, y:6},
    ],
    [
        {x:1, y:7},
        {x:2, y:7},
        {x:3, y:7},
        {x:4, y:7},
        {x:1, y:8},
        {x:2, y:8},
        {x:3, y:8},
        {x:4, y:8},
        {x:5, y:8},
    ],
    [
        {x:7, y:6},
        {x:8, y:6},
        {x:5, y:7},
        {x:6, y:7},
        {x:7, y:7},
        {x:8, y:7},
        {x:6, y:8},
        {x:7, y:8},
        {x:8, y:8},
    ],
];

let grille = new Grille(zones, 9, 9);

// REMPLISSAGE DES DONNEES CONNUES
//J+0 (Valeurs initiales, donc certaines)
grille.placerHumain(A,1,9,true);
grille.placerHumain(B,1,7,true);
grille.placerHumain(C,1,4,true);
grille.placerHumain(G,1,2,true);
grille.placerHumain(B,2,6,true);
grille.placerHumain(A,3,2,true);
grille.placerHumain(D,3,4,true);
grille.placerHumain(G,4,5,true);
grille.placerHumain(I,4,4,true);
grille.placerHumain(A,5,8,true);
grille.placerHumain(B,5,2,true);
grille.placerHumain(F,5,1,true);
grille.placerHumain(H,5,9,true);
grille.placerHumain(I,5,5,true);
grille.placerHumain(C,8,7,true);
grille.placerHumain(H,8,2,true);
grille.placerHumain(C,9,9,true);
grille.placerHumain(G,9,6,true);
grille.placerHumain(H,9,5,true);
grille.placerHumain(I,9,8,true);
grille.placerHumain(I,7,1,false); //Enigme 3 feuille

//J+1
grille.placerHumain(B,9,4,false); //Enigme 2 feuille
grille.placerHumain(G,2,9,false); //Enigme 1 feuille

//J+2
grille.placerHumain(H,1,8,false); //Enigme 1
grille.placerHumain(A,6,4,false); //Enigme 2
grille.placerHumain(A,4,3,false); //Enigme 3

//J+3
grille.placerHumain(A,7,6,false); //Enigme 4
grille.placerHumain(D,5,3,false); //Enigme 5
grille.placerHumain(G,8,3,false); //Enigme 6

//J+4
grille.placerHumain(F,6,2,false); //Enigme 7
grille.placerHumain(D,2,8,false); //Enigme 8
grille.placerHumain(B,7,5,false); //Enigme 9

afficherGrille(grille);

// Solver 200 fois, si au bout de 200 fois toujours pas solvé
// on s'arrête de solver.
for (let i=0; i<200; i++){
    console.log('Itération n°'+i);
    probasCasesVides(grille);
    //deductionCasesZones(grille);

    probasCasesVides(grille);
    //deductionCasesLignes(grille);
    
    probasCasesVides(grille);
    //deductionCasesColonnes(grille);

    probasCasesVides(grille);
    //deductionCasesObligatoires(grille);
}