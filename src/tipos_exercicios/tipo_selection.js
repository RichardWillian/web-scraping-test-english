const puppeteer = require("puppeteer");
const utils = require("../utils")

function recuperarQuestoesSelection() {

    return new Promise(async function(resolve) {

        let paginas = [];

        let urls_selection = [
            'https://test-english.com/grammar-points/a1/present-simple-forms-of-to-be',
            'https://test-english.com/grammar-points/a1/this-that-these-those/',
            'https://test-english.com/grammar-points/a1/possessive-adjectives/',
            'https://test-english.com/grammar-points/a1/a-an-plurals/',
            'https://test-english.com/grammar-points/a1/adjectives/',
            'https://test-english.com/grammar-points/a1/present-simple/',
            'https://test-english.com/grammar-points/a1/object-pronouns/',
            'https://test-english.com/grammar-points/a1/whose-possessive-s/',
            'https://test-english.com/grammar-points/a1/at-in-on-prepositions-time/',
            'https://test-english.com/grammar-points/a1/at-in-on-prepositions-of-place/',
            'https://test-english.com/grammar-points/a1/can-cant/',
            'https://test-english.com/grammar-points/a1/present-simple-present-continuous/',
            'https://test-english.com/grammar-points/a1/was-were/',
            'https://test-english.com/grammar-points/a1/past-simple-negatives-questions/',
            'https://test-english.com/grammar-points/a1/verbs-infinitive-verbs-ing/',
            'https://test-english.com/grammar-points/a1/a-some-any-countable-uncountable/',
            'https://test-english.com/grammar-points/a1/there-it/',
            'https://test-english.com/grammar-points/a1/next-to-under-between-in-front-behind-etc/',
            'https://test-english.com/grammar-points/a1/much-many-lot-little-few/',
            'https://test-english.com/grammar-points/a1/adverbs-manner/',
            'https://test-english.com/grammar-points/a1/a-an-the-no-article/',
            'https://test-english.com/grammar-points/a1/a-an-the-no-article/3/',
            'https://test-english.com/grammar-points/a1/conjunctions_and-but-or-so-because/',
            'https://test-english.com/grammar-points/a1/basic-word-order-in-english/'
        ]

        
        urls_selection.forEach(async(url) => {
            console.log(`Início Scrapping: ${url}`);
            
            let browser = await puppeteer.launch();
            let page = await browser.newPage();
            
            await page.setDefaultNavigationTimeout(0);
            await page.goto(url, { waitUntil: "networkidle2" });
            
            let data = await page.evaluate(async() => {

                function delay(time) {
                    return new Promise(function(resolve) {
                        setTimeout(resolve, time)
                    });
                }

                function recuperarObjetoDropdown(valorDropdown, exercicio, item) {
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

                    $("#action-button").click();

                    await delay(4000);

                    let indexIncorreto = false;
                    $(".watupro-main-feedback").find("p").each((index, paragrafo) => {
                        let arrayRespostas = [];
                        let arrayExplicacoes = [];

                        if(indexIncorreto || paragrafo.innerText.trim() == "") {
                            --index;
                            indexIncorreto = true;
                        }

                        if (paragrafo.innerHTML) {
                            let linhaInformacoesHTML = paragrafo.innerHTML;
                            
                            let linhaInformacoesSplitada = linhaInformacoesHTML.replace("&nbsp;", "").split("<br>");
                            
                            linhaInformacoesSplitada.forEach((informacaoSplitada) => {

                                if (informacaoSplitada != "") {

                                    let paragrafoRespostaSingular = informacaoSplitada.includes("Correct answer");
                                    let paragrafoRespostaPlural = informacaoSplitada.includes("Correct answers");

                                    if (paragrafoRespostaSingular || paragrafoRespostaPlural) {
                                        let linhaResposta = $(informacaoSplitada)[0].innerText;
                                            linhaResposta = linhaResposta.replace("Correct answers", "")
                                            linhaResposta = linhaResposta.replace("Correct answer", "")
                                            linhaResposta = linhaResposta.replace(": ", "");
                                            arrayRespostas = linhaResposta.split("/");
                                    } else {
                                        arrayExplicacoes.push(informacaoSplitada);
                                    }
                                }
                            });
                        }

                        arrayRespostas.forEach(function(resp, i) {
                            pagina.exercicios[index]?.dropdowns[i].opcoes.find((opc, ind) => {
                                
                                if (opc.valor.toLowerCase() === resp.toLowerCase()) {
                                    pagina.exercicios[index].dropdowns[i].opcoes[ind].correta = true;
                                    pagina.exercicios[index].dropdowns[i].opcoes[ind].explicacao = arrayExplicacoes[ind];

                                    if(!arrayExplicacoes[ind])
                                        pagina.exercicios[index].dropdowns[i].opcoes[ind].explicacao = arrayExplicacoes.pop();

                                    return true;
                                }
                            });
                        });
                    });
                }

                let exemplo = "";
                $("#exercises").find("em").each((index, $em) => {
                    if($em?.innerHTML?.includes("EXAMPLE")) {
                        exemplo = $em?.innerHTML;
                    }
                });

                let srcImagemExemplo;
                let srcImagemExercicio;

                $("#exercises").find("img").each((index, img) => {
                    let imagemLoading = "img/loading.gif";
                    let srcImagem = $(img).attr('src');

                    if(!srcImagem.includes(imagemLoading)) {
                        if (index == 0) srcImagemExercicio = srcImagem;
                        else if (index == 1) srcImagemExemplo = srcImagem;
                    }
                });

                let pagina = {
                    url: window.location.href,
                    titulo: $("#the_title_h1").text().replace("\n", ""),
                    texto_exercicio: $($("#exercises").find("h3")[0]).text(),
                    enunciado: $($("#exercises").find("h5")[0]).text(),
                    imagemExercicio: srcImagemExercicio,
                    exemplo: {
                        descricao: exemplo,
                        imagem: srcImagemExemplo
                    },
                    dicas: $("#exercises").find(".textBox")[0]?.innerHTML,
                    exercicios: []
                }

                async function recuperarQuestoes() {
                    try {
                        var formulario = document.getElementsByClassName("quiz-form")[0];
                        var questoesFormulario = formulario.getElementsByClassName("watu-question");

                        questoesFormulario.forEach(function(questao, index) {

                            var paragrafos = $(questao).find("p");

                            var exercicio = {
                                numero: index + 1,
                                tipo: "selection",
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
                                        case "#text":
                                            exercicio.questao += item.nodeValue;
                                            break;
                                        case "SELECT":
                                            valorDropdown++;

                                            var objDropdown = recuperarObjetoDropdown(valorDropdown, exercicio, item);

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

                        await recuperarRespostas();
                    } catch (ex) {
                        console.log(ex, "Erro no exercício" + JSON.stringify(pagina));
                    }
                }

                await recuperarQuestoes();

                return pagina;

            });

            await browser.close();

            paginas.push(data);

            console.log(`Fim Scrapping: ${url}`);
        });

        let contador = 1;
        while (true) {

            if (paginas.length == urls_selection.length) {
                resolve(paginas);
                return;
            }

            await utils.delay(1000);
            console.log(`Segundos ${contador++}`);
        }
    });
}

module.exports = { recuperarQuestoesSelection }