const puppeteer = require("puppeteer");

(async() => {
    var urls_selection = [
        'https://test-english.com/grammar-points/a1/present-simple-forms-of-to-be',
    ]

    let url = urls_selection[0];
    let browser = await puppeteer.launch();
    let page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    let data = await page.evaluate(async() => {

        function recuperarObjDropdown(valorDropdown, exercicio, item) {
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

            return objDropdown;
        }

        var objLog = {};

        async function recuperarRespostas() {

            objLog.testando = true;

            $("#action-button").click();

            objLog.peloMenosChegouAqui1 = "?";

            setTimeout(function() {

                objLog.peloMenosChegouAqui2 = "??";

                $(".feedback-incorrect").each(function(index, item) {

                    objLog.peloMenosChegouAqui3 = "???";

                    var paragrafo = $(item).find("p")[0];
                    var filhosParagrafo = paragrafo.childNodes;
                    var linhaResposta = $(".findMe", filhosParagrafo).prevObject[0];
                    var textoLinhaResposta = $(linhaResposta)[0].innerHTML;
                    var respostas = textoLinhaResposta.replace("Correct answers: ", "").replace("Correct answer: ", "");

                    var arrayRespostas = respostas.split("/");


                    arrayRespostas.forEach(function(resp, i) {

                        objLog = {
                            "exercicio": index,
                            "resposta": resp,
                            "indexResposta": i,
                            "dropdownCorrente": pagina.exercicios[index].dropdowns[i]
                        };

                        pagina.exercicios[index].dropdowns[i].opcoes.find((opc, ind) => {

                            objLog.opcao = opc;

                            if (opc.valor.toLowerCase() === resp.toLowerCase()) {
                                objLog.dropSeraModificada = pagina.exercicios[index].dropdowns[i].opcoes[ind];
                                pagina.exercicios[index].dropdowns[i].opcoes[ind].correta = true;
                                objLog.dropAposModificada = pagina.exercicios[index].dropdowns[i].opcoes[ind];
                                return true;
                            }
                        });
                    });
                });

            }, 5000);
        }

        pagina = {
            titulo: $("#the_title_h1").text().replace("\n", ""),
            texto_exercicio: $($("#exercises").find("h3")[0]).text(),
            enunciado: $($("#exercises").find("h5")[0]).text(),
            exercicios: []
        }

        async function recuperarQuestoes() {
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

                                var objDropdown = recuperarObjDropdown(valorDropdown, exercicio, item);

                                exercicio.dropdowns.push(objDropdown);
                                break;
                            case "INPUT":
                                exercicio.questao += "(input)"
                                break;
                        }
                    }

                    pagina.exercicios.push(exercicio);
                }
            });

            console.log("Terminou ");
            await recuperarRespostas();
            console.log("Terminou 2");
        }

        await recuperarQuestoes();

        return objLog;

    });

    console.log(data);

    //await browser.close();
})();