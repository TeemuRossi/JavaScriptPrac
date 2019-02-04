//Alustetaan muutamat muuttujat myöhempää käyttöä varten

// tzoffset ja aika hakevat tämän hetkisen kellonajan ja sovittavat ne
// oikeaan aikavyöhykkeeseen
var tzoffset = (new Date()).getTimezoneOffset() * 60000;
let aika = (new Date(Date.now() - tzoffset)).toISOString();
var lähtöasema = "";
var määränpää = "";

// AutoComplete pluginin alustusfunktio
$(document).ready(function() {
  $('#error').hide();
  $('#junat').hide();
  $('#lähijunat').hide();
  $('#kaukojunat').hide();
  $('#spinny').hide();

  //Asetukset asemaehdotuksille
  var options = {

    //AutoComplete hakee asemien nimet asemat.json tiedostosta
    url: "asemat.json",
    dataType: "JSON",

    getValue: "nimi",

    list: {
      match: {
        enabled: true
      }
    },

    theme: "square"
  };
  // AutoComplete suoritetaan kun teksti muuttu kentässä
  $("#asema1").easyAutocomplete(options);
  $("#asema2").easyAutocomplete(options);
})

// pääfunktio jota käytetään "Etsi junat painikkeessa"
function inputAsemat() {

  //piilotetaan #junat taulu kokonaan, ettei taulun otsikot jää kummittelemaan
  $('#junat').hide();

  //haetaan valuet input-kentistä
  var asema1 = $('#asema1').val();
  var asema2 = $('#asema2').val();

  // alustetaan globaalit muuttujat "lähtöasema" ja "määränpää", koska muutokset näihin tallentuvat globaalisti alla olevissa toiminnoissa
  lähtöasema = "";
  määränpää = "";

  //tässä haetaan asemakoodit json:sta for loopilla, inputissa annetuilla arvoilla esim. Tikkurila arvolla haetaan sen lyhenne asemakoodi
  //joka sijoitetaan määränpää tai lähtöasema muuttujiin myöhempää käyttöä varten
  $.ajax({
    url: "asemat.json",
    dataType: 'json',
    success: function(result) {
      for (var i = 0; i < result.length; i++) {
        if(result[i].nimi == asema1) {
          lähtöasema = result[i].koodi;
          console.log(lähtöasema);
        }

        if(result[i].nimi == asema2) {
          määränpää = result[i].koodi;
          console.log(määränpää);
        }

      }
      //jos asemat löytyvät, suoritetaan funktio lataaJunat
      //muuten näytetään virhetxt
      if(lähtöasema != "" && määränpää != "") {
        lataaJunat();
      } else {
        $('#error').show();
        $('#junat').hide();
      }

    }
  })

}

//Funktio, jolla sovellus hakee junat, jotka kulkevat annettujen asemien välillä
function lataaJunat() {
  // Tyhjennetään ja piilotetaan taulu ja näytetään latauskuvake
  $('#error').hide();
  $('#taulukeho1').html('');
  $('#taulukeho2').html('');
  $('#spinny').show();
  var iterator = 0;
  var iterator2 = 0;

  //rakennetaan osoite, josta junat haetaan
  var url = "https://rata.digitraffic.fi/api/v1/live-trains/station/" + lähtöasema + "/" + määränpää + "?startDate=" + aika + "&limit=50";

  $.ajax({
    url: url,
    dataType: 'json',
    success: function(result) {
      if (result.queryString != null) {
        $('#junat').hide();
        $('#error').show();
        $('#spinny').hide();

      }






      for (var i = 0; i < result.length; i++) {
        if (result[i].trainCategory == "Commuter") {
          iterator++;
        } else {
          iterator2++;
        }
      }
      if (iterator > iterator2) {

        lataaLähiJunat();
        $('#spinny').hide();
      } else if (iterator2 > iterator) {
        lataaKaukoJunat();
        $('#spinny').hide();
      }
    }
  })
}

function lataaLähiJunat() {

  $('#error').hide();
  $('#taulukeho1').html('');
  $('#taulukeho2').html('');
  var iterator = 20;
  var iterator2 = 20;
  var url = "https://rata.digitraffic.fi/api/v1/live-trains/station/" + lähtöasema + "/" + määränpää + "?startDate=" + aika + "&limit=50";

  $.ajax({
      url: url,
      dataType: 'json',
      success: function(result) {
        if (result.queryString != null) {
          $('#error').show();

        }

        $('#junat').show();




        for (var i = 0; i < 20;) {
          for (var j = 0; j < result[i].timeTableRows.length; j++) {

            if (result[i].timeTableRows[j].stationShortCode == lähtöasema && result[i].timeTableRows[j].type == "DEPARTURE" && result[i].commuterLineID != "") {
              var saapumisaika = new Date(result[i].timeTableRows[j].scheduledTime);
              var peruna = `
                          <tr>
                            <td>` + result[i].commuterLineID + `</td>
                            <td>` + result[i].timeTableRows[j].commercialTrack + `</td>
                            <td>` + saapumisaika.toUTCString().slice(17, 22) + `</td>
                            <td>
                          `;

            }
            if (result[i].timeTableRows[j].stationShortCode == määränpää && result[i].timeTableRows[j].type == "ARRIVAL" && result[i].commuterLineID != "") {

              var perilläaika = new Date(result[i].timeTableRows[j].scheduledTime);
              $('#taulukeho1').append(peruna + perilläaika.toUTCString().slice(17, 22) + `</td>
                      </tr>
                    `);

            }

          }
          i++;
        }


      }
    }





  )



}

function lataaKaukoJunat() {

  $('#error').hide();
  $('#taulukeho1').html('');
  $('#taulukeho2').html('');
  var iterator = 20;
  var iterator2 = 20;
  var url = "https://rata.digitraffic.fi/api/v1/live-trains/station/" + lähtöasema + "/" + määränpää + "?startDate=" + aika + "&limit=50";

  $.ajax({
      url: url,
      dataType: 'json',
      success: function(result) {
        if (result.queryString != null) {
          $('#error').show();

        }

        $('#junat').show();




        for (var i = 0; i < result.length; i++)

          for (var j = 0; j < result[i].timeTableRows.length; j++) {

            if (result[i].timeTableRows[j].stationShortCode == lähtöasema && result[i].timeTableRows[j].type == "DEPARTURE" && result[i].trainCategory == "Long-distance") {
              var saapumisaika = new Date(result[i].timeTableRows[j].scheduledTime);
              if (result[i].trainType == "IC") {
                var trainType = "Intercity";
              } else if (result[i].trainType == "S") {
                var trainType = "Pendolino";
              } else if (result[i].trainType == "PYO") {
                var trainType = "Yöjuna";
              }
              var peruna = `
                          <tr>
                            <td>` + trainType + `</td>
                            <td>` + result[i].timeTableRows[j].commercialTrack + `</td>
                            <td>` + saapumisaika.toUTCString().slice(17, 22) + `</td>
                            <td>
                          `;

            }
            if (result[i].timeTableRows[j].stationShortCode == määränpää && result[i].timeTableRows[j].type == "ARRIVAL" && result[i].trainCategory == "Long-distance") {

              var perilläaika = new Date(result[i].timeTableRows[j].scheduledTime);
              console.log(perilläaika.toUTCString().slice(17, 22));
              $('#taulukeho1').append(peruna + perilläaika.toUTCString().slice(17, 22) + `</td>
                      </tr>
                    `);

            }

          }

      }


    }






  )



}
