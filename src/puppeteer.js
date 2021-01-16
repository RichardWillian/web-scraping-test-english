const puppeteer = require("puppeteer");

(async() => {
    let url = 'https://test-english.com/grammar-points/a1/present-simple-forms-of-to-be/';
    let browser = await puppeteer.launch();
    let page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    let data = await page.evaluate(() => {

        let pagina = {
            titulo: $("#the_title_h1").text().replace("\n", ""),
            texto_exercicio: $($("#exercises").find("h3")[0]).text(),
            enunciado: $($("#exercises").find("h5")[0]).text(),
            exercicios: []
        }

        var formulario = document.getElementsByClassName("quiz-form")[0];
        var questoesFormulario = formulario.getElementsByClassName("watu-question");

        questoesFormulario.forEach(function(questao, index) {

            var paragrafos = $(questao).find("p");

            var exercicio = {
                numero: index + 1,
                tipo: "",
                questao: "",
                dropdowns: []
            }

            for (var i = 0; i < paragrafos.length; i++) {

                var paragrafo = paragrafos[i];
                var elementosDentroParagrafo = paragrafo.childNodes;
                var elementosTagHTML = $('.FindMe', elementosDentroParagrafo);
                var itens = elementosTagHTML.prevObject;

                var valorDropdown = 0;

                for (var j = 0; j < itens.length; j++) {
                    var item = $(itens[j])[0];

                    switch (item.nodeName) {
                        case "SPAN":
                            // exercicio.questao += item.innerHTML + " - ";
                            break;
                        case "#text":
                            exercicio.questao += item.nodeValue;
                            break;
                        case "SELECT":

                            exercicio.tipo = "selection";
                            valorDropdown++;

                            var nomeDropdown = `(dropdown${valorDropdown})`;
                            exercicio.questao += nomeDropdown;

                            var objDropdown = {
                                nome: nomeDropdown,
                                opcoes: []
                            };

                            item.children.forEach(function(option) {
                                if (option.innerHTML) {
                                    objDropdown.opcoes.push({ valor: option.innerHTML });
                                }
                            });

                            exercicio.dropdowns.push(objDropdown);
                            break;
                        case "INPUT":
                            exercicio.questao += "(input)"
                            break;
                    }
                }

                pagina.exercicios.push(exercicio);
            }

            var alternativas = $(questao).find(".watupro-question-choice");

            if (alternativas) {

                for (var i = 0; i < alternativas.length; i++) {
                    var alternativa = alternativas[i];
                    console.log(alternativa.outerText)
                }
            }
        });

        return pagina;

    });

    console.log(data);

    debugger;

    await browser.close();
})();

// var alternativas = $(questao).find(".watupro-question-choice");

//             if (alternativas) {

//                 for (var i = 0; i < alternativas.length; i++) {
//                     var alternativa = alternativas[i];
//                     console.log(alternativa.outerText)
//                 }
//             }