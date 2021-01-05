/*--------------------------------------------------

Suositus aikuisen koiran päivittäiseksi proteiinin saanniksi on 4,3-5,0 g sulavaa raakavalkuaista (SRV) per koiran metabolinen painokilo.
Metabolinen paino saadaan, kun koiran elopaino korotetaan potenssiin 0,75. 
Käytetään esimerkkinä koiraa, jonka elopaino on 10 kg. 10 kiloa painavan koiran metabolinen paino on 100,75 = 5,62 kg. 
Tällöin esimerkkikoiran tulisi saada sulavaa raakavalkuaista välillä 24,2 g – 28,1 g (5,62 x 4,3 g = 24,2 g ja 5,62 x 5,0 g = 28,1 g).

Lihassa valkuaista on keskimäärin noin 20 %. Valkuaisen sulavuus 90 %. Esimerkiksi jos koira syö 100 g lihaa, se saa sulavaa raakavalkuaista 100 g x 0,2 x 0,9 = 18 grammaa. 
Proteiinia tulee olla ruokavaliossa aina vähintään 18 % kuiva-aineesta. Suositus on 22-24 % kuiva-aineesta.

--------------------------------------------------*/
const express = require("express");
const app = express()

const bodyParser = require("body-parser");

const session = require("express-session");
const crypto = require("crypto");

const ravintolaskuri = require("./models/ravintolaskuri");
const { ok } = require("assert");

const portti = 3009; 

app.set("views", "./views");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("./public"));

app.use(session({
    "secret" : "SuuriSalaisuus!", 
    "resave" : false, 
    "saveUninitialized" : false
   
}));

app.use((req, res, next) => {

/*jos käyttäjä on kirjautunut sisään, 
voi tallentaa koiran tiedot ja laskurin antamat tiedot tietokannan tauluun koira*/

    if (!req.session.saaTulla && req.path == "/tallenna") {
        let kirjauduttu = false;
        res.render("tulokset", {
                    "tallennusVirhe" : "Kirjaudu sisään tallentaaksesi tiedot",
                    "kirjauduttu" : kirjauduttu
        });
    } else {
        next();
    }

});

//laskuri, index
app.get("/", (req, res) => {

    let virhe = null;
    let kirjauduttu = false;

    ravintolaskuri.haeKuivaruoat((err, data) => {
        let kuivaruoat;
        if (err) {
            virhe = "Virhe yhteydessä. Yritä myöhemmin uudelleen.";
            kuivaruoat = null;
        } else {kuivaruoat = data;}

        ravintolaskuri.haeRaakaruoat((err, data) => {
            let raakaruoat;
            if (err) {
                virhe = "Virhe tietokantayhteydessä. Yritä myöhemmin uudelleen.";
                raakaruoat = null;
            } else {raakaruoat = data;}

    let lomakeoletukset = {
            "paino" : null,
            "ika" : null
    };

    if(req.session.saaTulla){
        kirjauduttu = true;
    }

    res.render("index", { 
                            "tulokset" : null,
                            "kuivaruoat" : kuivaruoat,
                            "raakaruoat" : raakaruoat,
                            "virhe" : virhe,
                            "lomaketiedot" : lomakeoletukset,
                            "proteiini_tarve" : null,
                            "kirjauduttu" : kirjauduttu
                        });

        });
    });
});

app.post("/laske", (req, res) => {

    let virhe = null;
    let kirjauduttu = false;

    if(req.session.saaTulla){
        kirjauduttu = true;
    }

    if (req.body.paino == "") {
        virhe = "Laskeminen ei onnistu. Ilmoita koiran paino.";
        res.render("tulokset", { 
                                "tiedot" : null,
                                "raakatulokset" : null,
                                "kuivatulokset" : null,
                                "virhe" : virhe,
                                "tallennusVirhe" : null,
                                "kirjauduttu" : kirjauduttu
        });
    }

    else if (req.body.ika == "") {
        virhe = "Laskeminen ei onnistu. Ilmoita koiran ikä.";
        res.render("tulokset", { 
                                "tiedot" : null,
                                "raakatulokset" : null,
                                "kuivatulokset" : null,
                                "virhe" : virhe,
                                "tallennusVirhe" : null,
                                "kirjauduttu" : kirjauduttu
        });
    } else {

        ravintolaskuri.haeTiedot(req.body, (err, raakatulos, kuivatulos, tiedot) => {

            if (err) {
                virhe = "Virhe tietokantayhteydessä. Yritä myöhemmin uudelleen.";
                raakatulos = null;
                kuivatulos = null;
            }

            req.session.koira = tiedot;
            req.session.raakatulos = raakatulos;
            req.session.kuivatulos = kuivatulos;
            req.session.virhe = virhe;

            res.render("tulokset", { 
                                "tiedot" : tiedot,
                                "raakatulokset" : raakatulos,
                                "kuivatulokset" : kuivatulos,
                                "virhe" : virhe,
                                "tallennusVirhe" : null,
                                "kirjauduttu" : kirjauduttu
            });

        });

    }
});

//laskurin tulokset säilyvät session ajan
app.get("/tulokset/", (req, res) => {

    let kirjauduttu = false;

    if(req.session.saaTulla){
        kirjauduttu = true;
    }

    res.render("tulokset", { 
        "tiedot" : req.session.koira,
        "raakatulokset" :  req.session.raakatulos,
        "kuivatulokset" : req.session.kuivatulos,
        "virhe" : req.session.virhe,
        "tallennusVirhe" : null,
        "kirjauduttu" : kirjauduttu
    });

});

/*
jos käyttäjä on kirjautunut sisään,
voi tallentaa koiran tiedot ja laskurin antamat tiedot tietokannan tauluun koira
*/
//koirien haku käyttäjän id:llä
app.get("/tallenna/", (req, res) => {

    if (req.session.saaTulla) {

        let virhe = null;
        let ok = null;
        let kayttaja = req.session.kayttaja;
        let koiranTiedot = req.session.koira;
        let raakatulokset = req.session.raakatulos;
        let kuivatulokset = req.session.kuivatulos;

        ravintolaskuri.haeKoiraTiedot(kayttaja, (err, data) => {
        
            let koira;
    
            if (err) {
               virhe = "Virhe tietokantayhteydessä. Yritä myöhemmin uudelleen.";
                koira = null;
            } else {koira = data;}

            res.render("tallenna", { 
                            "virhe" : virhe,
                            "ok" : ok,
                            "koira" : koira,
                            "kayttaja" : kayttaja,
                            "koiranTiedot" : koiranTiedot,
                            "raakatulokset" :  raakatulokset,
                            "kuivatulokset" : kuivatulokset
            });

        });
    }
});

app.post("/tallenna/", (req, res) => {

    let virhe = null;
    let ok = null;

    if(req.body.nimi == "" && req.body.valmisKoira == "") {
        virhe = "Anna koiran nimi tai valitse koira."

        res.render("tallenna", { 
            "virhe" : virhe,
            "ok" : ok
        });

    } else {

        ravintolaskuri.tallennaTiedot(req.body, (err) => {

            if (err) {
                virhe = "Virhe tietokantayhteydessä. Yritä myöhemmin uudelleen.";
            } else { 

                ok = "Tiedot tallennettu onnistuneesti."

                res.render("tallenna", { 
                    "virhe" : virhe,
                    "ok" : ok
                });
            }

        });
    }
});


/*
jos käyttäjä on tallentanut koirien tietoja, näkyvät ne omissa koirissa, omatkoirat.ejs
*/
app.get("/omatkoirat/", (req, res) => {
    if (req.session.saaTulla) {

        let virhe = null;
        let kayttaja = req.session.kayttaja;

        ravintolaskuri.haeKoiraTiedot(kayttaja, (err, data) => {
    
            let koira;

            if (err) {
               virhe = "Virhe tietokantayhteydessä. Yritä myöhemmin uudelleen.";
                koira = null;
            } else {koira = data;}

            res.render("omatkoirat", { 
                            "virhe" : virhe,
                            "koira" : koira
            });

        });
    }
});

/*
Kirjautuminen
*/
app.get("/kirjaudu/", (req, res) => {

    res.render("kirjaudu", { "virhe" : ""});

});


app.post("/kirjaudu/", (req, res) => {

    ravintolaskuri.haeKayttaja(req.body.tunnus, (kayttaja, err) => {

        if (err) {
            virhe = "Virhe tietokantayhteydessä. Yritä myöhemmin uudelleen.";
        }

        if (kayttaja) {

            let hash = crypto.createHash("SHA512").update(req.body.salasana).digest("hex");

            if (hash == kayttaja.salasana) {
                req.session.saaTulla = true;

                let sessioKayttaja = {
                    "id": kayttaja.id,
                    "tunnus" : kayttaja.tunnus
                };

                req.session.kayttaja = sessioKayttaja;
                res.redirect("/");
    
            } else {
                req.session.saaTulla = false;
                res.render("kirjaudu", { "virhe" : "Virheellinen salasana tai käyttäjätunnus. Yritä uudelleen." });
    
            }
    
        } else {
            req.session.saaTulla = false;
            res.render("kirjaudu", { "virhe" : "Virheellinen salasana tai käyttäjätunnus. Yritä uudelleen." });
    
        }

    });

});

app.get("/logout/", (req, res) => {

    req.session.saaTulla = false;
    res.redirect("/");

});

/*
Rekisteröityminen
*/
app.get("/rekisteroidy/", (req, res) => {

    ravintolaskuri.haeKaikkiKayttajat((kayttajat, err) => {
        if(!err){
            res.render("rekisteroidy", { "virhe" : "", "ok" : "", "kayttajat" : kayttajat});
        }
        if(err){
            res.render("rekisteroidy", { "ok" : "", "virhe" : "Virhe tietokantayhteydessä. Yritä myöhemmin uudelleen.", "kayttajat" : null});
        }
    });
    
});

app.post("/rekisteroidy/", (req, res) => {

    let salasana;
    if(req.body.rekisteroiSalasana1 == req.body.rekisteroiSalasana2 && req.body.rekisteroiSalasana1 != "" && req.body.rekisteroiTunnus != ""){
        salasana = req.body.rekisteroiSalasana1

        let hash = crypto.createHash("SHA512").update(salasana).digest("hex");
        
        let uusiKayttaja = {
                            "kayttaja_id" : req.body.kayttajaId,
                            "tunnus" : req.body.rekisteroiTunnus,
                            "salasana" : hash
                        }
        let kayttajat = ravintolaskuri.haeKaikkiKayttajat((kayttajat) => {
            ravintolaskuri.lisaaKayttaja(uusiKayttaja, (err) => {
                if(!err) {
                    res.render("rekisteroidy", { "ok" : "Rekisteröityminen onnistui. Kirjaudu sisään.", "virhe" : "", "kayttajat" : kayttajat});
                }
                if(err) {
                        res.render("rekisteroidy", { "ok" : "", "virhe" : "Virhe tietokantayhteydessä. Yritä myöhemmin uudelleen.", "kayttajat" : kayttajat});
                }
            });
        }); 
    } else {
        let kayttajat = ravintolaskuri.haeKaikkiKayttajat((kayttajat) => {
                    res.render("rekisteroidy", { "virhe" : "Täytä kaikki kentät ja varmista salasanan täsmäävyys. Kokeile uudelleen.", "ok" : "", "kayttajat" : kayttajat });
        });
    }
});

app.listen(portti, () => {
    
    console.log(`Palvelin käynnistyi porttiin ${portti}`);
    
});