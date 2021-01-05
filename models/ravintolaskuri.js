/*const mysql = require("mysql");
const yhteys = mysql.createConnection({
                                        host     : "localhost",
                                        user     : "root",
                                        password : "",
                                        database : "ravintolaskuri"
                                    });

yhteys.connect((err) => {

    if(!err) {

        console.log("Tietokantayhteys avattu");    

    } else {

        throw `Virhe yhdistettäessä tietokantaan: ${err}`;    
        
    }
});*/

const fs = require("fs");
const koiraJSON = "./models/koira.json";
const kayttajaJSON = "./models/kayttaja.json";
const kuivaruokaJSON = "./models/kuivaruoka.json";
const raakaruokaJSON = "./models/raakaruoka.json";
const haimaJSON = "./models/haima.json";

module.exports = {

    "haeKuivaruoat" : (callback) => {

      /*  let sql = `SELECT * FROM kuivaruoka;`;

        yhteys.query(sql, (err, data) => {

            callback(err, data);

        });*/

        fs.readFile(kuivaruokaJSON, "utf-8", (err, data) => {

            data = JSON.parse(data);
         //   data = data.filter(function(x) { return x !== null });

            return callback(err, data);

        });

    },

    "haeRaakaruoat" : (callback) => {

        /*lihoissa ei saa olla sian haimaa valittavissa
        let sql = `SELECT * FROM raakaruoka WHERE NOT tuote = 'Sian haima';`;

        yhteys.query(sql, (err, data) => {

            callback(err, data);

        });*/

        fs.readFile(raakaruokaJSON, "utf-8", (err, data) => {

            data = JSON.parse(data);
         //   data = data.filter(function(x) { return x !== null });

            return callback(err, data);
            
        });

    },

    "haeTiedot" : (lomaketiedot, callback) => {

        let ika = lomaketiedot.ika;
        let paino = lomaketiedot.paino;
        paino = Number(paino);

        //lasketaan sinkin tarve (paino*2mg)
        let sinkinmaara = paino * 2;

        //lasketaan koiran metabolinen paino (x potenssiin 0.75)
        let metapaino = Math.pow(paino, 0.75);
        //lasketaan proteiinin vuorokausittainen tarve (metabolinen paino * 5g)
        let proteiini_tarve = metapaino * 5;

        let raakatuote = lomaketiedot.valinta_raakaruoka;
        let kuivatuote = lomaketiedot.valinta_kuivaruoka;

        let raakaruoanmaara = 0;

        if(lomaketiedot.aktiivisuus == "laiska") {
            //lasketaan tarvittava raakaruoan määrä (2 % (g) painosta, ja siitä 60%)
            raakaruoanmaara = paino * 20 * 0.6;
        }
        if(lomaketiedot.aktiivisuus == "normaali") {
            //lasketaan tarvittava raakaruoan määrä (2,5 % (g) painosta, ja siitä 60%)
            raakaruoanmaara = paino * 25 * 0.6;
        }
        if(lomaketiedot.aktiivisuus == "aktiivinen") {
            //lasketaan tarvittava raakaruoan määrä (3 % (g) painosta, ja siitä 60%)
            raakaruoanmaara = paino * 30 * 0.6;
        }

        let nivelrikko = 0;
        //lasketaan nivelravinteiden tarve
        let msm_tarve = 0;
        let kondr_tarve = 0;
        let gluk_tarve = 0;
        //jos nivelrikko on valittu tai ikä on vähintään 7 vuotta, nivelrikko true
        if (lomaketiedot.nivelrikko || ika >= 7) {
            nivelrikko = 1;
            //lasketaan nivelravinteiden tarve
            msm_tarve = 33.33 * paino;
            kondr_tarve = 7 * paino;
            gluk_tarve = 21 * paino;

        }

        let haimanvajaatoiminta = 0;
        let haimaproteiini = 0;
        //jos haiman vajaatoiminta on valittu, raakalihan määrästä vähennetään päivittäisen haiman määrä
        //haiman määrä on aina 190 grammaa päivässä
        const haimanmaara = 190;
        if (lomaketiedot.haimanvajaatoiminta) {
            haimanvajaatoiminta = 1;
            raakaruoanmaara = raakaruoanmaara - haimanmaara;
        }

        let tiedot = {
                        "paino" : paino,
                        "ika" : ika,
                        "proteiini_tarve" : proteiini_tarve.toFixed(0),
                        "sinkki_tarve" : sinkinmaara,
                        "aktiivisuus" : lomaketiedot.aktiivisuus,
                        "nivelrikko" : nivelrikko,
                        "haimanvajaatoiminta" : haimanvajaatoiminta,
                        "msm_tarve" : msm_tarve.toFixed(0),
                        "kondr_tarve" : kondr_tarve.toFixed(0),
                        "gluk_tarve" : gluk_tarve.toFixed(0)
        }

        let raakaliha ="";
        let raakarasva = 0;
        let raakaproteiini = 0;
        let raakasinkki = 0;
        let raakatulos;

        let kuivanappula ="";
        let kuivarasva = 0;
        let kuivaproteiini = 0;
        let kuivasinkki = 0;
        let kuivakuitu = 0;
        let kuivamsm = 0;
        let kuivakondroitiini = 0;
        let kuivaglukosamiini = 0;  

        let varoitus = "";
        let raakavaroitus = "";

        fs.readFile(raakaruokaJSON, "utf-8", (err, data) => {

            raakadata = JSON.parse(data);
         //   data = data.filter(function(x) { return x !== null });

            raakadata.forEach((raaka) => {

                if (raakatuote === raaka.tuote) {
                    raakaliha = raaka.tuote;
                    raakarasva = raaka.rasva;
                

                    //jos haiman vajaatoiminta on valittu, rasvaa ei ruoassa saisi olla yli 11 %
                    //vähennetään myös haiman ravintoarvojen määrä muusta raakaruuasta
                    if (lomaketiedot.haimanvajaatoiminta && raakarasva > 11) {
                        raakavaroitus = `Huom. Valitsemasi kuivaruoka sisältää rasvaa ${raakarasva} %, joka on yli suosituksen haiman vajaatoiminnan hoidossa.`
                    }

                    if (lomaketiedot.haimanvajaatoiminta && raakaruoanmaara < 2) {
                        raakavaroitus = `Tämän kokoiselle koiralle en suosittele haiman vajaatoiminnan hoitoon raa'an sian haiman ja ruokintamallin 50/50 yhdistelmää.`
                    }

                    if (lomaketiedot.haimanvajaatoiminta) {

                        fs.readFile(haimaJSON, "utf-8", (err, data) => {
                                    
                            haimadata = JSON.parse(data);

                            haimadata.forEach((haimadata) => {
                                haimaproteiini = haimadata.proteiini * (haimanmaara / 100);
                                haimasinkki = haimadata.sinkki * (haimanmaara / 100);
                                haimarasva = haimadata.rasva;
                                raakaproteiini = raaka.proteiini / 100 * raakaruoanmaara + haimaproteiini;
                                raakasinkki = raaka.sinkki / 100 * raakaruoanmaara + haimasinkki;
                            });
                        
                    
                        raakatulos = {
                                        "tuote" : raakaliha,
                                        "maara" : raakaruoanmaara.toFixed(0),
                                        "rasva" : raakarasva,
                                        "proteiini" : raakaproteiini.toFixed(0),
                                        "sinkki" : raakasinkki.toFixed(0),
                                        "haimarasva" : haimarasva,
                                        "raakavaroitus" : raakavaroitus
                        }
                    });
                    } else {

                        raakaproteiini = raaka.proteiini / 100 * raakaruoanmaara;
                        raakasinkki = raaka.sinkki / 100 * raakaruoanmaara;
                    
                        raakatulos = {
                                        "tuote" : raakaliha,
                                        "maara" : raakaruoanmaara.toFixed(0),
                                        "rasva" : raakarasva,
                                        "proteiini" : raakaproteiini.toFixed(0),
                                        "sinkki" : raakasinkki.toFixed(0)
                        }
                    }
                }
            });

            fs.readFile(kuivaruokaJSON, "utf-8", (err, data) => {

                kuivadata = JSON.parse(data);
                //   data = data.filter(function(x) { return x !== null });

                kuivadata.forEach((kuiva) => {

                    if (kuivatuote === kuiva.tuote) {

                        kuivanappula = kuiva.tuote;
                        kuivaruoanmaara = kuiva.g_per_5kg;
                        kuivarasva = kuiva.rasva;
                        kuivaproteiini = kuiva.proteiini;
                        kuivasinkki = kuiva.sinkki;
                        kuivakuitu = kuiva.kuitu;
                        kuivamsm = kuiva.msm;
                        kuivakondroitiini = kuiva.kondroitiini;
                        kuivaglukosamiini = kuiva.glukosamiini;
                        
                
                
                        if(paino < 10){
                            //lasketaan kuivaruoan määrä (50 % valmistajan ilmoittamasta määrästä)
                            kuivaruoanmaara = kuivaruoanmaara / 5 * paino * 0.5;
                            kuivaproteiini = kuivaproteiini / 100 * kuivaruoanmaara;
                            kuivasinkki = kuivasinkki / 100 * kuivaruoanmaara; 
                            kuivamsm = kuivamsm / 100 * kuivaruoanmaara;
                            kuivakondroitiini = kuivakondroitiini/ 100 * kuivaruoanmaara;
                            kuivaglukosamiini = kuivaglukosamiini / 100 * kuivaruoanmaara;
                        }
                        if(paino >= 10 && paino < 20){
                            /*lasketaan kuivaruoan määrä (50 % valmistajan ilmoittamasta määrästä), 
                            ruoan grammamäärä per koiran painokilo on 25 % vähemmän kuin alle 10 kg painavan koiran*/
                            kuivaruoanmaara = (kuivaruoanmaara / 5 - kuivaruoanmaara / 5 *0.25) * paino * 0.5;
                            kuivaproteiini = kuivaproteiini / 100 * kuivaruoanmaara; 
                            kuivasinkki = kuivasinkki / 100 * kuivaruoanmaara;
                            kuivamsm = kuivamsm / 100 * kuivaruoanmaara;
                            kuivakondroitiini = kuivakondroitiini/ 100 * kuivaruoanmaara;
                            kuivaglukosamiini = kuivaglukosamiini / 100 * kuivaruoanmaara;
                        }
                        if(paino >= 20 && paino <= 27){
                            /*lasketaan kuivaruoan määrä (50 % valmistajan ilmoittamasta määrästä), 
                            ruoan grammamäärä per koiran painokilo on 30 % vähemmän kuin alle 10 kg painavan koiran*/
                            kuivaruoanmaara = (kuivaruoanmaara / 5 - kuivaruoanmaara / 5 *0.3) * paino * 0.5;
                            kuivaproteiini = kuivaproteiini / 100 * kuivaruoanmaara; 
                            kuivasinkki = kuivasinkki / 100 * kuivaruoanmaara;
                            kuivamsm = kuivamsm / 100 * kuivaruoanmaara;
                            kuivakondroitiini = kuivakondroitiini/ 100 * kuivaruoanmaara;
                            kuivaglukosamiini = kuivaglukosamiini / 100 * kuivaruoanmaara;
                        }
                        if(paino > 27 && paino <= 44){
                            /*lasketaan kuivaruoan määrä (50 % valmistajan ilmoittamasta määrästä), 
                            ruoan grammamäärä per koiran painokilo on 40 % vähemmän kuin alle 10 kg painavan koiran*/
                            kuivaruoanmaara = (kuivaruoanmaara / 5 - kuivaruoanmaara / 5 * 0.4) * paino * 0.5;
                            kuivaproteiini = kuivaproteiini / 100 * kuivaruoanmaara; 
                            kuivasinkki = kuivasinkki / 100 * kuivaruoanmaara;
                            kuivamsm = kuivamsm / 100 * kuivaruoanmaara;
                            kuivakondroitiini = kuivakondroitiini/ 100 * kuivaruoanmaara;
                            kuivaglukosamiini = kuivaglukosamiini / 100 * kuivaruoanmaara;
                        }
                        if(paino > 44 && paino <= 64){
                            /*lasketaan kuivaruoan määrä (50 % valmistajan ilmoittamasta määrästä), 
                            ruoan grammamäärä per koiran painokilo on 45 % vähemmän kuin alle 10 kg painavan koiran*/
                            kuivaruoanmaara = (kuivaruoanmaara / 5 - kuivaruoanmaara / 5 *0.45) * paino * 0.5;
                            kuivaproteiini = kuivaproteiini / 100 * kuivaruoanmaara; 
                            kuivasinkki = kuivasinkki / 100 * kuivaruoanmaara;
                            kuivamsm = kuivamsm / 100 * kuivaruoanmaara;
                            kuivakondroitiini = kuivakondroitiini/ 100 * kuivaruoanmaara;
                            kuivaglukosamiini = kuivaglukosamiini / 100 * kuivaruoanmaara;
                        }
                        if(paino > 64){
                            /*lasketaan kuivaruoan määrä (50 % valmistajan ilmoittamasta määrästä), 
                            ruoan grammamäärä per koiran painokilo on 50 % vähemmän kuin alle 10 kg painavan koiran*/
                            kuivaruoanmaara = (kuivaruoanmaara / 5 - kuivaruoanmaara / 5 *0.50) * paino * 0.5;
                            kuivaproteiini = kuivaproteiini / 100 * kuivaruoanmaara; 
                            kuivasinkki = kuivasinkki / 100 * kuivaruoanmaara;
                            kuivamsm = kuivamsm / 100 * kuivaruoanmaara;
                            kuivakondroitiini = kuivakondroitiini/ 100 * kuivaruoanmaara;
                            kuivaglukosamiini = kuivaglukosamiini / 100 * kuivaruoanmaara;
                        }

                        //jos haiman vajaatoiminta on valittu, rasvaa ei ruoassa saisi olla yli 11 % eikä kuitua yli 3.5 %
                        if (lomaketiedot.haimanvajaatoiminta && kuivakuitu > 3.5) {

                            varoitus = `Huom. Valitsemasi kuivaruoka sisältää kuitua ${kuivakuitu} %, joka on yli suosituksen haiman vajaatoiminnan hoidossa.`

                        }
                        if (lomaketiedot.haimanvajaatoiminta && kuivarasva > 11) {

                            varoitus = `Huom. Valitsemasi kuivaruoka sisältää rasvaa ${kuivarasva} %, joka on yli suosituksen haiman vajaatoiminnan hoidossa.`

                        }

                        kuivatulos = {
                            "tuote" : kuivanappula,
                            "maara" : kuivaruoanmaara.toFixed(0),
                            "rasva" : kuivarasva,
                            "proteiini" : kuivaproteiini.toFixed(0),
                            "kuitu" : kuivakuitu,
                            "sinkki" : kuivasinkki.toFixed(0),
                            "msm" : kuivamsm.toFixed(0),
                            "kondroitiini" : kuivakondroitiini.toFixed(0),
                            "glukosamiini" : kuivaglukosamiini.toFixed(0),
                            "varoitus" : varoitus
                        }
                
                    }
                });

                callback(err, raakatulos, kuivatulos, tiedot);

            });

        });

    },
    
    "haeKayttaja" : (tunnus, callback) => {

        fs.readFile(kayttajaJSON, "utf-8", (err, data) => {

            if (err) throw err;

            let kayttajat = JSON.parse(data);

            let indeksi = kayttajat.findIndex((kayttaja) => {
                return kayttaja.tunnus == tunnus;

            });

            if (indeksi >= 0) {
                callback(kayttajat[indeksi]);

            } else {
                callback(null);
            }

        });

    },

    "lisaaKayttaja" : (uusi, callback) => {

        fs.readFile(kayttajaJSON, "utf-8", (err, data) => {

            let kayttajadata = JSON.parse(data);
             //   data = data.filter(function(x) { return x !== null });

            kayttajadata.push(uusi);

            fs.writeFile(kayttajaJSON, JSON.stringify(kayttajadata, null, 2), (err) => {

                callback(err);

            });

        });
        
    },

    "haeKoiraTiedot" : (kayttaja, callback) => {

        let kayttaja_id = kayttaja.id;

        fs.readFile(koiraJSON, "utf-8", (err, data) => {

            let koiradata = JSON.parse(data);
            koiradata = koiradata.filter(function(x) { return x !== null });

            let koirat =[];
            koiradata.forEach((koira) => {

                if (kayttaja_id == koira.kayttaja_id) {

                    if (koira.nimi == ""){
                        koira.nimi = koira.valmisKoira;
                    }

                    koirat.push(koira);
                } 
            });

            return callback(err, koirat);
        });

    },

    "tallennaTiedot" : (tiedot, callback) => {

        if(tiedot.nimi != ""){

            fs.readFile(koiraJSON, "utf-8", (err, data) => {

                let koiradata = JSON.parse(data);
                koiradata = koiradata.filter(function(x) { return x !== null });
    
                koiradata.push(tiedot);
    
                fs.writeFile(koiraJSON, JSON.stringify(koiradata, null, 2), (err) => {
    
                    callback(err);
    
                });
    
            });

        }

        if(tiedot.valmisKoira != ""){

            fs.readFile(koiraJSON, "utf-8", (err, data) => {

                let koiradata = JSON.parse(data);
                koiradata = koiradata.filter(function(x) { return x !== null });
    
                let i = 0;
                koiradata.forEach((koira) => {
                    i++;
                    if (koira.nimi === tiedot.valmisKoira){
                        i=i-1
                        delete koiradata[i];
                    }
                    if (koira.valmisKoira === tiedot.valmisKoira){
                        i=i-1
                        delete koiradata[i];
                    }
                });

                koiradata.push(tiedot);
    
                fs.writeFile(koiraJSON, JSON.stringify(koiradata, null, 2), (err) => {
    
                    let i = 0;

                    callback(err);
    
                });
    
            });

        }
    },

    "haeKaikkiKayttajat" : (callback) => {

        fs.readFile(kayttajaJSON, "utf-8", (err, data) => {
            let kayttajadata = JSON.parse(data);

            callback(kayttajadata, err);

        });
    }

}        
