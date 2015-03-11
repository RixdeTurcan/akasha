/*===============================================
auteur  : NoSmoking
http://www.developpez.net/forums/u405341/nosmoking/
version : 0.2
date    : 2013-10-31

=================================================
 Toutes les explications sur
 http://fr.wikipedia.org/wiki/Parcours_de_Graham
=================================================
-- l'ALGO --
Trouver le pivot P;
Trier les points par angle (les points d'angle Ã©gal seront triÃ©s par rapport Ã  leur abscisse);
# Points[1] est le pivot, Points[longueur] aussi (fin du circuit)
Pile.empiler(Points[1]);
Pile.empiler(Points[2]);
POUR i = 3 A Points.longueur
  TANT QUE (Pile.hauteur >= 2) ET (Produit_vectoriel(Pile.second, Pile.haut, Points[i]) <= 0)
    Pile.dÃ©piler;
  FIN TANT QUE
  Pile.empiler(Points[i]);
FIN POUR

FONCTION Produit_vectoriel(p1, p2, p3)
  RENVOYER(p2.x - p1.x)*(p3.y - p1.y) - (p3.x - p1.x)*(p2.y - p1.y);
FIN FONCTION

-- FORMAT DONNEES --
les donnÃ©es doivent Ãªtre un tableau( Array) au format minimum suivant
{
  'lat': valeur numÃ©rique,
  'lng': valeur numÃ©rique
}
===============================================*/
/**
* return les datas en entrÃ©e triÃ©es
* @param data : les donnÃ©es en entrÃ©e, Array au format jSON
**/
function grahamTriData( data){
  var pivot;
  // on tri pour avoir le point le plus haut en index 0
  function triLatitude(o1, o2){
    if (o1.y < o2.y){
      return -1;
    }
    if (o1.y > o2.y){
      return 1;
    }
    return 0;
  }
  // on reordonne suivant l'angle
  function triAngle( o1, o2){
    var a1 = Math.atan2( o1.y -pivot.y, o1.x -pivot.x),
        a2 = Math.atan2( o2.y -pivot.y, o2.x -pivot.x);
    return ( a1 > a2) ? 1 : -1;
  }

  data.sort( triLatitude);
  pivot = data[0];
  data.sort( triAngle);
}
/**
* return un Array contenant les points formant l'enveloppe
* @param data : les donnÃ©es en entrÃ©e, Array au format jSON
**/
function grahamCreateEnveloppe(data){
  function produitVectoriel(p1, p2, p3) {
    return ((p2.x -p1.x)*(p3.y -p1.y) -(p2.y -p1.y)*(p3.x -p1.x)) <=0;
  }
  var i,
      nbr = data.length,
      enveloppe = [],
      point1 = data[0],
      point2 = data[1],
      pEncours;

  enveloppe.push(point1);
  enveloppe.push(point2);

  for( i = 2; i < nbr; i += 1) {
    pEncours = data[i];
    while( enveloppe.length >= 2 && produitVectoriel( point1, point2, pEncours)){
      enveloppe.pop();
      point1 = enveloppe[ enveloppe.length -2];
      point2 = enveloppe[ enveloppe.length -1];
    }
    enveloppe.push( pEncours);
    point1 = point2;
    point2 = pEncours;
  }
  return enveloppe;
}
/**
* enchaine les deux fonctions ci dessus
* return un Array contenant les points formant l'enveloppe
* @param data : les donnÃ©es en entrÃ©e, Array au format jSON
* @param clone : facultatif, mettre Ã  true si l'on ne veut pas que les donnÃ©es en entrÃ©e soient modifiÃ©es
**/
function getEnveloppeConvexe( data, clone){
  var enveloppe = [];
  if(clone){
    data = data.slice();
  }
  grahamTriData(data);
  enveloppe = grahamCreateEnveloppe( data);
  return enveloppe;
}
